-- ============================================================
-- Migration 00006: Business features
-- Adds cancellation_hours, paused_until, cancelled_by/at,
-- profile_views, tutor_subscriptions, tutor_boosts,
-- and extends notification_type enum.
-- ============================================================

-- ============================================================
-- 1. Extend profiles with new fields
-- ============================================================
alter table public.profiles
  add column if not exists cancellation_hours integer not null default 4
    check (cancellation_hours >= 0 and cancellation_hours <= 48),
  add column if not exists paused_until timestamptz;

comment on column public.profiles.cancellation_hours is
  'Hours before session that student can cancel without needing to contact tutor directly';
comment on column public.profiles.paused_until is
  'When set, tutor is paused (hidden from search) until this timestamp';

-- ============================================================
-- 2. Add cancellation metadata to sessions
-- ============================================================
alter table public.sessions
  add column if not exists cancelled_by uuid references public.profiles(id) on delete set null,
  add column if not exists cancelled_at timestamptz;

comment on column public.sessions.cancelled_by is 'Profile who cancelled the session';
comment on column public.sessions.cancelled_at is 'When the session was cancelled';

-- ============================================================
-- 3. Extend notification_type enum with new values
-- ============================================================
-- Note: ALTER TYPE ... ADD VALUE requires a separate transaction in some PG versions.
-- Using DO block for safety.
do $$
begin
  if not exists (
    select 1 from pg_enum
    where enumtypid = 'notification_type'::regtype
      and enumlabel = 'new_message'
  ) then
    alter type notification_type add value 'new_message';
  end if;

  if not exists (
    select 1 from pg_enum
    where enumtypid = 'notification_type'::regtype
      and enumlabel = 'session_cancelled'
  ) then
    alter type notification_type add value 'session_cancelled';
  end if;

  if not exists (
    select 1 from pg_enum
    where enumtypid = 'notification_type'::regtype
      and enumlabel = 'review_prompt'
  ) then
    alter type notification_type add value 'review_prompt';
  end if;

  if not exists (
    select 1 from pg_enum
    where enumtypid = 'notification_type'::regtype
      and enumlabel = 'subscription_inactive'
  ) then
    alter type notification_type add value 'subscription_inactive';
  end if;
end $$;

-- ============================================================
-- 4. PROFILE_VIEWS — one row per view per session
-- ============================================================
create table if not exists public.profile_views (
  id         uuid primary key default gen_random_uuid(),
  tutor_id   uuid not null references public.profiles(id) on delete cascade,
  viewer_id  uuid references public.profiles(id) on delete set null,
  viewed_at  timestamptz not null default now()
);
comment on table public.profile_views is 'Log of profile page views for tutors';
create index if not exists idx_profile_views_tutor on public.profile_views(tutor_id, viewed_at desc);
create index if not exists idx_profile_views_viewer on public.profile_views(viewer_id);

alter table public.profile_views enable row level security;

-- Anyone authenticated can insert a view
create policy "Authenticated users can log profile views"
  on public.profile_views for insert
  to authenticated
  with check (true);

-- Tutors can only read their own view counts
create policy "Tutors can read their own profile views"
  on public.profile_views for select
  to authenticated
  using (tutor_id = auth.uid());

-- ============================================================
-- 5. TUTOR_SUBSCRIPTIONS — subscription status per tutor
-- ============================================================
create type if not exists subscription_tier_status as enum ('active', 'grace_period', 'inactive');

create table if not exists public.tutor_subscriptions (
  id                 uuid primary key default gen_random_uuid(),
  tutor_id           uuid not null unique references public.profiles(id) on delete cascade,
  status             subscription_tier_status not null default 'inactive',
  current_period_end timestamptz,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);
comment on table public.tutor_subscriptions is '$50/month tutor subscription status';
create index if not exists idx_tutor_subscriptions_tutor on public.tutor_subscriptions(tutor_id);
create index if not exists idx_tutor_subscriptions_status on public.tutor_subscriptions(status);

alter table public.tutor_subscriptions enable row level security;

-- Anyone can read subscription status (needed for search filtering)
create policy "Public can read subscription status"
  on public.tutor_subscriptions for select
  to anon, authenticated
  using (true);

-- Tutors can update their own (for demo/manual management)
create policy "Tutors can update their subscription"
  on public.tutor_subscriptions for all
  to authenticated
  using (tutor_id = auth.uid())
  with check (tutor_id = auth.uid());

-- ============================================================
-- 6. TUTOR_BOOSTS — profile boost for higher search ranking
-- ============================================================
create table if not exists public.tutor_boosts (
  id         uuid primary key default gen_random_uuid(),
  tutor_id   uuid not null unique references public.profiles(id) on delete cascade,
  active     boolean not null default false,
  started_at timestamptz,
  ends_at    timestamptz,
  created_at timestamptz not null default now()
);
comment on table public.tutor_boosts is 'Paid profile boosts for higher search ranking';
create index if not exists idx_tutor_boosts_tutor on public.tutor_boosts(tutor_id);
create index if not exists idx_tutor_boosts_active on public.tutor_boosts(active) where active = true;

alter table public.tutor_boosts enable row level security;

-- Anyone can read boost status (needed for search ordering + Featured pill)
create policy "Public can read boost status"
  on public.tutor_boosts for select
  to anon, authenticated
  using (true);

-- Tutors can manage their own boost
create policy "Tutors can manage their boost"
  on public.tutor_boosts for all
  to authenticated
  using (tutor_id = auth.uid())
  with check (tutor_id = auth.uid());

-- ============================================================
-- 7. Notification trigger: new message
-- ============================================================
create or replace function public.notify_on_message_insert()
returns trigger as $$
declare
  conv        record;
  sender_name text;
  recipient   uuid;
begin
  select student_id, tutor_id into conv
    from public.conversations where id = new.conversation_id;

  select full_name into sender_name
    from public.profiles where id = new.sender_id;

  recipient := case
    when new.sender_id = conv.student_id then conv.tutor_id
    else conv.student_id
  end;

  insert into public.notifications (user_id, type, title, body, link)
  values (
    recipient,
    'new_message',
    'New message from ' || sender_name,
    sender_name || ' sent you a message',
    '/messages'
  );

  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists trg_notify_new_message on public.messages;
create trigger trg_notify_new_message
  after insert on public.messages
  for each row execute function public.notify_on_message_insert();

-- ============================================================
-- 8. Notification trigger: session cancelled
-- ============================================================
create or replace function public.notify_on_session_cancel()
returns trigger as $$
declare
  tutor_name   text;
  student_name text;
  course_name  text;
begin
  if old.status = new.status or new.status != 'cancelled' then return new; end if;

  select full_name into tutor_name   from public.profiles where id = new.tutor_id;
  select full_name into student_name from public.profiles where id = new.student_id;
  select name     into course_name   from public.courses  where id = new.course_id;

  if new.cancelled_by = new.tutor_id then
    -- Student gets notified
    insert into public.notifications (user_id, type, title, body, link)
    values (
      new.student_id, 'session_cancelled',
      'Session cancelled',
      tutor_name || ' cancelled your ' || coalesce(course_name, 'session'),
      '/sessions'
    );
  else
    -- Tutor gets notified
    insert into public.notifications (user_id, type, title, body, link)
    values (
      new.tutor_id, 'session_cancelled',
      'Session cancelled',
      coalesce(student_name, 'Student') || ' cancelled the ' || coalesce(course_name, 'session'),
      '/tutor/requests'
    );
  end if;

  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists trg_notify_session_cancelled on public.sessions;
create trigger trg_notify_session_cancelled
  after update on public.sessions
  for each row execute function public.notify_on_session_cancel();

-- ============================================================
-- 9. Helpful indexes
-- ============================================================
create index if not exists idx_sessions_tutor_status on public.sessions(tutor_id, status);
create index if not exists idx_sessions_student_status on public.sessions(student_id, status);
create index if not exists idx_profiles_paused on public.profiles(paused_until) where paused_until is not null;
