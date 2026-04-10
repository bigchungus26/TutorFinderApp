-- ============================================================
-- Teachme — Full Database Schema
-- Run this in your Supabase SQL Editor to create all tables.
-- ============================================================

-- Enable UUID generation
create extension if not exists "pgcrypto";

-- ============================================================
-- 1. UNIVERSITIES (reference table, managed by admins)
-- ============================================================
create table public.universities (
  id          text primary key,
  name        text not null,
  short_name  text not null,
  color       text not null default '#000000',
  created_at  timestamptz not null default now()
);

comment on table public.universities is 'Supported universities (AUB, LAU, NDU)';

-- ============================================================
-- 2. COURSES (reference table, managed by admins)
-- ============================================================
create table public.courses (
  id               uuid primary key default gen_random_uuid(),
  code             text not null,
  name             text not null,
  university_id    text not null references public.universities(id) on delete cascade,
  subject          text not null,
  description      text not null default '',
  credits          smallint not null default 3,
  prerequisites    text[] not null default '{}',
  typical_semester text not null default '',
  created_at       timestamptz not null default now(),

  unique (university_id, code)
);

comment on table public.courses is 'Courses offered at each university';
create index idx_courses_university on public.courses(university_id);
create index idx_courses_subject on public.courses(subject);

-- ============================================================
-- 3. PROFILES (extends Supabase auth.users)
-- ============================================================
create table public.profiles (
  id               uuid primary key references auth.users(id) on delete cascade,
  role             text not null check (role in ('student', 'tutor')) default 'student',
  full_name        text not null default '',
  avatar_url       text not null default '',
  university_id    text references public.universities(id) on delete set null,
  major            text not null default '',
  year             text not null default '',
  bio              text not null default '',
  hourly_rate      numeric(6,2) check (hourly_rate >= 0),
  verified         boolean not null default false,
  online           boolean not null default true,
  in_person        boolean not null default false,
  agreed_terms_at  timestamptz,
  onboarded_at     timestamptz,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

comment on table public.profiles is 'User profiles for students and tutors';
create index idx_profiles_university on public.profiles(university_id);
create index idx_profiles_role on public.profiles(role);

-- ============================================================
-- 4. TUTOR_COURSES (which courses a tutor can teach + grade)
-- ============================================================
create table public.tutor_courses (
  id         uuid primary key default gen_random_uuid(),
  tutor_id   uuid not null references public.profiles(id) on delete cascade,
  course_id  uuid not null references public.courses(id) on delete cascade,
  grade      text not null default 'A' check (grade in ('A', 'A-', 'B+', 'B', 'B-')),
  created_at timestamptz not null default now(),

  unique (tutor_id, course_id)
);

comment on table public.tutor_courses is 'Courses each tutor is qualified to teach';
create index idx_tutor_courses_tutor on public.tutor_courses(tutor_id);
create index idx_tutor_courses_course on public.tutor_courses(course_id);

-- ============================================================
-- 5. SESSIONS (booked tutoring sessions)
-- ============================================================
create type session_location as enum ('online', 'in-person');
create type session_status   as enum ('upcoming', 'completed', 'cancelled');

create table public.sessions (
  id          uuid primary key default gen_random_uuid(),
  tutor_id    uuid not null references public.profiles(id) on delete cascade,
  student_id  uuid not null references public.profiles(id) on delete cascade,
  course_id   uuid not null references public.courses(id) on delete cascade,
  date        date not null,
  time        time not null,
  duration    smallint not null default 60 check (duration > 0),
  location    session_location not null default 'online',
  status      session_status not null default 'upcoming',
  price       numeric(8,2) not null check (price >= 0),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),

  check (tutor_id != student_id)
);

comment on table public.sessions is 'Booked tutoring sessions between students and tutors';
create index idx_sessions_tutor on public.sessions(tutor_id);
create index idx_sessions_student on public.sessions(student_id);
create index idx_sessions_status on public.sessions(status);
create index idx_sessions_date on public.sessions(date);

-- ============================================================
-- 6. REQUESTS (student requests to tutors, before booking)
-- ============================================================
create type request_status as enum ('pending', 'accepted', 'declined');

create table public.requests (
  id          uuid primary key default gen_random_uuid(),
  student_id  uuid not null references public.profiles(id) on delete cascade,
  tutor_id    uuid not null references public.profiles(id) on delete cascade,
  course_id   uuid not null references public.courses(id) on delete cascade,
  date        date not null,
  time        time not null,
  duration    smallint not null default 60 check (duration > 0),
  location    session_location not null default 'online',
  message     text not null default '',
  status      request_status not null default 'pending',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),

  check (student_id != tutor_id)
);

comment on table public.requests is 'Session requests from students to tutors';
create index idx_requests_tutor on public.requests(tutor_id);
create index idx_requests_student on public.requests(student_id);
create index idx_requests_status on public.requests(status);

-- ============================================================
-- 7. REVIEWS (students review tutors after sessions)
-- ============================================================
create table public.reviews (
  id          uuid primary key default gen_random_uuid(),
  session_id  uuid references public.sessions(id) on delete set null,
  tutor_id    uuid not null references public.profiles(id) on delete cascade,
  student_id  uuid not null references public.profiles(id) on delete cascade,
  course_id   uuid not null references public.courses(id) on delete cascade,
  rating      smallint not null check (rating >= 1 and rating <= 5),
  comment     text not null default '',
  created_at  timestamptz not null default now(),

  check (student_id != tutor_id)
);

comment on table public.reviews is 'Student reviews of tutors after completed sessions';
create index idx_reviews_tutor on public.reviews(tutor_id);
create index idx_reviews_student on public.reviews(student_id);

-- ============================================================
-- 8. TUTOR STATS (materialized/cached aggregate stats)
-- ============================================================
create table public.tutor_stats (
  tutor_id            uuid primary key references public.profiles(id) on delete cascade,
  rating              numeric(3,2) not null default 0,
  review_count        integer not null default 0,
  sessions_completed  integer not null default 0,
  response_time       text not null default '',
  updated_at          timestamptz not null default now()
);

comment on table public.tutor_stats is 'Cached aggregate statistics for tutors (updated via triggers)';

-- ============================================================
-- 9. AUTO-UPDATE updated_at TRIGGER
-- ============================================================
create or replace function public.update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger trg_profiles_updated_at
  before update on public.profiles
  for each row execute function public.update_updated_at();

create trigger trg_sessions_updated_at
  before update on public.sessions
  for each row execute function public.update_updated_at();

create trigger trg_requests_updated_at
  before update on public.requests
  for each row execute function public.update_updated_at();

-- ============================================================
-- 10. AUTO-RECALCULATE TUTOR STATS ON REVIEW INSERT
-- ============================================================
create or replace function public.recalc_tutor_stats()
returns trigger as $$
begin
  insert into public.tutor_stats (tutor_id, rating, review_count, sessions_completed, updated_at)
  values (
    new.tutor_id,
    new.rating,
    1,
    (select count(*) from public.sessions where tutor_id = new.tutor_id and status = 'completed'),
    now()
  )
  on conflict (tutor_id) do update set
    rating = (
      select round(avg(r.rating)::numeric, 2)
      from public.reviews r
      where r.tutor_id = new.tutor_id
    ),
    review_count = (
      select count(*)
      from public.reviews r
      where r.tutor_id = new.tutor_id
    ),
    sessions_completed = (
      select count(*)
      from public.sessions s
      where s.tutor_id = new.tutor_id and s.status = 'completed'
    ),
    updated_at = now();

  return new;
end;
$$ language plpgsql security definer;

create trigger trg_recalc_tutor_stats
  after insert on public.reviews
  for each row execute function public.recalc_tutor_stats();

-- ============================================================
-- 11. AUTO-CREATE PROFILE ON SIGNUP
-- ============================================================
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (
    id,
    role,
    full_name,
    avatar_url
  )
  values (
    new.id,
    case lower(coalesce(new.raw_user_meta_data->>'role', 'student'))
      when 'tutor' then 'tutor'
      else 'student'
    end,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    coalesce(new.raw_user_meta_data->>'avatar_url', '')
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
