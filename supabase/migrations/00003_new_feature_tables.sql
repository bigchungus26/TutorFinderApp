-- ============================================================
-- Migration 00003: New feature tables
-- Adds: saved_tutors, availability, notifications, student_courses,
--       conversations, messages, reports, course_requests, rate_limits
--       + trending_tutors view + notification triggers
-- Author: Teachme build
-- ============================================================

-- ============================================================
-- 1. SAVED TUTORS (C1)
-- Students save tutors they're interested in.
-- ============================================================
create table public.saved_tutors (
  id          uuid primary key default gen_random_uuid(),
  student_id  uuid not null references public.profiles(id) on delete cascade,
  tutor_id    uuid not null references public.profiles(id) on delete cascade,
  created_at  timestamptz not null default now(),

  unique (student_id, tutor_id),
  check (student_id != tutor_id)
);

comment on table public.saved_tutors is 'Tutors bookmarked by students';
create index idx_saved_tutors_student on public.saved_tutors(student_id);
create index idx_saved_tutors_tutor on public.saved_tutors(tutor_id);

-- ============================================================
-- 2. AVAILABILITY (C2)
-- Tutor weekly availability slots. day_of_week: 0=Sun, 6=Sat.
-- ============================================================
create table public.availability (
  id           uuid primary key default gen_random_uuid(),
  tutor_id     uuid not null references public.profiles(id) on delete cascade,
  day_of_week  smallint not null check (day_of_week >= 0 and day_of_week <= 6),
  start_time   time not null,
  end_time     time not null,
  created_at   timestamptz not null default now(),

  check (start_time < end_time),
  unique (tutor_id, day_of_week, start_time)
);

comment on table public.availability is 'Tutor weekly availability slots';
create index idx_availability_tutor on public.availability(tutor_id);

-- ============================================================
-- 3. NOTIFICATIONS (C4)
-- In-app notifications. Driven by database triggers.
-- ============================================================
create type notification_type as enum (
  'request_received',
  'request_accepted',
  'request_declined',
  'session_reminder',
  'new_review',
  'saved_by_student'
);

create table public.notifications (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles(id) on delete cascade,
  type        notification_type not null,
  title       text not null,
  body        text not null default '',
  link        text not null default '',
  read        boolean not null default false,
  created_at  timestamptz not null default now()
);

comment on table public.notifications is 'In-app notifications for users';
create index idx_notifications_user on public.notifications(user_id, read);
create index idx_notifications_created on public.notifications(created_at desc);

-- ============================================================
-- 4. STUDENT COURSES (C6)
-- Courses a student is currently enrolled in.
-- ============================================================
create table public.student_courses (
  id          uuid primary key default gen_random_uuid(),
  student_id  uuid not null references public.profiles(id) on delete cascade,
  course_id   uuid not null references public.courses(id) on delete cascade,
  semester    text not null default '',
  created_at  timestamptz not null default now(),

  unique (student_id, course_id)
);

comment on table public.student_courses is 'Courses a student is currently taking';
create index idx_student_courses_student on public.student_courses(student_id);
create index idx_student_courses_course on public.student_courses(course_id);

-- ============================================================
-- 5. CONVERSATIONS (C8)
-- One conversation per student-tutor pair.
-- ============================================================
create table public.conversations (
  id              uuid primary key default gen_random_uuid(),
  student_id      uuid not null references public.profiles(id) on delete cascade,
  tutor_id        uuid not null references public.profiles(id) on delete cascade,
  last_message_at timestamptz not null default now(),
  created_at      timestamptz not null default now(),

  unique (student_id, tutor_id),
  check (student_id != tutor_id)
);

comment on table public.conversations is 'Direct message threads between students and tutors';
create index idx_conversations_student on public.conversations(student_id);
create index idx_conversations_tutor on public.conversations(tutor_id);
create index idx_conversations_last on public.conversations(last_message_at desc);

-- ============================================================
-- 6. MESSAGES (C8)
-- Individual messages within a conversation.
-- ============================================================
create table public.messages (
  id              uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  sender_id       uuid not null references public.profiles(id) on delete cascade,
  body            text not null check (length(body) > 0 and length(body) <= 2000),
  read            boolean not null default false,
  created_at      timestamptz not null default now()
);

comment on table public.messages is 'Individual messages within a conversation';
create index idx_messages_conversation on public.messages(conversation_id, created_at);
create index idx_messages_sender on public.messages(sender_id);

-- Auto-update conversation.last_message_at when a message is sent
create or replace function public.update_conversation_last_message()
returns trigger as $$
begin
  update public.conversations
  set last_message_at = new.created_at
  where id = new.conversation_id;
  return new;
end;
$$ language plpgsql security definer;

create trigger trg_conversation_last_message
  after insert on public.messages
  for each row execute function public.update_conversation_last_message();

-- ============================================================
-- 7. REPORTS (C9)
-- Student reports of tutor misconduct. Manual admin review.
-- ============================================================
create type report_reason as enum (
  'inappropriate',
  'no_show',
  'misrepresented_grades',
  'other'
);

create type report_status as enum ('pending', 'reviewed', 'dismissed');

create table public.reports (
  id                 uuid primary key default gen_random_uuid(),
  reporter_id        uuid not null references public.profiles(id) on delete cascade,
  reported_tutor_id  uuid not null references public.profiles(id) on delete cascade,
  reason             report_reason not null,
  details            text not null default '',
  status             report_status not null default 'pending',
  created_at         timestamptz not null default now(),

  check (reporter_id != reported_tutor_id)
);

comment on table public.reports is 'Student reports of tutor misconduct for admin review';
create index idx_reports_reporter on public.reports(reporter_id);
create index idx_reports_tutor on public.reports(reported_tutor_id);

-- ============================================================
-- 8. COURSE REQUESTS (F — empty state CTA)
-- Students can request courses not yet in the catalog.
-- ============================================================
create table public.course_requests (
  id            uuid primary key default gen_random_uuid(),
  requester_id  uuid not null references public.profiles(id) on delete cascade,
  university_id text not null references public.universities(id) on delete cascade,
  course_code   text not null,
  course_name   text not null default '',
  notes         text not null default '',
  created_at    timestamptz not null default now()
);

comment on table public.course_requests is 'Student requests for courses not yet in the catalog';
create index idx_course_requests_uni on public.course_requests(university_id);

-- ============================================================
-- 9. RATE LIMITS (security)
-- Simple table to track mutation frequency per user per action.
-- App checks this before expensive writes.
-- ============================================================
create table public.rate_limits (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles(id) on delete cascade,
  action      text not null,
  window_start timestamptz not null default now(),
  count       integer not null default 1,

  unique (user_id, action, window_start)
);

comment on table public.rate_limits is 'Rate limiting tracker for user mutations';
create index idx_rate_limits_user on public.rate_limits(user_id, action);

-- ============================================================
-- 10. TRENDING TUTORS VIEW (D — Discover section)
-- Tutors with most accepted requests in the last 7 days.
-- ============================================================
create or replace view public.trending_tutors as
select
  r.tutor_id,
  count(*) as booking_count,
  p.university_id
from public.requests r
join public.profiles p on p.id = r.tutor_id
where r.created_at >= now() - interval '7 days'
  and r.status = 'accepted'
group by r.tutor_id, p.university_id
order by booking_count desc;

comment on view public.trending_tutors is 'Tutors ranked by accepted bookings in the last 7 days';

-- ============================================================
-- 11. NOTIFICATION TRIGGERS (C4)
-- Automatically create notifications on key events.
-- ============================================================

-- Notify tutor when a new request arrives
create or replace function public.notify_on_request_insert()
returns trigger as $$
declare
  student_name text;
  course_name  text;
begin
  select full_name into student_name from public.profiles where id = new.student_id;
  select name into course_name from public.courses where id = new.course_id;

  insert into public.notifications (user_id, type, title, body, link)
  values (
    new.tutor_id,
    'request_received',
    'New session request',
    student_name || ' wants a session for ' || course_name,
    '/tutor/requests'
  );

  return new;
end;
$$ language plpgsql security definer;

create trigger trg_notify_request_received
  after insert on public.requests
  for each row execute function public.notify_on_request_insert();

-- Notify student when their request is accepted or declined
create or replace function public.notify_on_request_update()
returns trigger as $$
declare
  tutor_name  text;
  course_name text;
begin
  -- Only fire when status actually changes to accepted or declined
  if (old.status = new.status) then return new; end if;
  if (new.status not in ('accepted', 'declined')) then return new; end if;

  select full_name into tutor_name from public.profiles where id = new.tutor_id;
  select name into course_name from public.courses where id = new.course_id;

  insert into public.notifications (user_id, type, title, body, link)
  values (
    new.student_id,
    case when new.status = 'accepted' then 'request_accepted'::notification_type
         else 'request_declined'::notification_type
    end,
    case when new.status = 'accepted' then 'Request accepted!'
         else 'Request declined'
    end,
    tutor_name || ' ' || case when new.status = 'accepted' then 'accepted' else 'declined' end
      || ' your ' || course_name || ' session request',
    '/sessions'
  );

  return new;
end;
$$ language plpgsql security definer;

create trigger trg_notify_request_updated
  after update on public.requests
  for each row execute function public.notify_on_request_update();

-- Notify tutor when they receive a new review
create or replace function public.notify_on_review_insert()
returns trigger as $$
declare
  student_name text;
  course_name  text;
begin
  select full_name into student_name from public.profiles where id = new.student_id;
  select name into course_name from public.courses where id = new.course_id;

  insert into public.notifications (user_id, type, title, body, link)
  values (
    new.tutor_id,
    'new_review',
    'New review received',
    student_name || ' left a ' || new.rating || '-star review for ' || course_name,
    '/tutor/profile'
  );

  return new;
end;
$$ language plpgsql security definer;

create trigger trg_notify_new_review
  after insert on public.reviews
  for each row execute function public.notify_on_review_insert();

-- ============================================================
-- 12. ADDITIONAL INDEXES for Part I2
-- Adding indexes not covered in 00001 for all new filter columns
-- ============================================================
create index if not exists idx_requests_created on public.requests(created_at desc);
create index if not exists idx_sessions_created on public.sessions(created_at desc);
create index if not exists idx_reviews_created on public.reviews(created_at desc);
create index if not exists idx_profiles_created on public.profiles(created_at desc);

-- last_active support (we'll use updated_at as proxy)
create index if not exists idx_profiles_updated on public.profiles(updated_at desc);
