-- ============================================================
-- Migration 00007: Operational layer
-- No-shows, verified reviews, blocks, semesters, course
-- submissions, support tickets, subscription enforcement.
-- ============================================================

-- ============================================================
-- 1. EXTEND notification_type ENUM
-- ============================================================
do $$
begin
  if not exists (select 1 from pg_enum where enumtypid='notification_type'::regtype and enumlabel='no_show_reported') then
    alter type notification_type add value 'no_show_reported';
  end if;
  if not exists (select 1 from pg_enum where enumtypid='notification_type'::regtype and enumlabel='semester_ended') then
    alter type notification_type add value 'semester_ended';
  end if;
  if not exists (select 1 from pg_enum where enumtypid='notification_type'::regtype and enumlabel='account_suspended') then
    alter type notification_type add value 'account_suspended';
  end if;
end $$;

-- ============================================================
-- 2. NO_SHOWS
-- ============================================================
create type if not exists no_show_party as enum ('student', 'tutor');

create table if not exists public.no_shows (
  id             uuid primary key default gen_random_uuid(),
  session_id     uuid not null references public.sessions(id) on delete cascade,
  reported_by    uuid not null references public.profiles(id) on delete cascade,
  no_show_party  no_show_party not null,
  notes          text not null default '',
  created_at     timestamptz not null default now(),
  unique (session_id, no_show_party)   -- one report per party per session
);
comment on table public.no_shows is 'No-show reports from either session participant';
create index if not exists idx_no_shows_session   on public.no_shows(session_id);
create index if not exists idx_no_shows_reporter  on public.no_shows(reported_by);

alter table public.no_shows enable row level security;

-- Only the two session participants can insert
create policy "Session participants can report no-show"
  on public.no_shows for insert
  to authenticated
  with check (
    reported_by = auth.uid()
    and exists (
      select 1 from public.sessions s
      where s.id = session_id
        and (s.student_id = auth.uid() or s.tutor_id = auth.uid())
    )
  );

-- Both participants can read no-shows on their sessions
create policy "Session participants can read no-shows"
  on public.no_shows for select
  to authenticated
  using (
    reported_by = auth.uid()
    or exists (
      select 1 from public.sessions s
      where s.id = session_id
        and (s.student_id = auth.uid() or s.tutor_id = auth.uid())
    )
  );

-- ── no_show_count views ──────────────────────────────────────
create or replace view public.student_no_show_counts as
select p.id as student_id, count(ns.id)::integer as no_show_count
from public.profiles p
left join public.sessions s on s.student_id = p.id
left join public.no_shows ns on ns.session_id = s.id and ns.no_show_party = 'student'
where p.role = 'student'
group by p.id;

create or replace view public.tutor_no_show_counts as
select p.id as tutor_id, count(ns.id)::integer as no_show_count
from public.profiles p
left join public.sessions s on s.tutor_id = p.id
left join public.no_shows ns on ns.session_id = s.id and ns.no_show_party = 'tutor'
where p.role = 'tutor'
group by p.id;

-- ── suspended_until on profiles ──────────────────────────────
alter table public.profiles
  add column if not exists suspended_until timestamptz;
comment on column public.profiles.suspended_until is 'When set, student account is suspended until this timestamp';

-- ── Trigger: auto-suspend student after 3 no-shows ──────────
create or replace function public.check_no_show_suspension()
returns trigger as $$
declare
  ncount integer;
  target_student uuid;
  target_tutor   uuid;
begin
  -- Identify the student/tutor for the session
  select student_id, tutor_id into target_student, target_tutor
    from public.sessions where id = new.session_id;

  if new.no_show_party = 'student' then
    select count(*)::integer into ncount
      from public.no_shows ns
      join public.sessions s on s.id = ns.session_id
      where ns.no_show_party = 'student' and s.student_id = target_student;

    if ncount >= 3 then
      update public.profiles set suspended_until = now() + interval '14 days'
        where id = target_student;
      insert into public.notifications (user_id, type, title, body, link)
        values (target_student, 'account_suspended',
          'Account temporarily suspended',
          'You have 3 or more no-shows. Your account is suspended for 14 days.',
          '/sessions');
    end if;

    -- Notify the tutor about the no-show report
    insert into public.notifications (user_id, type, title, body, link)
      values (target_tutor, 'no_show_reported',
        'No-show reported',
        'You reported a student no-show. Payment is still due per our terms.',
        '/sessions');

  elsif new.no_show_party = 'tutor' then
    select count(*)::integer into ncount
      from public.no_shows ns
      join public.sessions s on s.id = ns.session_id
      where ns.no_show_party = 'tutor' and s.tutor_id = target_tutor;

    if ncount >= 3 then
      update public.profiles set paused_until = 'infinity'::timestamptz
        where id = target_tutor;
    end if;

    -- Notify the tutor
    insert into public.notifications (user_id, type, title, body, link)
      values (target_tutor, 'no_show_reported',
        'No-show reported against you',
        'A student reported you as a no-show. Contact support if this is incorrect.',
        '/tutor/requests');
  end if;

  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists trg_no_show_suspension on public.no_shows;
create trigger trg_no_show_suspension
  after insert on public.no_shows
  for each row execute function public.check_no_show_suspension();

-- ============================================================
-- 3. VERIFIED-BOOKING-ONLY REVIEWS
-- ============================================================

-- Make session_id NOT NULL on reviews (backfill nulls first)
-- Step 1: try to match existing orphan reviews to completed sessions
update public.reviews r
set session_id = (
  select s.id from public.sessions s
  where s.student_id = r.student_id
    and s.tutor_id   = r.tutor_id
    and s.status     = 'completed'
  order by s.date desc
  limit 1
)
where r.session_id is null;

-- Step 2: delete any reviews that still have no matching session
delete from public.reviews where session_id is null;

-- Step 3: enforce NOT NULL
alter table public.reviews
  alter column session_id set not null;

-- ── can_review() helper ──────────────────────────────────────
create or replace function public.can_review(
  p_student_id uuid,
  p_tutor_id   uuid,
  p_session_id uuid
) returns boolean
language sql security definer stable as $$
  select exists (
    select 1 from public.sessions s
    where s.id         = p_session_id
      and s.student_id = p_student_id
      and s.tutor_id   = p_tutor_id
      and s.status     = 'completed'
      -- no cancellation metadata
      and s.cancelled_at is null
      -- no no-show for this session
      and not exists (
        select 1 from public.no_shows ns
        where ns.session_id = p_session_id
      )
  )
$$;

-- ── RLS: restrict reviews insert to verified sessions ────────
drop policy if exists "Students can create reviews" on public.reviews;
create policy "Students can create verified reviews"
  on public.reviews for insert
  to authenticated
  with check (
    student_id = auth.uid()
    and public.can_review(auth.uid(), tutor_id, session_id)
  );

-- ============================================================
-- 4. BLOCKS
-- ============================================================
create table if not exists public.blocks (
  id          uuid primary key default gen_random_uuid(),
  blocker_id  uuid not null references public.profiles(id) on delete cascade,
  blocked_id  uuid not null references public.profiles(id) on delete cascade,
  created_at  timestamptz not null default now(),
  unique (blocker_id, blocked_id),
  check (blocker_id != blocked_id)
);
comment on table public.blocks is 'User blocks — bidirectional visibility suppression';
create index if not exists idx_blocks_blocker on public.blocks(blocker_id);
create index if not exists idx_blocks_blocked on public.blocks(blocked_id);

alter table public.blocks enable row level security;

create policy "Users manage their own blocks"
  on public.blocks for all
  to authenticated
  using (blocker_id = auth.uid())
  with check (blocker_id = auth.uid());

-- Blocked user can see they're blocked (so they know why messages fail)
create policy "Blocked users can read their block status"
  on public.blocks for select
  to authenticated
  using (blocked_id = auth.uid());

-- ============================================================
-- 5. SEMESTERS
-- ============================================================
create type if not exists semester_term as enum ('fall', 'spring', 'summer');

create table if not exists public.semesters (
  id             uuid primary key default gen_random_uuid(),
  university_id  text not null references public.universities(id) on delete cascade,
  name           text not null,
  term           semester_term not null,
  start_date     date not null,
  end_date       date not null,
  is_current     boolean not null default false,
  source_url     text not null default '',
  last_synced_at timestamptz,
  created_at     timestamptz not null default now()
);
comment on table public.semesters is 'Academic semesters per university with official calendar dates';
create index if not exists idx_semesters_university on public.semesters(university_id);
create index if not exists idx_semesters_current on public.semesters(is_current) where is_current = true;

alter table public.semesters enable row level security;

create policy "Public can read semesters"
  on public.semesters for select
  to anon, authenticated
  using (true);

-- ── Seed semester data ───────────────────────────────────────
-- AUB: https://www.aub.edu.lb/Registrar/Documents/calendars/calendar2025-26.pdf
-- LAU: https://www.lau.edu.lb/calendar/ (2025-2026)
-- NDU: https://www.ndu.edu.lb/academics/academic-calendar
insert into public.semesters (university_id, name, term, start_date, end_date, is_current, source_url)
values
  -- AUB 2025-2026
  ('aub', 'Fall 2025-2026',   'fall',   '2025-09-01', '2025-12-20', true,
   'https://www.aub.edu.lb/Registrar/Documents/calendars/calendar2025-26.pdf'),
  ('aub', 'Spring 2025-2026', 'spring', '2026-01-26', '2026-05-23', false,
   'https://www.aub.edu.lb/Registrar/Documents/calendars/calendar2025-26.pdf'),
  ('aub', 'Summer 2025-2026', 'summer', '2026-06-08', '2026-08-15', false,
   'https://www.aub.edu.lb/Registrar/Documents/calendars/calendar2025-26.pdf'),

  -- LAU 2025-2026
  ('lau', 'Fall 2025-2026',   'fall',   '2025-09-08', '2025-12-19', true,
   'https://www.lau.edu.lb/calendar/'),
  ('lau', 'Spring 2025-2026', 'spring', '2026-01-19', '2026-05-15', false,
   'https://www.lau.edu.lb/calendar/'),
  ('lau', 'Summer 2025-2026', 'summer', '2026-06-01', '2026-08-14', false,
   'https://www.lau.edu.lb/calendar/'),

  -- NDU 2025-2026
  ('ndu', 'Fall 2025-2026',   'fall',   '2025-09-08', '2025-12-22', true,
   'https://www.ndu.edu.lb/academics/academic-calendar'),
  ('ndu', 'Spring 2025-2026', 'spring', '2026-01-26', '2026-05-29', false,
   'https://www.ndu.edu.lb/academics/academic-calendar'),
  ('ndu', 'Summer 2025-2026', 'summer', '2026-06-08', '2026-08-21', false,
   'https://www.ndu.edu.lb/academics/academic-calendar')
on conflict do nothing;

-- ── Per-student semester end override ───────────────────────
-- student_courses already exists; add nullable override column
alter table public.student_courses
  add column if not exists semester_end_override date;
comment on column public.student_courses.semester_end_override is
  'Student-overridden semester end date; overrides university default when set';

-- ============================================================
-- 6. COURSE SUBMISSIONS
-- ============================================================
create type if not exists course_submission_status as enum ('pending', 'approved', 'rejected');

create table if not exists public.course_submissions (
  id            uuid primary key default gen_random_uuid(),
  submitted_by  uuid not null references public.profiles(id) on delete cascade,
  university_id text not null references public.universities(id) on delete cascade,
  code          text not null,
  name          text not null,
  subject       text not null default '',
  notes         text not null default '',
  status        course_submission_status not null default 'pending',
  created_at    timestamptz not null default now(),
  reviewed_at   timestamptz
);
comment on table public.course_submissions is 'User-submitted course requests for admin review';
create index if not exists idx_course_submissions_user on public.course_submissions(submitted_by);
create index if not exists idx_course_submissions_status on public.course_submissions(status);

alter table public.course_submissions enable row level security;

create policy "Users can submit and read own course submissions"
  on public.course_submissions for all
  to authenticated
  using (submitted_by = auth.uid())
  with check (submitted_by = auth.uid());

-- ============================================================
-- 7. SUPPORT TICKETS
-- ============================================================
create type if not exists ticket_status as enum ('open', 'in_progress', 'resolved', 'closed');

create table if not exists public.support_tickets (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.profiles(id) on delete cascade,
  subject    text not null,
  message    text not null,
  status     ticket_status not null default 'open',
  created_at timestamptz not null default now()
);
comment on table public.support_tickets is 'User support ticket submissions';
create index if not exists idx_support_tickets_user on public.support_tickets(user_id);

alter table public.support_tickets enable row level security;

create policy "Users insert and read own support tickets"
  on public.support_tickets for all
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- ============================================================
-- 8. SUBSCRIPTION ADMIN (extend tutor_subscriptions RLS)
-- ============================================================
-- Allow service_role full access for admin operations
-- (The admin page uses the same authenticated user but checks
-- VITE_ADMIN_USER_IDS on the client before allowing mutations.)

-- Anyone authenticated can now update subscription (admin check in app layer)
-- We keep the existing policies but add service_role bypass as a note.
-- The actual admin enforcement is done via the VITE_ADMIN_USER_IDS check
-- in the admin UI component — no additional DB policy needed here.

-- ============================================================
-- 9. USEFUL INDEXES
-- ============================================================
create index if not exists idx_no_shows_party_student
  on public.no_shows(no_show_party) where no_show_party = 'student';
create index if not exists idx_sessions_started
  on public.sessions(date, time);
create index if not exists idx_profiles_suspended
  on public.profiles(suspended_until) where suspended_until is not null;
