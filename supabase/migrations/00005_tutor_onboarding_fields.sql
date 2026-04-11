-- ============================================================
-- Migration 00005: richer tutor onboarding fields
-- Adds optional tutor-specific credibility, profile, trust,
-- and subscription fields to profiles.
-- ============================================================

alter table public.profiles
  add column if not exists gpa numeric(3,2),
  add column if not exists teaching_styles text[] not null default '{}',
  add column if not exists languages text[] not null default '{}',
  add column if not exists availability_preferences text[] not null default '{}',
  add column if not exists max_students_per_session integer,
  add column if not exists previous_tutoring_experience boolean not null default false,
  add column if not exists years_of_experience integer,
  add column if not exists proof_asset_url text not null default '',
  add column if not exists proof_asset_name text not null default '',
  add column if not exists subscription_plan text not null default 'tutor_monthly',
  add column if not exists subscription_status text not null default 'pending';

alter table public.profiles
  drop constraint if exists profiles_gpa_check,
  add constraint profiles_gpa_check
    check (gpa is null or (gpa >= 0 and gpa <= 4.3));

alter table public.profiles
  drop constraint if exists profiles_max_students_check,
  add constraint profiles_max_students_check
    check (max_students_per_session is null or max_students_per_session > 0);

alter table public.profiles
  drop constraint if exists profiles_years_experience_check,
  add constraint profiles_years_experience_check
    check (years_of_experience is null or years_of_experience >= 0);
