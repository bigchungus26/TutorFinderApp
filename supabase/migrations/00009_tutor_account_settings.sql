-- ============================================================
-- Tutr — Tutor account settings support
-- Adds richer tutor profile fields, a profile avatar storage
-- bucket, and an RPC for self-service account deletion.
-- ============================================================

alter table public.profiles
  add column if not exists phone_number text not null default '',
  add column if not exists gender text,
  add column if not exists date_of_birth date,
  add column if not exists city text not null default '',
  add column if not exists country text not null default '',
  add column if not exists accepting_students boolean not null default true,
  add column if not exists deactivated_at timestamptz;

alter table public.profiles
  drop constraint if exists profiles_gender_check,
  add constraint profiles_gender_check
    check (
      gender is null
      or gender in ('female', 'male', 'non_binary', 'prefer_not_to_say', 'other')
    );

create index if not exists idx_profiles_accepting_students
  on public.profiles(accepting_students)
  where role = 'tutor';

create index if not exists idx_profiles_deactivated_at
  on public.profiles(deactivated_at)
  where deactivated_at is not null;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'profile-avatars',
  'profile-avatars',
  true,
  5242880,
  array['image/png', 'image/jpeg', 'image/webp']
)
on conflict (id) do nothing;

drop policy if exists "Users upload own profile avatars" on storage.objects;
create policy "Users upload own profile avatars"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'profile-avatars'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "Public profile avatars are readable" on storage.objects;
create policy "Public profile avatars are readable"
on storage.objects for select
to public
using (bucket_id = 'profile-avatars');

drop policy if exists "Users update own profile avatars" on storage.objects;
create policy "Users update own profile avatars"
on storage.objects for update
to authenticated
using (
  bucket_id = 'profile-avatars'
  and (storage.foldername(name))[1] = auth.uid()::text
)
with check (
  bucket_id = 'profile-avatars'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "Users delete own profile avatars" on storage.objects;
create policy "Users delete own profile avatars"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'profile-avatars'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create or replace function public.delete_own_account()
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  target_user_id uuid := auth.uid();
begin
  if target_user_id is null then
    raise exception 'Not authenticated';
  end if;

  delete from auth.users
  where id = target_user_id;
end;
$$;

revoke all on function public.delete_own_account() from public;
grant execute on function public.delete_own_account() to authenticated;
