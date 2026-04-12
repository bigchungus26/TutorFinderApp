-- ============================================================
-- Fix for incorrect LAU course names from the original seed.
-- These rows were created with placeholder/guessed names before
-- we had the real LAU catalog data. This fixes them in place so
-- existing tutor_courses, sessions, and reviews keep working
-- (they reference by id, not by code).
--
-- Safe to re-run.
-- ============================================================

-- MTH 201: was "Calculus I" → should be "Calculus III"
update public.courses
set name = 'Calculus III',
    subject = 'Mathematics',
    description = 'Hyperbolic functions, integration techniques and improper integrals.'
where university_id = 'lau' and code = 'MTH 201';

-- CSC 243: was "Data Structures" → should be "Introduction to Object-Oriented Programming"
update public.courses
set name = 'Introduction to Object-Oriented Programming',
    subject = 'Computer Science',
    description = 'Introduces fundamental concepts and techniques of programming and problem solving.'
where university_id = 'lau' and code = 'CSC 243';

-- CSC 245: was "Algorithms" → should be "Objects and Data Abstraction"
update public.courses
set name = 'Objects and Data Abstraction',
    subject = 'Computer Science',
    description = 'Further techniques of OOP and problem solving, with emphasis on abstraction and data structures.'
where university_id = 'lau' and code = 'CSC 245';

-- CSC 310: was "Database Systems" → should be "Algorithms and Data Structures"
update public.courses
set name = 'Algorithms and Data Structures',
    subject = 'Computer Science',
    description = 'Fundamental computing algorithms and data structures, with emphasis on design and analysis.'
where university_id = 'lau' and code = 'CSC 310';

-- ECO 201: was "Principles of Economics" → should be "Microeconomics"
update public.courses
set name = 'Microeconomics',
    subject = 'Economics',
    description = 'Nature and scope of economics, consumer behavior, theory of the firm.'
where university_id = 'lau' and code = 'ECO 201';

-- BUS 201: was "Principles of Management" → should be "Introduction to Business"
update public.courses
set name = 'Introduction to Business',
    subject = 'Business',
    description = 'Introductory survey of the business environment.'
where university_id = 'lau' and code = 'BUS 201';

-- CSC 210: placeholder "Programming I" — LAU catalog has no such code.
-- Safe to delete since the real equivalent is CSC 243.
-- First clear any tutor_courses / sessions / reviews that reference it.
delete from public.tutor_courses where course_id in (select id from public.courses where university_id = 'lau' and code = 'CSC 210');
delete from public.courses where university_id = 'lau' and code = 'CSC 210';

-- PHY 211: placeholder "Physics I" — LAU uses PHY 201/202. Delete.
delete from public.tutor_courses where course_id in (select id from public.courses where university_id = 'lau' and code = 'PHY 211');
delete from public.courses where university_id = 'lau' and code = 'PHY 211';

-- MTH 201 from the ORIGINAL seed used prerequisite "MTH 102" but since we're
-- only updating the name, that's fine.

-- Verify: count all LAU math courses
select code, name from public.courses where university_id = 'lau' and code like 'MTH%' order by code;
