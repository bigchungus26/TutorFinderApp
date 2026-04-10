-- ============================================================
-- Teachme — Row Level Security Policies
-- Run this AFTER 00001_create_tables.sql
-- ============================================================

-- Enable RLS on all tables
alter table public.universities  enable row level security;
alter table public.courses       enable row level security;
alter table public.profiles      enable row level security;
alter table public.tutor_courses enable row level security;
alter table public.sessions      enable row level security;
alter table public.requests      enable row level security;
alter table public.reviews       enable row level security;
alter table public.tutor_stats   enable row level security;

-- ============================================================
-- UNIVERSITIES — public read, no user writes
-- ============================================================
create policy "Universities are publicly readable"
  on public.universities for select
  using (true);

-- ============================================================
-- COURSES — public read, no user writes
-- ============================================================
create policy "Courses are publicly readable"
  on public.courses for select
  using (true);

-- ============================================================
-- PROFILES
-- ============================================================
-- Anyone can read profiles (for tutor listings)
create policy "Profiles are publicly readable"
  on public.profiles for select
  using (true);

-- Users can insert their own profile (handled by trigger, but just in case)
create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

-- Users can update only their own profile
create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Users can delete only their own profile
create policy "Users can delete own profile"
  on public.profiles for delete
  using (auth.uid() = id);

-- ============================================================
-- TUTOR_COURSES
-- ============================================================
-- Anyone can read (needed for tutor profile display)
create policy "Tutor courses are publicly readable"
  on public.tutor_courses for select
  using (true);

-- Tutors can manage their own course listings
create policy "Tutors can insert own courses"
  on public.tutor_courses for insert
  with check (auth.uid() = tutor_id);

create policy "Tutors can update own courses"
  on public.tutor_courses for update
  using (auth.uid() = tutor_id)
  with check (auth.uid() = tutor_id);

create policy "Tutors can delete own courses"
  on public.tutor_courses for delete
  using (auth.uid() = tutor_id);

-- ============================================================
-- SESSIONS
-- ============================================================
-- Participants can read their own sessions
create policy "Users can read own sessions"
  on public.sessions for select
  using (auth.uid() = tutor_id or auth.uid() = student_id);

-- Students can create sessions (book a tutor)
create policy "Students can create sessions"
  on public.sessions for insert
  with check (auth.uid() = student_id);

-- Participants can update their sessions (cancel, mark complete)
create policy "Participants can update own sessions"
  on public.sessions for update
  using (auth.uid() = tutor_id or auth.uid() = student_id)
  with check (auth.uid() = tutor_id or auth.uid() = student_id);

-- ============================================================
-- REQUESTS
-- ============================================================
-- Students see their outgoing requests, tutors see their incoming
create policy "Users can read own requests"
  on public.requests for select
  using (auth.uid() = student_id or auth.uid() = tutor_id);

-- Students can create requests
create policy "Students can create requests"
  on public.requests for insert
  with check (auth.uid() = student_id);

-- Tutors can update request status (accept/decline)
create policy "Tutors can update incoming requests"
  on public.requests for update
  using (auth.uid() = tutor_id)
  with check (auth.uid() = tutor_id);

-- Students can delete their own pending requests
create policy "Students can delete own pending requests"
  on public.requests for delete
  using (auth.uid() = student_id and status = 'pending');

-- ============================================================
-- REVIEWS
-- ============================================================
-- Anyone can read reviews (public tutor reputation)
create policy "Reviews are publicly readable"
  on public.reviews for select
  using (true);

-- Students can create reviews for their own sessions
create policy "Students can create reviews"
  on public.reviews for insert
  with check (auth.uid() = student_id);

-- Students can update their own reviews
create policy "Students can update own reviews"
  on public.reviews for update
  using (auth.uid() = student_id)
  with check (auth.uid() = student_id);

-- Students can delete their own reviews
create policy "Students can delete own reviews"
  on public.reviews for delete
  using (auth.uid() = student_id);

-- ============================================================
-- TUTOR_STATS — public read, system-only writes (via trigger)
-- ============================================================
create policy "Tutor stats are publicly readable"
  on public.tutor_stats for select
  using (true);
