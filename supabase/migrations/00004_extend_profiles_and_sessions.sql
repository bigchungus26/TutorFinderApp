-- ============================================================
-- Tutr — Extend profiles & sessions with newer columns
-- The app's TypeScript types and queries expect columns that
-- were added after the original schema migration. This adds
-- them with ADD COLUMN IF NOT EXISTS so it's safe to re-run.
--
-- Run this ONCE in the Supabase SQL Editor.
-- ============================================================

-- ============================================================
-- PROFILES — missing columns
-- ============================================================
alter table public.profiles add column if not exists gpa numeric(3,2);
alter table public.profiles add column if not exists teaching_styles text[] not null default '{}';
alter table public.profiles add column if not exists languages text[] not null default '{}';
alter table public.profiles add column if not exists availability_preferences text[] not null default '{}';
alter table public.profiles add column if not exists max_students_per_session smallint;
alter table public.profiles add column if not exists previous_tutoring_experience boolean not null default false;
alter table public.profiles add column if not exists years_of_experience smallint;
alter table public.profiles add column if not exists proof_asset_url text not null default '';
alter table public.profiles add column if not exists proof_asset_name text not null default '';
alter table public.profiles add column if not exists subscription_plan text not null default 'free';
alter table public.profiles add column if not exists subscription_status text not null default 'inactive';
alter table public.profiles add column if not exists tutor_status text check (tutor_status is null or tutor_status in ('student', 'alumni'));
alter table public.profiles add column if not exists cancellation_hours smallint not null default 24;
alter table public.profiles add column if not exists paused_until timestamptz;

-- ============================================================
-- SESSIONS — missing columns
-- ============================================================
alter table public.sessions add column if not exists cancelled_by uuid references public.profiles(id) on delete set null;
alter table public.sessions add column if not exists cancelled_at timestamptz;

-- ============================================================
-- Verify
-- ============================================================
select
  column_name,
  data_type
from information_schema.columns
where table_schema = 'public'
  and table_name = 'profiles'
order by ordinal_position;
