-- ============================================================
-- Tutr — Missing Tables Migration
-- Creates all tables the app references that may not exist yet.
-- Uses CREATE TABLE IF NOT EXISTS so it's safe to re-run and
-- won't touch existing tables.
--
-- Run this ONCE in the Supabase SQL Editor.
-- ============================================================

create extension if not exists "pgcrypto";

-- ============================================================
-- MESSAGES — conversations between students and tutors
-- ============================================================
create table if not exists public.conversations (
  id              uuid primary key default gen_random_uuid(),
  student_id      uuid not null references public.profiles(id) on delete cascade,
  tutor_id        uuid not null references public.profiles(id) on delete cascade,
  last_message_at timestamptz not null default now(),
  created_at      timestamptz not null default now(),
  unique (student_id, tutor_id),
  check (student_id != tutor_id)
);
create index if not exists idx_conversations_student on public.conversations(student_id);
create index if not exists idx_conversations_tutor on public.conversations(tutor_id);
create index if not exists idx_conversations_last_message_at on public.conversations(last_message_at);

create table if not exists public.messages (
  id              uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  sender_id       uuid not null references public.profiles(id) on delete cascade,
  body            text not null,
  read            boolean not null default false,
  created_at      timestamptz not null default now()
);
create index if not exists idx_messages_conversation on public.messages(conversation_id);
create index if not exists idx_messages_sender on public.messages(sender_id);
create index if not exists idx_messages_created_at on public.messages(created_at);

-- Trigger: bump conversations.last_message_at when a new message is inserted
create or replace function public.bump_conversation_last_message()
returns trigger as $$
begin
  update public.conversations
    set last_message_at = new.created_at
  where id = new.conversation_id;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists trg_bump_conversation_last_message on public.messages;
create trigger trg_bump_conversation_last_message
  after insert on public.messages
  for each row execute function public.bump_conversation_last_message();

-- ============================================================
-- AVAILABILITY — tutor weekly schedule slots
-- ============================================================
create table if not exists public.availability (
  id          uuid primary key default gen_random_uuid(),
  tutor_id    uuid not null references public.profiles(id) on delete cascade,
  day_of_week smallint not null check (day_of_week between 0 and 6),
  start_time  time not null,
  end_time    time not null,
  created_at  timestamptz not null default now(),
  check (end_time > start_time)
);
create index if not exists idx_availability_tutor on public.availability(tutor_id);

-- ============================================================
-- STUDENT_COURSES — courses a student is enrolled in
-- ============================================================
create table if not exists public.student_courses (
  id         uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles(id) on delete cascade,
  course_id  uuid not null references public.courses(id) on delete cascade,
  semester   text not null default '',
  created_at timestamptz not null default now(),
  unique (student_id, course_id)
);
create index if not exists idx_student_courses_student on public.student_courses(student_id);
create index if not exists idx_student_courses_course on public.student_courses(course_id);

-- ============================================================
-- SAVED_TUTORS — students' favorited tutors
-- ============================================================
create table if not exists public.saved_tutors (
  id         uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles(id) on delete cascade,
  tutor_id   uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (student_id, tutor_id),
  check (student_id != tutor_id)
);
create index if not exists idx_saved_tutors_student on public.saved_tutors(student_id);
create index if not exists idx_saved_tutors_tutor on public.saved_tutors(tutor_id);

-- ============================================================
-- REPORTS — user-submitted reports about tutors
-- ============================================================
create table if not exists public.reports (
  id                uuid primary key default gen_random_uuid(),
  reporter_id       uuid not null references public.profiles(id) on delete cascade,
  reported_tutor_id uuid not null references public.profiles(id) on delete cascade,
  reason            text not null check (reason in ('inappropriate', 'no_show', 'misrepresented_grades', 'other')),
  details           text not null default '',
  status            text not null default 'pending' check (status in ('pending', 'reviewed', 'dismissed', 'actioned')),
  created_at        timestamptz not null default now(),
  check (reporter_id != reported_tutor_id)
);
create index if not exists idx_reports_reporter on public.reports(reporter_id);
create index if not exists idx_reports_tutor on public.reports(reported_tutor_id);
create index if not exists idx_reports_status on public.reports(status);

-- ============================================================
-- NOTIFICATIONS — in-app alerts for a user
-- ============================================================
create table if not exists public.notifications (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.profiles(id) on delete cascade,
  type       text not null,
  title      text not null default '',
  body       text not null default '',
  link       text,
  read       boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists idx_notifications_user on public.notifications(user_id);
create index if not exists idx_notifications_read on public.notifications(read);
create index if not exists idx_notifications_created_at on public.notifications(created_at);

-- ============================================================
-- NO_SHOWS — reports of missed sessions
-- ============================================================
create table if not exists public.no_shows (
  id              uuid primary key default gen_random_uuid(),
  session_id      uuid not null references public.sessions(id) on delete cascade,
  reported_by     uuid not null references public.profiles(id) on delete cascade,
  no_show_party   text not null check (no_show_party in ('student', 'tutor')),
  notes           text not null default '',
  created_at      timestamptz not null default now()
);
create index if not exists idx_no_shows_session on public.no_shows(session_id);
create index if not exists idx_no_shows_reported_by on public.no_shows(reported_by);

-- Views for per-user no-show counts (used by the app to show warnings)
drop view if exists public.student_no_show_counts;
create view public.student_no_show_counts as
select
  s.student_id,
  count(*) as no_show_count
from public.no_shows ns
join public.sessions s on s.id = ns.session_id
where ns.no_show_party = 'student'
group by s.student_id;

drop view if exists public.tutor_no_show_counts;
create view public.tutor_no_show_counts as
select
  s.tutor_id,
  count(*) as no_show_count
from public.no_shows ns
join public.sessions s on s.id = ns.session_id
where ns.no_show_party = 'tutor'
group by s.tutor_id;

-- ============================================================
-- BLOCKS — user-level blocking
-- ============================================================
create table if not exists public.blocks (
  id         uuid primary key default gen_random_uuid(),
  blocker_id uuid not null references public.profiles(id) on delete cascade,
  blocked_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (blocker_id, blocked_id),
  check (blocker_id != blocked_id)
);
create index if not exists idx_blocks_blocker on public.blocks(blocker_id);
create index if not exists idx_blocks_blocked on public.blocks(blocked_id);

-- ============================================================
-- PROFILE_VIEWS — impression log for tutor profiles
-- ============================================================
create table if not exists public.profile_views (
  id         uuid primary key default gen_random_uuid(),
  tutor_id   uuid not null references public.profiles(id) on delete cascade,
  viewer_id  uuid references public.profiles(id) on delete set null,
  viewed_at  timestamptz not null default now()
);
create index if not exists idx_profile_views_tutor on public.profile_views(tutor_id);
create index if not exists idx_profile_views_viewed_at on public.profile_views(viewed_at);

-- ============================================================
-- TUTOR_SUBSCRIPTIONS — monthly subscription records
-- ============================================================
create table if not exists public.tutor_subscriptions (
  id                 uuid primary key default gen_random_uuid(),
  tutor_id           uuid not null references public.profiles(id) on delete cascade,
  status             text not null default 'active' check (status in ('active', 'grace_period', 'inactive')),
  current_period_end timestamptz,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now(),
  unique (tutor_id)
);
create index if not exists idx_tutor_subs_tutor on public.tutor_subscriptions(tutor_id);
create index if not exists idx_tutor_subs_status on public.tutor_subscriptions(status);

-- ============================================================
-- TUTOR_BOOSTS — discoverability boosts purchased by tutors
-- ============================================================
create table if not exists public.tutor_boosts (
  id         uuid primary key default gen_random_uuid(),
  tutor_id   uuid not null references public.profiles(id) on delete cascade,
  active     boolean not null default false,
  started_at timestamptz,
  ends_at    timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists idx_tutor_boosts_tutor on public.tutor_boosts(tutor_id);
create index if not exists idx_tutor_boosts_active on public.tutor_boosts(active);

-- ============================================================
-- SEMESTERS — academic semester periods
-- ============================================================
create table if not exists public.semesters (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  start_date date not null,
  end_date   date not null,
  is_current boolean not null default false,
  created_at timestamptz not null default now(),
  check (end_date > start_date)
);
create index if not exists idx_semesters_current on public.semesters(is_current);

-- ============================================================
-- COURSE_SUBMISSIONS — user-submitted new course suggestions
-- ============================================================
create table if not exists public.course_submissions (
  id            uuid primary key default gen_random_uuid(),
  submitter_id  uuid not null references public.profiles(id) on delete cascade,
  university_id text not null references public.universities(id) on delete cascade,
  code          text not null,
  name          text not null,
  subject       text not null default '',
  status        text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  created_at    timestamptz not null default now()
);
create index if not exists idx_course_submissions_status on public.course_submissions(status);
create index if not exists idx_course_submissions_submitter on public.course_submissions(submitter_id);

-- ============================================================
-- SUPPORT_TICKETS — user-submitted help requests
-- ============================================================
create table if not exists public.support_tickets (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.profiles(id) on delete cascade,
  subject    text not null,
  body       text not null,
  status     text not null default 'open' check (status in ('open', 'in_progress', 'closed')),
  created_at timestamptz not null default now()
);
create index if not exists idx_support_tickets_user on public.support_tickets(user_id);
create index if not exists idx_support_tickets_status on public.support_tickets(status);

-- ============================================================
-- TRENDING_TUTORS VIEW — most profile-viewed tutors this week
-- ============================================================
drop view if exists public.trending_tutors;
create view public.trending_tutors as
select
  p.*,
  coalesce(view_counts.views, 0) as weekly_views
from public.profiles p
left join (
  select tutor_id, count(*) as views
  from public.profile_views
  where viewed_at > now() - interval '7 days'
  group by tutor_id
) view_counts on view_counts.tutor_id = p.id
where p.role = 'tutor'
order by coalesce(view_counts.views, 0) desc;

-- ============================================================
-- updated_at auto-update triggers
-- ============================================================
do $$
begin
  if not exists (select 1 from pg_proc where proname = 'update_updated_at') then
    create function public.update_updated_at()
    returns trigger as $f$
    begin
      new.updated_at = now();
      return new;
    end;
    $f$ language plpgsql;
  end if;
end $$;

drop trigger if exists trg_tutor_subs_updated_at on public.tutor_subscriptions;
create trigger trg_tutor_subs_updated_at
  before update on public.tutor_subscriptions
  for each row execute function public.update_updated_at();

-- ============================================================
-- ROW LEVEL SECURITY on all new tables
-- ============================================================
alter table public.conversations       enable row level security;
alter table public.messages            enable row level security;
alter table public.availability        enable row level security;
alter table public.student_courses     enable row level security;
alter table public.saved_tutors        enable row level security;
alter table public.reports             enable row level security;
alter table public.notifications       enable row level security;
alter table public.no_shows            enable row level security;
alter table public.blocks              enable row level security;
alter table public.profile_views       enable row level security;
alter table public.tutor_subscriptions enable row level security;
alter table public.tutor_boosts        enable row level security;
alter table public.semesters           enable row level security;
alter table public.course_submissions  enable row level security;
alter table public.support_tickets     enable row level security;

-- Drop any existing policies to make this re-runnable
do $$
declare pol record;
begin
  for pol in
    select tablename, policyname
    from pg_policies
    where schemaname = 'public'
      and tablename in (
        'conversations', 'messages', 'availability', 'student_courses', 'saved_tutors',
        'reports', 'notifications', 'no_shows', 'blocks', 'profile_views',
        'tutor_subscriptions', 'tutor_boosts', 'semesters', 'course_submissions', 'support_tickets'
      )
  loop
    execute format('drop policy if exists %I on public.%I', pol.policyname, pol.tablename);
  end loop;
end $$;

-- CONVERSATIONS — participants only
create policy "Participants can read conversations"
  on public.conversations for select using (auth.uid() = student_id or auth.uid() = tutor_id);
create policy "Students can create conversations"
  on public.conversations for insert with check (auth.uid() = student_id or auth.uid() = tutor_id);
create policy "Participants can update conversations"
  on public.conversations for update using (auth.uid() = student_id or auth.uid() = tutor_id);

-- MESSAGES — only visible to conversation participants
create policy "Participants can read messages"
  on public.messages for select using (
    exists (
      select 1 from public.conversations c
      where c.id = conversation_id and (auth.uid() = c.student_id or auth.uid() = c.tutor_id)
    )
  );
create policy "Participants can send messages"
  on public.messages for insert with check (
    auth.uid() = sender_id and
    exists (
      select 1 from public.conversations c
      where c.id = conversation_id and (auth.uid() = c.student_id or auth.uid() = c.tutor_id)
    )
  );
create policy "Participants can mark messages read"
  on public.messages for update using (
    exists (
      select 1 from public.conversations c
      where c.id = conversation_id and (auth.uid() = c.student_id or auth.uid() = c.tutor_id)
    )
  );

-- AVAILABILITY — public read, only own writes
create policy "Availability is publicly readable"
  on public.availability for select using (true);
create policy "Tutors can manage own availability"
  on public.availability for all using (auth.uid() = tutor_id) with check (auth.uid() = tutor_id);

-- STUDENT_COURSES — public read (for tutor matching), only own writes
create policy "Student courses are publicly readable"
  on public.student_courses for select using (true);
create policy "Students can manage own courses"
  on public.student_courses for all using (auth.uid() = student_id) with check (auth.uid() = student_id);

-- SAVED_TUTORS — only own saves
create policy "Students can read own saved"
  on public.saved_tutors for select using (auth.uid() = student_id);
create policy "Students can save"
  on public.saved_tutors for insert with check (auth.uid() = student_id);
create policy "Students can unsave"
  on public.saved_tutors for delete using (auth.uid() = student_id);

-- REPORTS — reporter can read/create their own
create policy "Users can read own reports"
  on public.reports for select using (auth.uid() = reporter_id);
create policy "Users can create reports"
  on public.reports for insert with check (auth.uid() = reporter_id);

-- NOTIFICATIONS — only recipient can read/update
create policy "Users can read own notifications"
  on public.notifications for select using (auth.uid() = user_id);
create policy "Users can mark own notifications read"
  on public.notifications for update using (auth.uid() = user_id);

-- NO_SHOWS — session participants can read/create
create policy "Participants can read own no-shows"
  on public.no_shows for select using (
    exists (
      select 1 from public.sessions s
      where s.id = session_id and (auth.uid() = s.student_id or auth.uid() = s.tutor_id)
    )
  );
create policy "Participants can create no-shows"
  on public.no_shows for insert with check (
    auth.uid() = reported_by and
    exists (
      select 1 from public.sessions s
      where s.id = session_id and (auth.uid() = s.student_id or auth.uid() = s.tutor_id)
    )
  );

-- BLOCKS — only blocker can see their own blocks
create policy "Users can read own blocks"
  on public.blocks for select using (auth.uid() = blocker_id);
create policy "Users can create own blocks"
  on public.blocks for insert with check (auth.uid() = blocker_id);
create policy "Users can delete own blocks"
  on public.blocks for delete using (auth.uid() = blocker_id);

-- PROFILE_VIEWS — tutors can read their own; anyone can insert
create policy "Tutors can read own profile views"
  on public.profile_views for select using (auth.uid() = tutor_id);
create policy "Anyone can log a profile view"
  on public.profile_views for insert with check (true);

-- TUTOR_SUBSCRIPTIONS — public read (needed by useTutors join), only own writes
create policy "Subscriptions are publicly readable"
  on public.tutor_subscriptions for select using (true);
create policy "Tutors can manage own subscription"
  on public.tutor_subscriptions for all using (auth.uid() = tutor_id) with check (auth.uid() = tutor_id);

-- TUTOR_BOOSTS — public read (needed by useTutors join), only own writes
create policy "Boosts are publicly readable"
  on public.tutor_boosts for select using (true);
create policy "Tutors can manage own boosts"
  on public.tutor_boosts for all using (auth.uid() = tutor_id) with check (auth.uid() = tutor_id);

-- SEMESTERS — publicly readable
create policy "Semesters are publicly readable"
  on public.semesters for select using (true);

-- COURSE_SUBMISSIONS — submitter can read own, anyone can submit
create policy "Submitters can read own submissions"
  on public.course_submissions for select using (auth.uid() = submitter_id);
create policy "Authenticated users can submit courses"
  on public.course_submissions for insert with check (auth.uid() = submitter_id);

-- SUPPORT_TICKETS — only owner
create policy "Users can read own tickets"
  on public.support_tickets for select using (auth.uid() = user_id);
create policy "Users can create tickets"
  on public.support_tickets for insert with check (auth.uid() = user_id);

-- ============================================================
-- Done! Enable realtime for messages/conversations
-- (you can toggle these on from the Supabase dashboard too)
-- ============================================================
alter publication supabase_realtime add table public.messages;
alter publication supabase_realtime add table public.conversations;
alter publication supabase_realtime add table public.notifications;
