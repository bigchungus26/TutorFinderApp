-- ============================================================
-- Migration 00008: Tutor verification & two-track onboarding
-- Adds tutor_type, verification_status, verification_documents
-- table, storage bucket policies, and notification triggers.
-- ============================================================

-- ============================================================
-- 1. ENUMS
-- ============================================================
do $$
begin
  if not exists (select 1 from pg_type where typname = 'tutor_type') then
    create type tutor_type as enum ('student', 'non_student');
  end if;
end $$;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'verification_status') then
    create type verification_status as enum ('pending', 'approved', 'rejected');
  end if;
end $$;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'verification_doc_type') then
    create type verification_doc_type as enum (
      'student_id',
      'transcript',
      'enrollment_proof',
      'diploma',
      'employer_letter',
      'license',
      'other'
    );
  end if;
end $$;

-- ============================================================
-- 2. EXTEND profiles WITH VERIFICATION COLUMNS
-- (also adds tutor_status which was missing from prior migrations)
-- ============================================================
alter table public.profiles
  add column if not exists tutor_status text
    check (tutor_status is null or tutor_status in ('student', 'alumni')),
  add column if not exists tutor_type tutor_type,
  add column if not exists verification_status verification_status,
  add column if not exists verification_submitted_at timestamptz,
  add column if not exists verification_reviewed_at timestamptz,
  add column if not exists verification_notes text not null default '',
  add column if not exists non_student_credentials text not null default '';

comment on column public.profiles.tutor_type is
  'Track for tutor verification: student (current student at supported uni) or non_student (alumni / professional / outside)';
comment on column public.profiles.verification_status is
  'Verification gate. Tutors are pending until an admin approves. Students have null.';
comment on column public.profiles.verification_submitted_at is
  'When the tutor first submitted their verification documents';
comment on column public.profiles.verification_reviewed_at is
  'When an admin last reviewed (approved/rejected) the verification';
comment on column public.profiles.verification_notes is
  'Internal admin notes / rejection reason. Never displayed to user.';
comment on column public.profiles.non_student_credentials is
  'Free text the non-student tutor wrote about their teaching credentials / background.';

-- Default existing tutors to pending so the gate has a value to work with.
-- Backfill: anyone already onboarded gets approved; everyone else pending.
update public.profiles
   set verification_status = case
     when role = 'tutor' and onboarded_at is not null and verified = true then 'approved'::verification_status
     when role = 'tutor' then 'pending'::verification_status
     else null
   end
 where verification_status is null;

-- Backfill tutor_type from legacy tutor_status when possible.
update public.profiles
   set tutor_type = case
     when role = 'tutor' and tutor_status = 'student'  then 'student'::tutor_type
     when role = 'tutor' and tutor_status = 'alumni'   then 'non_student'::tutor_type
     when role = 'tutor'                                then 'student'::tutor_type
     else null
   end
 where role = 'tutor' and tutor_type is null;

create index if not exists idx_profiles_verification_status
  on public.profiles(verification_status) where role = 'tutor';
create index if not exists idx_profiles_tutor_type
  on public.profiles(tutor_type) where role = 'tutor';

-- ============================================================
-- 3. tutor_courses GRADE CONSTRAINT — A and A- ONLY
-- ============================================================
-- Existing rows with B+/B/B- get bumped to A and the tutor gets
-- flagged for re-verification.
do $$
declare
  affected_tutor uuid;
begin
  for affected_tutor in
    select distinct tutor_id from public.tutor_courses where grade in ('B+', 'B', 'B-')
  loop
    update public.profiles
       set verification_status = 'pending',
           verification_notes  = trim(both ' ' from
             coalesce(verification_notes, '') ||
             ' [auto] Grade constraint changed to A/A- only — re-verify courses.'
           )
     where id = affected_tutor and role = 'tutor';
  end loop;
end $$;

update public.tutor_courses set grade = 'A' where grade in ('B+', 'B', 'B-');

alter table public.tutor_courses
  drop constraint if exists tutor_courses_grade_check;
alter table public.tutor_courses
  add constraint tutor_courses_grade_check check (grade in ('A', 'A-'));

-- ============================================================
-- 4. verification_documents TABLE
-- ============================================================
create table if not exists public.verification_documents (
  id           uuid primary key default gen_random_uuid(),
  tutor_id     uuid not null references public.profiles(id) on delete cascade,
  doc_type     verification_doc_type not null default 'other',
  storage_path text not null,
  file_name    text not null,
  mime_type    text not null,
  size_bytes   integer not null check (size_bytes >= 0 and size_bytes <= 10 * 1024 * 1024),
  uploaded_at  timestamptz not null default now()
);
comment on table public.verification_documents is
  'Per-tutor verification document references (objects live in the verification-documents bucket).';
create index if not exists idx_verification_documents_tutor
  on public.verification_documents(tutor_id, uploaded_at desc);

alter table public.verification_documents enable row level security;

-- Tutors manage their own documents
drop policy if exists "Tutors manage own verification docs" on public.verification_documents;
create policy "Tutors manage own verification docs"
  on public.verification_documents for all
  to authenticated
  using (tutor_id = auth.uid())
  with check (tutor_id = auth.uid());

-- ============================================================
-- 5. STORAGE BUCKET FOR VERIFICATION DOCUMENTS
-- ============================================================
-- Private bucket, 10 MB cap, png/jpeg/pdf only.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'verification-documents',
  'verification-documents',
  false,
  10485760,
  array['image/png', 'image/jpeg', 'application/pdf']
)
on conflict (id) do update
  set public            = excluded.public,
      file_size_limit   = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- Tutors can upload to a folder named after their own user id.
drop policy if exists "Tutors upload own verification docs" on storage.objects;
create policy "Tutors upload own verification docs"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'verification-documents'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "Tutors read own verification docs" on storage.objects;
create policy "Tutors read own verification docs"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'verification-documents'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "Tutors delete own verification docs" on storage.objects;
create policy "Tutors delete own verification docs"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'verification-documents'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- ============================================================
-- 6. NOTIFICATION ENUM EXTENSION
-- ============================================================
do $$
begin
  if not exists (
    select 1 from pg_enum
    where enumtypid = 'notification_type'::regtype
      and enumlabel = 'verification_approved'
  ) then
    alter type notification_type add value 'verification_approved';
  end if;

  if not exists (
    select 1 from pg_enum
    where enumtypid = 'notification_type'::regtype
      and enumlabel = 'verification_rejected'
  ) then
    alter type notification_type add value 'verification_rejected';
  end if;

  if not exists (
    select 1 from pg_enum
    where enumtypid = 'notification_type'::regtype
      and enumlabel = 'verification_resubmission_requested'
  ) then
    alter type notification_type add value 'verification_resubmission_requested';
  end if;

  if not exists (
    select 1 from pg_enum
    where enumtypid = 'notification_type'::regtype
      and enumlabel = 'verification_submitted'
  ) then
    alter type notification_type add value 'verification_submitted';
  end if;
end $$;

-- ============================================================
-- 7. NOTIFICATION TRIGGER ON verification_status CHANGES
-- ============================================================
create or replace function public.notify_on_verification_change()
returns trigger as $$
begin
  -- only react to actual transitions
  if old.verification_status is distinct from new.verification_status then

    if new.verification_status = 'approved' then
      insert into public.notifications (user_id, type, title, body, link)
      values (
        new.id,
        'verification_approved',
        'You''re verified — welcome to TUTR',
        'Your tutor profile is approved and live for students to find.',
        '/tutor/dashboard'
      );

    elsif new.verification_status = 'rejected' then
      insert into public.notifications (user_id, type, title, body, link)
      values (
        new.id,
        'verification_rejected',
        'Verification needs another look',
        'We couldn''t approve your verification yet. Open your dashboard for next steps.',
        '/tutor/dashboard'
      );

    elsif new.verification_status = 'pending'
          and old.verification_status in ('approved', 'rejected') then
      insert into public.notifications (user_id, type, title, body, link)
      values (
        new.id,
        'verification_resubmission_requested',
        'Please resubmit your verification',
        'An admin asked you to update your verification documents.',
        '/tutor/verification'
      );
    end if;
  end if;

  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists trg_notify_verification_change on public.profiles;
create trigger trg_notify_verification_change
  after update of verification_status on public.profiles
  for each row execute function public.notify_on_verification_change();

-- ============================================================
-- 8. SESSIONS GUARD — block bookings against unapproved tutors
-- ============================================================
create or replace function public.block_unverified_tutor_session()
returns trigger as $$
declare
  vstatus verification_status;
begin
  select verification_status into vstatus
    from public.profiles
   where id = new.tutor_id;

  if vstatus is distinct from 'approved' then
    raise exception 'tutor_not_verified' using
      errcode = 'check_violation',
      hint    = 'This tutor is not verified yet — booking is disabled.';
  end if;

  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists trg_block_unverified_session on public.sessions;
create trigger trg_block_unverified_session
  before insert on public.sessions
  for each row execute function public.block_unverified_tutor_session();

drop trigger if exists trg_block_unverified_request on public.requests;
create or replace function public.block_unverified_tutor_request()
returns trigger as $$
declare
  vstatus verification_status;
begin
  select verification_status into vstatus
    from public.profiles
   where id = new.tutor_id;

  if vstatus is distinct from 'approved' then
    raise exception 'tutor_not_verified' using
      errcode = 'check_violation',
      hint    = 'This tutor is not verified yet — booking is disabled.';
  end if;

  return new;
end;
$$ language plpgsql security definer;

create trigger trg_block_unverified_request
  before insert on public.requests
  for each row execute function public.block_unverified_tutor_request();
