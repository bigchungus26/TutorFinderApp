-- ============================================================
-- Tutr — Demo Seed Data
-- Run this in the Supabase SQL Editor AFTER the tables, RLS,
-- and base seed (universities + courses) are in place.
--
-- This creates:
--   2 demo login accounts (student + tutor)
--   6 additional tutors with full profiles
--   3 additional students
--   Tutor-course assignments for all tutors
--   15 reviews across tutors
--   8 sessions (upcoming + completed) for the demo student
--   6 sessions for the demo tutor
--   4 pending requests for the demo tutor
--   Tutor stats for all tutors
--
-- DEMO ACCOUNTS:
--   Student:  student@tutr.app  /  Demo123!
--   Tutor:    tutor@tutr.app    /  Demo123!
-- ============================================================

-- ============================================================
-- 1. CREATE AUTH USERS
-- We insert directly into auth.users with bcrypt-hashed passwords.
-- The handle_new_user trigger will auto-create profile rows.
-- ============================================================

-- Demo Student
insert into auth.users (
  id, instance_id, email, encrypted_password, email_confirmed_at,
  aud, role, raw_user_meta_data, created_at, updated_at,
  confirmation_token, recovery_token, email_change_token_new, email_change
) values (
  '11111111-1111-1111-1111-111111111111',
  '00000000-0000-0000-0000-000000000000',
  'student@tutr.app',
  crypt('Demo123!', gen_salt('bf')),
  now(),
  'authenticated', 'authenticated',
  '{"full_name": "Andrew Khoury", "avatar_url": "https://i.pravatar.cc/300?img=68"}'::jsonb,
  now(), now(), '', '', '', ''
) on conflict (id) do nothing;

-- Demo Tutor
insert into auth.users (
  id, instance_id, email, encrypted_password, email_confirmed_at,
  aud, role, raw_user_meta_data, created_at, updated_at,
  confirmation_token, recovery_token, email_change_token_new, email_change
) values (
  '22222222-2222-2222-2222-222222222222',
  '00000000-0000-0000-0000-000000000000',
  'tutor@tutr.app',
  crypt('Demo123!', gen_salt('bf')),
  now(),
  'authenticated', 'authenticated',
  '{"full_name": "Karim Haddad", "avatar_url": "https://i.pravatar.cc/300?img=11"}'::jsonb,
  now(), now(), '', '', '', ''
) on conflict (id) do nothing;

-- Additional tutors
insert into auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, aud, role, raw_user_meta_data, created_at, updated_at, confirmation_token, recovery_token, email_change_token_new, email_change) values
('33333333-3333-3333-3333-333333333333', '00000000-0000-0000-0000-000000000000', 'lea@tutr.app',     crypt('Demo123!', gen_salt('bf')), now(), 'authenticated', 'authenticated', '{"full_name": "Lea Khalil", "avatar_url": "https://i.pravatar.cc/300?img=5"}'::jsonb, now(), now(), '', '', '', ''),
('44444444-4444-4444-4444-444444444444', '00000000-0000-0000-0000-000000000000', 'nour@tutr.app',    crypt('Demo123!', gen_salt('bf')), now(), 'authenticated', 'authenticated', '{"full_name": "Nour El-Amine", "avatar_url": "https://i.pravatar.cc/300?img=16"}'::jsonb, now(), now(), '', '', '', ''),
('55555555-5555-5555-5555-555555555555', '00000000-0000-0000-0000-000000000000', 'christy@tutr.app', crypt('Demo123!', gen_salt('bf')), now(), 'authenticated', 'authenticated', '{"full_name": "Christy Abou-Jaoudé", "avatar_url": "https://i.pravatar.cc/300?img=25"}'::jsonb, now(), now(), '', '', '', ''),
('66666666-6666-6666-6666-666666666666', '00000000-0000-0000-0000-000000000000', 'maya@tutr.app',    crypt('Demo123!', gen_salt('bf')), now(), 'authenticated', 'authenticated', '{"full_name": "Maya Rizk", "avatar_url": "https://i.pravatar.cc/300?img=26"}'::jsonb, now(), now(), '', '', '', ''),
('77777777-7777-7777-7777-777777777777', '00000000-0000-0000-0000-000000000000', 'sami@tutr.app',    crypt('Demo123!', gen_salt('bf')), now(), 'authenticated', 'authenticated', '{"full_name": "Sami Frem", "avatar_url": "https://i.pravatar.cc/300?img=17"}'::jsonb, now(), now(), '', '', '', ''),
('88888888-8888-8888-8888-888888888888', '00000000-0000-0000-0000-000000000000', 'nadine@tutr.app',  crypt('Demo123!', gen_salt('bf')), now(), 'authenticated', 'authenticated', '{"full_name": "Nadine Saade", "avatar_url": "https://i.pravatar.cc/300?img=28"}'::jsonb, now(), now(), '', '', '', '')
on conflict (id) do nothing;

-- Additional students
insert into auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, aud, role, raw_user_meta_data, created_at, updated_at, confirmation_token, recovery_token, email_change_token_new, email_change) values
('99999999-9999-9999-9999-999999999999', '00000000-0000-0000-0000-000000000000', 'sara@tutr.app',  crypt('Demo123!', gen_salt('bf')), now(), 'authenticated', 'authenticated', '{"full_name": "Sara Mansour", "avatar_url": "https://i.pravatar.cc/300?img=1"}'::jsonb, now(), now(), '', '', '', ''),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '00000000-0000-0000-0000-000000000000', 'ali@tutr.app',   crypt('Demo123!', gen_salt('bf')), now(), 'authenticated', 'authenticated', '{"full_name": "Ali Karam", "avatar_url": "https://i.pravatar.cc/300?img=3"}'::jsonb, now(), now(), '', '', '', ''),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '00000000-0000-0000-0000-000000000000', 'mia@tutr.app',   crypt('Demo123!', gen_salt('bf')), now(), 'authenticated', 'authenticated', '{"full_name": "Mia Rahal", "avatar_url": "https://i.pravatar.cc/300?img=10"}'::jsonb, now(), now(), '', '', '', '')
on conflict (id) do nothing;

-- ============================================================
-- 2. UPDATE PROFILES
-- The trigger created bare profiles. Now fill them with real data.
-- ============================================================

-- Demo Student — Andrew Khoury
update public.profiles set
  role = 'student',
  full_name = 'Andrew Khoury',
  avatar_url = 'https://i.pravatar.cc/300?img=68',
  university_id = 'aub',
  major = 'Computer Science',
  year = 'Junior',
  agreed_terms_at = now(),
  onboarded_at = now()
where id = '11111111-1111-1111-1111-111111111111';

-- Demo Tutor — Karim Haddad
update public.profiles set
  role = 'tutor',
  full_name = 'Karim Haddad',
  avatar_url = 'https://i.pravatar.cc/300?img=11',
  university_id = 'aub',
  major = 'Computer Science',
  year = 'Senior',
  bio = 'I''ve been tutoring CS since sophomore year. I break down complex algorithms into bite-sized steps and make sure you actually understand the why, not just the how.',
  hourly_rate = 15,
  verified = true,
  online = true,
  in_person = true,
  agreed_terms_at = now(),
  onboarded_at = now()
where id = '22222222-2222-2222-2222-222222222222';

-- Lea Khalil — AUB Biology tutor
update public.profiles set
  role = 'tutor',
  full_name = 'Lea Khalil',
  avatar_url = 'https://i.pravatar.cc/300?img=5',
  university_id = 'aub',
  major = 'Biology',
  year = 'Junior',
  bio = 'Pre-med student who loves making bio and chem click. I use visual aids and mnemonics to help you remember everything for exams.',
  hourly_rate = 12,
  verified = true,
  online = true,
  in_person = true,
  agreed_terms_at = now(),
  onboarded_at = now()
where id = '33333333-3333-3333-3333-333333333333';

-- Nour El-Amine — LAU CS tutor
update public.profiles set
  role = 'tutor',
  full_name = 'Nour El-Amine',
  avatar_url = 'https://i.pravatar.cc/300?img=16',
  university_id = 'lau',
  major = 'Computer Science',
  year = 'Senior',
  bio = 'Full-stack developer and CS tutor. I make data structures and algorithms fun with real-world examples and hands-on coding sessions.',
  hourly_rate = 16,
  verified = true,
  online = true,
  in_person = true,
  agreed_terms_at = now(),
  onboarded_at = now()
where id = '44444444-4444-4444-4444-444444444444';

-- Christy Abou-Jaoudé — LAU Math tutor
update public.profiles set
  role = 'tutor',
  full_name = 'Christy Abou-Jaoudé',
  avatar_url = 'https://i.pravatar.cc/300?img=25',
  university_id = 'lau',
  major = 'Mathematics',
  year = 'Junior',
  bio = 'Patient, methodical, and always prepared. I bring practice problems to every session and explain step by step.',
  hourly_rate = 15,
  verified = true,
  online = true,
  in_person = true,
  agreed_terms_at = now(),
  onboarded_at = now()
where id = '55555555-5555-5555-5555-555555555555';

-- Maya Rizk — NDU CS tutor
update public.profiles set
  role = 'tutor',
  full_name = 'Maya Rizk',
  avatar_url = 'https://i.pravatar.cc/300?img=26',
  university_id = 'ndu',
  major = 'Computer Science',
  year = 'Senior',
  bio = 'I''ve mentored dozens of freshmen through their first programming course. Patient, clear, and always available for follow-up questions.',
  hourly_rate = 14,
  verified = true,
  online = true,
  in_person = true,
  agreed_terms_at = now(),
  onboarded_at = now()
where id = '66666666-6666-6666-6666-666666666666';

-- Sami Frem — NDU Math tutor
update public.profiles set
  role = 'tutor',
  full_name = 'Sami Frem',
  avatar_url = 'https://i.pravatar.cc/300?img=17',
  university_id = 'ndu',
  major = 'Mathematics',
  year = 'Junior',
  bio = 'Calculus doesn''t have to be scary. I build your confidence through practice and clear explanations.',
  hourly_rate = 12,
  verified = true,
  online = true,
  in_person = true,
  agreed_terms_at = now(),
  onboarded_at = now()
where id = '77777777-7777-7777-7777-777777777777';

-- Nadine Saade — AUB Architecture tutor
update public.profiles set
  role = 'tutor',
  full_name = 'Nadine Saade',
  avatar_url = 'https://i.pravatar.cc/300?img=28',
  university_id = 'aub',
  major = 'Architecture',
  year = 'Senior',
  bio = 'Design thinking is a skill you can learn. I help architecture students find their creative voice while nailing the technical requirements.',
  hourly_rate = 22,
  verified = true,
  online = false,
  in_person = true,
  agreed_terms_at = now(),
  onboarded_at = now()
where id = '88888888-8888-8888-8888-888888888888';

-- Student — Sara Mansour
update public.profiles set
  role = 'student',
  full_name = 'Sara Mansour',
  avatar_url = 'https://i.pravatar.cc/300?img=1',
  university_id = 'aub',
  major = 'Computer Science',
  year = 'Sophomore',
  agreed_terms_at = now(),
  onboarded_at = now()
where id = '99999999-9999-9999-9999-999999999999';

-- Student — Ali Karam
update public.profiles set
  role = 'student',
  full_name = 'Ali Karam',
  avatar_url = 'https://i.pravatar.cc/300?img=3',
  university_id = 'aub',
  major = 'Engineering',
  year = 'Freshman',
  agreed_terms_at = now(),
  onboarded_at = now()
where id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';

-- Student — Mia Rahal
update public.profiles set
  role = 'student',
  full_name = 'Mia Rahal',
  avatar_url = 'https://i.pravatar.cc/300?img=10',
  university_id = 'lau',
  major = 'Pre-med',
  year = 'Sophomore',
  agreed_terms_at = now(),
  onboarded_at = now()
where id = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';

-- ============================================================
-- 3. TUTOR COURSES
-- Assign courses each tutor teaches (looked up by course code).
-- ============================================================

-- Karim Haddad (AUB CS) — teaches 4 CS courses
insert into public.tutor_courses (tutor_id, course_id, grade) values
  ('22222222-2222-2222-2222-222222222222', (select id from public.courses where code = 'CMPS 200' and university_id = 'aub'), 'A'),
  ('22222222-2222-2222-2222-222222222222', (select id from public.courses where code = 'CMPS 211' and university_id = 'aub'), 'A'),
  ('22222222-2222-2222-2222-222222222222', (select id from public.courses where code = 'CMPS 274' and university_id = 'aub'), 'A-'),
  ('22222222-2222-2222-2222-222222222222', (select id from public.courses where code = 'CMPS 252' and university_id = 'aub'), 'A')
on conflict (tutor_id, course_id) do nothing;

-- Lea Khalil (AUB Bio) — teaches bio + chem
insert into public.tutor_courses (tutor_id, course_id, grade) values
  ('33333333-3333-3333-3333-333333333333', (select id from public.courses where code = 'BIOL 201' and university_id = 'aub'), 'A'),
  ('33333333-3333-3333-3333-333333333333', (select id from public.courses where code = 'CHEM 201' and university_id = 'aub'), 'A-')
on conflict (tutor_id, course_id) do nothing;

-- Nour El-Amine (LAU CS) — teaches 4 CS courses
insert into public.tutor_courses (tutor_id, course_id, grade) values
  ('44444444-4444-4444-4444-444444444444', (select id from public.courses where code = 'CSC 210' and university_id = 'lau'), 'A'),
  ('44444444-4444-4444-4444-444444444444', (select id from public.courses where code = 'CSC 243' and university_id = 'lau'), 'A'),
  ('44444444-4444-4444-4444-444444444444', (select id from public.courses where code = 'CSC 245' and university_id = 'lau'), 'A-'),
  ('44444444-4444-4444-4444-444444444444', (select id from public.courses where code = 'CSC 310' and university_id = 'lau'), 'A')
on conflict (tutor_id, course_id) do nothing;

-- Christy (LAU Math) — teaches calc + physics
insert into public.tutor_courses (tutor_id, course_id, grade) values
  ('55555555-5555-5555-5555-555555555555', (select id from public.courses where code = 'MTH 201' and university_id = 'lau'), 'A'),
  ('55555555-5555-5555-5555-555555555555', (select id from public.courses where code = 'PHY 211' and university_id = 'lau'), 'A-')
on conflict (tutor_id, course_id) do nothing;

-- Maya Rizk (NDU CS) — teaches 2 CS courses
insert into public.tutor_courses (tutor_id, course_id, grade) values
  ('66666666-6666-6666-6666-666666666666', (select id from public.courses where code = 'CSC 207' and university_id = 'ndu'), 'A'),
  ('66666666-6666-6666-6666-666666666666', (select id from public.courses where code = 'CSC 226' and university_id = 'ndu'), 'A')
on conflict (tutor_id, course_id) do nothing;

-- Sami Frem (NDU Math) — teaches calc
insert into public.tutor_courses (tutor_id, course_id, grade) values
  ('77777777-7777-7777-7777-777777777777', (select id from public.courses where code = 'MAT 211' and university_id = 'ndu'), 'A')
on conflict (tutor_id, course_id) do nothing;

-- Nadine Saade (AUB Arch) — teaches design studio
insert into public.tutor_courses (tutor_id, course_id, grade) values
  ('88888888-8888-8888-8888-888888888888', (select id from public.courses where code = 'ARCH 201' and university_id = 'aub'), 'A')
on conflict (tutor_id, course_id) do nothing;

-- ============================================================
-- 4. SESSIONS — for Demo Student (Andrew) as student
-- 5 upcoming + 5 completed
-- ============================================================

-- Upcoming sessions (Andrew as student)
insert into public.sessions (tutor_id, student_id, course_id, date, time, duration, location, status, price) values
  ('22222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111',
   (select id from public.courses where code = 'CMPS 200' and university_id = 'aub'),
   current_date + interval '1 day', '14:00', 60, 'online', 'upcoming', 15),

  ('33333333-3333-3333-3333-333333333333', '11111111-1111-1111-1111-111111111111',
   (select id from public.courses where code = 'BIOL 201' and university_id = 'aub'),
   current_date + interval '3 days', '10:00', 60, 'in-person', 'upcoming', 12),

  ('88888888-8888-8888-8888-888888888888', '11111111-1111-1111-1111-111111111111',
   (select id from public.courses where code = 'ARCH 201' and university_id = 'aub'),
   current_date + interval '5 days', '09:00', 90, 'in-person', 'upcoming', 33),

  ('22222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111',
   (select id from public.courses where code = 'CMPS 211' and university_id = 'aub'),
   current_date + interval '7 days', '16:00', 60, 'online', 'upcoming', 15),

  ('33333333-3333-3333-3333-333333333333', '11111111-1111-1111-1111-111111111111',
   (select id from public.courses where code = 'CHEM 201' and university_id = 'aub'),
   current_date + interval '9 days', '11:00', 60, 'in-person', 'upcoming', 12);

-- Completed sessions (Andrew as student)
insert into public.sessions (tutor_id, student_id, course_id, date, time, duration, location, status, price) values
  ('22222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111',
   (select id from public.courses where code = 'CMPS 200' and university_id = 'aub'),
   current_date - interval '5 days', '15:00', 60, 'online', 'completed', 15),

  ('22222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111',
   (select id from public.courses where code = 'CMPS 274' and university_id = 'aub'),
   current_date - interval '12 days', '10:00', 60, 'in-person', 'completed', 15),

  ('33333333-3333-3333-3333-333333333333', '11111111-1111-1111-1111-111111111111',
   (select id from public.courses where code = 'BIOL 201' and university_id = 'aub'),
   current_date - interval '18 days', '14:00', 60, 'online', 'completed', 12),

  ('88888888-8888-8888-8888-888888888888', '11111111-1111-1111-1111-111111111111',
   (select id from public.courses where code = 'ARCH 201' and university_id = 'aub'),
   current_date - interval '25 days', '11:00', 90, 'in-person', 'completed', 33),

  ('22222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111',
   (select id from public.courses where code = 'CMPS 252' and university_id = 'aub'),
   current_date - interval '30 days', '16:00', 60, 'online', 'completed', 15);

-- ============================================================
-- 5. SESSIONS — for Demo Tutor (Karim) as tutor
-- These are with OTHER students so he sees them on his dashboard.
-- ============================================================

insert into public.sessions (tutor_id, student_id, course_id, date, time, duration, location, status, price) values
  -- Completed sessions (for earnings page)
  ('22222222-2222-2222-2222-222222222222', '99999999-9999-9999-9999-999999999999',
   (select id from public.courses where code = 'CMPS 200' and university_id = 'aub'),
   current_date - interval '2 days', '10:00', 60, 'online', 'completed', 15),

  ('22222222-2222-2222-2222-222222222222', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
   (select id from public.courses where code = 'CMPS 211' and university_id = 'aub'),
   current_date - interval '4 days', '14:00', 60, 'in-person', 'completed', 15),

  ('22222222-2222-2222-2222-222222222222', '99999999-9999-9999-9999-999999999999',
   (select id from public.courses where code = 'CMPS 274' and university_id = 'aub'),
   current_date - interval '8 days', '16:00', 60, 'online', 'completed', 15),

  ('22222222-2222-2222-2222-222222222222', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
   (select id from public.courses where code = 'CMPS 200' and university_id = 'aub'),
   current_date - interval '15 days', '10:00', 60, 'online', 'completed', 15),

  ('22222222-2222-2222-2222-222222222222', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
   (select id from public.courses where code = 'CMPS 252' and university_id = 'aub'),
   current_date - interval '20 days', '11:00', 60, 'in-person', 'completed', 15),

  ('22222222-2222-2222-2222-222222222222', '99999999-9999-9999-9999-999999999999',
   (select id from public.courses where code = 'CMPS 211' and university_id = 'aub'),
   current_date - interval '28 days', '14:00', 60, 'online', 'completed', 15);

-- ============================================================
-- 6. REQUESTS — pending requests TO the Demo Tutor (Karim)
-- ============================================================

insert into public.requests (student_id, tutor_id, course_id, date, time, duration, location, message, status) values
  ('99999999-9999-9999-9999-999999999999', '22222222-2222-2222-2222-222222222222',
   (select id from public.courses where code = 'CMPS 200' and university_id = 'aub'),
   current_date + interval '2 days', '14:00', 60, 'online',
   'Hi! I need help understanding pointers and memory in C++. Exam is next week!', 'pending'),

  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '22222222-2222-2222-2222-222222222222',
   (select id from public.courses where code = 'CMPS 211' and university_id = 'aub'),
   current_date + interval '4 days', '10:00', 60, 'in-person',
   'Can we go over graph theory proofs? I''m struggling with the homework.', 'pending'),

  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '22222222-2222-2222-2222-222222222222',
   (select id from public.courses where code = 'CMPS 200' and university_id = 'aub'),
   current_date + interval '3 days', '16:00', 90, 'online',
   'Need a crash course on OOP before the midterm. Can we do 90 min?', 'pending'),

  ('99999999-9999-9999-9999-999999999999', '22222222-2222-2222-2222-222222222222',
   (select id from public.courses where code = 'CMPS 274' and university_id = 'aub'),
   current_date + interval '6 days', '11:00', 60, 'online',
   'Struggling with process synchronization concepts. Would love your help!', 'pending');

-- ============================================================
-- 7. REVIEWS — across multiple tutors
-- The trigger will auto-update tutor_stats on each insert.
-- ============================================================

-- Reviews for Karim Haddad (Demo Tutor)
insert into public.reviews (tutor_id, student_id, course_id, rating, comment, created_at) values
  ('22222222-2222-2222-2222-222222222222', '99999999-9999-9999-9999-999999999999',
   (select id from public.courses where code = 'CMPS 200' and university_id = 'aub'),
   5, 'Karim is amazing! He explained recursion in a way that finally clicked. Went from a C to an A- on my final.', now() - interval '10 days'),

  ('22222222-2222-2222-2222-222222222222', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
   (select id from public.courses where code = 'CMPS 211' and university_id = 'aub'),
   5, 'Best tutor for CMPS. Very patient and always prepared with examples.', now() - interval '20 days'),

  ('22222222-2222-2222-2222-222222222222', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
   (select id from public.courses where code = 'CMPS 200' and university_id = 'aub'),
   4, 'Great explanations, sometimes goes a bit fast but always willing to repeat.', now() - interval '30 days'),

  ('22222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111',
   (select id from public.courses where code = 'CMPS 274' and university_id = 'aub'),
   5, 'Made OS concepts so much clearer. The diagrams he drew for process scheduling were incredible.', now() - interval '15 days'),

  ('22222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111',
   (select id from public.courses where code = 'CMPS 252' and university_id = 'aub'),
   5, 'Helped me ace the software engineering group project. Great at explaining design patterns.', now() - interval '32 days');

-- Reviews for Lea Khalil
insert into public.reviews (tutor_id, student_id, course_id, rating, comment, created_at) values
  ('33333333-3333-3333-3333-333333333333', '11111111-1111-1111-1111-111111111111',
   (select id from public.courses where code = 'BIOL 201' and university_id = 'aub'),
   5, 'Lea''s mnemonics saved my bio grade. She makes complex pathways simple.', now() - interval '20 days'),

  ('33333333-3333-3333-3333-333333333333', '99999999-9999-9999-9999-999999999999',
   (select id from public.courses where code = 'CHEM 201' and university_id = 'aub'),
   5, 'Very organized sessions. Always brings diagrams and practice questions.', now() - interval '25 days'),

  ('33333333-3333-3333-3333-333333333333', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
   (select id from public.courses where code = 'BIOL 201' and university_id = 'aub'),
   4, 'Great tutor overall. Helped me understand genetics way better.', now() - interval '35 days');

-- Reviews for Nour El-Amine
insert into public.reviews (tutor_id, student_id, course_id, rating, comment, created_at) values
  ('44444444-4444-4444-4444-444444444444', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
   (select id from public.courses where code = 'CSC 243' and university_id = 'lau'),
   5, 'Nour makes algorithms fun. His real-world examples helped everything click.', now() - interval '12 days'),

  ('44444444-4444-4444-4444-444444444444', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
   (select id from public.courses where code = 'CSC 310' and university_id = 'lau'),
   4, 'Great tutor, very approachable. Helped me debug my database project.', now() - interval '22 days');

-- Reviews for Christy
insert into public.reviews (tutor_id, student_id, course_id, rating, comment, created_at) values
  ('55555555-5555-5555-5555-555555555555', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
   (select id from public.courses where code = 'MTH 201' and university_id = 'lau'),
   5, 'Christy is so patient! She stayed an extra 30 min to make sure I understood integrals.', now() - interval '8 days'),

  ('55555555-5555-5555-5555-555555555555', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
   (select id from public.courses where code = 'MTH 201' and university_id = 'lau'),
   5, 'Best math tutor at LAU, hands down. Very structured approach.', now() - interval '18 days');

-- Reviews for Maya Rizk
insert into public.reviews (tutor_id, student_id, course_id, rating, comment, created_at) values
  ('66666666-6666-6666-6666-666666666666', '99999999-9999-9999-9999-999999999999',
   (select id from public.courses where code = 'CSC 207' and university_id = 'ndu'),
   5, 'Maya helped me go from failing CSC 207 to getting a B+. Life saver!', now() - interval '14 days'),

  ('66666666-6666-6666-6666-666666666666', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
   (select id from public.courses where code = 'CSC 226' and university_id = 'ndu'),
   4, 'Very clear and organized. Great at explaining OOP concepts.', now() - interval '28 days');

-- Review for Nadine Saade
insert into public.reviews (tutor_id, student_id, course_id, rating, comment, created_at) values
  ('88888888-8888-8888-8888-888888888888', '11111111-1111-1111-1111-111111111111',
   (select id from public.courses where code = 'ARCH 201' and university_id = 'aub'),
   5, 'Nadine has an incredible eye for design. She helped me think about space differently.', now() - interval '27 days');

-- ============================================================
-- 8. MANUALLY SET tutor_stats response_time
-- (The trigger auto-calculates rating/review_count/sessions_completed,
--  but response_time is a text field we set manually.)
-- ============================================================

update public.tutor_stats set response_time = '< 1 hour'  where tutor_id = '22222222-2222-2222-2222-222222222222';
update public.tutor_stats set response_time = '< 2 hours' where tutor_id = '33333333-3333-3333-3333-333333333333';
update public.tutor_stats set response_time = '< 1 hour'  where tutor_id = '44444444-4444-4444-4444-444444444444';
update public.tutor_stats set response_time = '< 1 hour'  where tutor_id = '55555555-5555-5555-5555-555555555555';
update public.tutor_stats set response_time = '< 1 hour'  where tutor_id = '66666666-6666-6666-6666-666666666666';
update public.tutor_stats set response_time = '< 2 hours' where tutor_id = '77777777-7777-7777-7777-777777777777';
update public.tutor_stats set response_time = '< 1 hour'  where tutor_id = '88888888-8888-8888-8888-888888888888';

-- Sami has no reviews yet, so tutor_stats won't exist from the trigger.
-- Insert it manually.
insert into public.tutor_stats (tutor_id, rating, review_count, sessions_completed, response_time)
values ('77777777-7777-7777-7777-777777777777', 0, 0, 0, '< 2 hours')
on conflict (tutor_id) do update set response_time = '< 2 hours';

-- ============================================================
-- DONE! You can now log in with:
--   Student view:  student@tutr.app  /  Demo123!
--   Tutor view:    tutor@tutr.app    /  Demo123!
-- ============================================================
