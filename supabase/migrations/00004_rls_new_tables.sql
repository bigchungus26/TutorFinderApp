-- ============================================================
-- Migration 00004: RLS policies for new tables
-- Covers: saved_tutors, availability, notifications,
--         student_courses, conversations, messages,
--         reports, course_requests, rate_limits
-- Author: Teachme build
-- ============================================================

-- ── SAVED TUTORS ─────────────────────────────────────────────
alter table public.saved_tutors enable row level security;

-- Students see only their own saves
create policy "Students can read own saved tutors"
  on public.saved_tutors for select
  using (auth.uid() = student_id);

create policy "Students can save tutors"
  on public.saved_tutors for insert
  with check (auth.uid() = student_id);

create policy "Students can unsave tutors"
  on public.saved_tutors for delete
  using (auth.uid() = student_id);

-- ── AVAILABILITY ─────────────────────────────────────────────
alter table public.availability enable row level security;

-- Anyone can read availability (needed for booking flow)
create policy "Availability is publicly readable"
  on public.availability for select
  using (true);

-- Tutors manage only their own availability
create policy "Tutors can insert own availability"
  on public.availability for insert
  with check (auth.uid() = tutor_id);

create policy "Tutors can update own availability"
  on public.availability for update
  using (auth.uid() = tutor_id)
  with check (auth.uid() = tutor_id);

create policy "Tutors can delete own availability"
  on public.availability for delete
  using (auth.uid() = tutor_id);

-- ── NOTIFICATIONS ─────────────────────────────────────────────
alter table public.notifications enable row level security;

-- Users read only their own notifications
create policy "Users can read own notifications"
  on public.notifications for select
  using (auth.uid() = user_id);

-- Users can mark their own notifications as read
create policy "Users can update own notifications"
  on public.notifications for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Notifications are inserted by triggers (security definer) — no direct user inserts

-- ── STUDENT COURSES ───────────────────────────────────────────
alter table public.student_courses enable row level security;

-- Students see only their own enrolled courses
create policy "Students can read own courses"
  on public.student_courses for select
  using (auth.uid() = student_id);

create policy "Students can enroll in courses"
  on public.student_courses for insert
  with check (auth.uid() = student_id);

create policy "Students can remove enrolled courses"
  on public.student_courses for delete
  using (auth.uid() = student_id);

-- ── CONVERSATIONS ─────────────────────────────────────────────
alter table public.conversations enable row level security;

-- Only participants can read
create policy "Participants can read their conversations"
  on public.conversations for select
  using (auth.uid() = student_id or auth.uid() = tutor_id);

-- Either participant can create (or the app does it automatically)
create policy "Participants can create conversations"
  on public.conversations for insert
  with check (auth.uid() = student_id or auth.uid() = tutor_id);

-- Participants can update (e.g., last_message_at via trigger)
-- We allow this since the trigger uses security definer; keep open for realtime updates
create policy "Participants can update conversations"
  on public.conversations for update
  using (auth.uid() = student_id or auth.uid() = tutor_id);

-- ── MESSAGES ──────────────────────────────────────────────────
alter table public.messages enable row level security;

-- Only conversation participants can read messages
-- (join via conversations table)
create policy "Conversation participants can read messages"
  on public.messages for select
  using (
    exists (
      select 1 from public.conversations c
      where c.id = messages.conversation_id
        and (c.student_id = auth.uid() or c.tutor_id = auth.uid())
    )
  );

-- Only the sender (who must be a participant) can insert
create policy "Participants can send messages"
  on public.messages for insert
  with check (
    auth.uid() = sender_id
    and exists (
      select 1 from public.conversations c
      where c.id = messages.conversation_id
        and (c.student_id = auth.uid() or c.tutor_id = auth.uid())
    )
  );

-- Participants can mark messages as read
create policy "Participants can update message read status"
  on public.messages for update
  using (
    exists (
      select 1 from public.conversations c
      where c.id = messages.conversation_id
        and (c.student_id = auth.uid() or c.tutor_id = auth.uid())
    )
  );

-- ── REPORTS ───────────────────────────────────────────────────
alter table public.reports enable row level security;

-- Reporters can only see their own reports
create policy "Reporters can read own reports"
  on public.reports for select
  using (auth.uid() = reporter_id);

-- Any logged-in user can submit a report
create policy "Users can create reports"
  on public.reports for insert
  with check (auth.uid() = reporter_id);

-- ── COURSE REQUESTS ───────────────────────────────────────────
alter table public.course_requests enable row level security;

create policy "Users can read own course requests"
  on public.course_requests for select
  using (auth.uid() = requester_id);

create policy "Users can create course requests"
  on public.course_requests for insert
  with check (auth.uid() = requester_id);

-- ── RATE LIMITS ───────────────────────────────────────────────
alter table public.rate_limits enable row level security;

-- Users can only see their own rate limit records
create policy "Users can read own rate limits"
  on public.rate_limits for select
  using (auth.uid() = user_id);

create policy "Users can insert own rate limit records"
  on public.rate_limits for insert
  with check (auth.uid() = user_id);

create policy "Users can update own rate limit records"
  on public.rate_limits for update
  using (auth.uid() = user_id);

-- ── FIX: Prevent direct writes to tutor_stats ─────────────────
-- Gap found in I1 audit: no write protection on tutor_stats.
-- The trigger (security definer) handles all writes.
-- We explicitly block direct user inserts/updates/deletes.

-- Drop the "no policy = no access" assumption by adding explicit denies.
-- (RLS was enabled in 00002 but no insert/update/delete policies existed,
-- which means authenticated users had no write access by default — correct.
-- We add explicit comment-only policies for clarity.)
-- Note: The trigger function uses security definer so it bypasses RLS.

comment on table public.tutor_stats is
  'Read-only for users. All writes handled by recalc_tutor_stats trigger (security definer).';
