-- ============================================================
-- Teachme — Seed Data
-- Run this AFTER both migration files to populate reference data.
-- Note: Profiles, sessions, requests, and reviews require real
-- auth.users entries — those are seeded via the app or manually.
-- This file seeds universities and courses only.
-- ============================================================

-- ============================================================
-- UNIVERSITIES
-- ============================================================
insert into public.universities (id, name, short_name, color) values
  ('aub', 'American University of Beirut', 'AUB', '#8B0000'),
  ('lau', 'Lebanese American University', 'LAU', '#003DA5'),
  ('ndu', 'Notre Dame University', 'NDU', '#0B6E4F')
on conflict (id) do nothing;

-- ============================================================
-- COURSES
-- ============================================================
insert into public.courses (id, code, name, university_id, subject, description, credits, prerequisites, typical_semester) values
  -- AUB
  (gen_random_uuid(), 'CMPS 200', 'Introduction to Programming',      'aub', 'Computer Science', 'Intro to programming with C++. Covers variables, loops, functions, arrays, and basic OOP.', 3, '{}', 'Fall / Spring'),
  (gen_random_uuid(), 'CMPS 211', 'Discrete Structures',              'aub', 'Computer Science', 'Logic, sets, relations, functions, graphs, and proof techniques.', 3, '{CMPS 200}', 'Fall / Spring'),
  (gen_random_uuid(), 'EECE 230', 'Introduction to Computing',        'aub', 'Engineering',      'Programming in Python for engineers. Data structures, algorithms, and applications.', 3, '{}', 'Fall'),
  (gen_random_uuid(), 'MATH 201', 'Calculus III',                      'aub', 'Mathematics',      'Multivariable calculus: partial derivatives, multiple integrals, vector calculus.', 3, '{MATH 102}', 'Fall / Spring'),
  (gen_random_uuid(), 'MATH 218', 'Linear Algebra',                    'aub', 'Mathematics',      'Matrices, vector spaces, eigenvalues, and linear transformations.', 3, '{MATH 201}', 'Spring'),
  (gen_random_uuid(), 'BIOL 201', 'General Biology I',                 'aub', 'Biology',          'Cell biology, genetics, molecular biology, and evolution.', 4, '{}', 'Fall'),
  (gen_random_uuid(), 'CHEM 201', 'General Chemistry I',               'aub', 'Chemistry',        'Atomic structure, bonding, stoichiometry, and thermochemistry.', 4, '{}', 'Fall'),
  (gen_random_uuid(), 'ECON 211', 'Principles of Microeconomics',      'aub', 'Economics',        'Supply and demand, market structures, consumer theory, and welfare economics.', 3, '{}', 'Fall / Spring'),
  (gen_random_uuid(), 'CMPS 274', 'Operating Systems',                 'aub', 'Computer Science', 'Processes, threads, memory management, file systems, and synchronization.', 3, '{CMPS 211}', 'Spring'),
  (gen_random_uuid(), 'PHYS 210', 'General Physics I',                 'aub', 'Physics',          'Mechanics, waves, and thermodynamics with calculus.', 4, '{MATH 201}', 'Fall'),
  (gen_random_uuid(), 'CMPS 252', 'Software Engineering',              'aub', 'Computer Science', 'Software development lifecycle, design patterns, and team projects.', 3, '{CMPS 211}', 'Fall'),
  (gen_random_uuid(), 'ARAB 201', 'Arabic Literature',                 'aub', 'Languages',        'Survey of classical and modern Arabic literature.', 3, '{}', 'Fall / Spring'),
  (gen_random_uuid(), 'ARCH 201', 'Design Studio I',                   'aub', 'Architecture',     'Introductory architectural design studio with emphasis on spatial thinking.', 6, '{}', 'Fall'),

  -- LAU
  (gen_random_uuid(), 'CSC 243',  'Data Structures',                   'lau', 'Computer Science', 'Arrays, linked lists, trees, graphs, sorting, and searching algorithms.', 3, '{CSC 210}', 'Spring'),
  (gen_random_uuid(), 'CSC 210',  'Programming I',                     'lau', 'Computer Science', 'Introduction to programming using Java. OOP concepts and problem solving.', 3, '{}', 'Fall'),
  (gen_random_uuid(), 'BIO 201',  'General Biology I',                 'lau', 'Biology',          'Fundamentals of cell biology, genetics, and ecology.', 4, '{}', 'Fall'),
  (gen_random_uuid(), 'MTH 201',  'Calculus I',                        'lau', 'Mathematics',      'Limits, derivatives, and integrals of single-variable functions.', 3, '{}', 'Fall / Spring'),
  (gen_random_uuid(), 'ECO 201',  'Principles of Economics',           'lau', 'Economics',        'Micro and macroeconomic principles, market equilibrium, and policy.', 3, '{}', 'Fall'),
  (gen_random_uuid(), 'BUS 201',  'Principles of Management',          'lau', 'Business',         'Planning, organizing, leading, and controlling in organizations.', 3, '{}', 'Fall / Spring'),
  (gen_random_uuid(), 'CSC 245',  'Algorithms',                        'lau', 'Computer Science', 'Design and analysis of algorithms: divide and conquer, dynamic programming, greedy.', 3, '{CSC 243}', 'Fall'),
  (gen_random_uuid(), 'PHY 211',  'Physics I',                         'lau', 'Physics',          'Newtonian mechanics, energy, momentum, and rotational dynamics.', 4, '{}', 'Fall'),
  (gen_random_uuid(), 'PSY 201',  'Introduction to Psychology',        'lau', 'Psychology',       'Foundations of psychology: cognition, behavior, development, and disorders.', 3, '{}', 'Fall / Spring'),
  (gen_random_uuid(), 'CSC 310',  'Database Systems',                  'lau', 'Computer Science', 'Relational databases, SQL, normalization, and database design.', 3, '{CSC 243}', 'Fall'),

  -- NDU
  (gen_random_uuid(), 'CSC 207',  'Computer Programming',              'ndu', 'Computer Science', 'Fundamentals of programming in C. Problem solving and algorithmic thinking.', 3, '{}', 'Fall'),
  (gen_random_uuid(), 'CSC 226',  'Object-Oriented Programming',       'ndu', 'Computer Science', 'OOP in Java: classes, inheritance, polymorphism, interfaces.', 3, '{CSC 207}', 'Spring'),
  (gen_random_uuid(), 'MAT 211',  'Calculus I',                        'ndu', 'Mathematics',      'Limits, continuity, differentiation, and integration.', 3, '{}', 'Fall / Spring'),
  (gen_random_uuid(), 'BIO 211',  'Biology I',                         'ndu', 'Biology',          'Cell structure, metabolism, genetics, and molecular biology.', 4, '{}', 'Fall'),
  (gen_random_uuid(), 'CHM 211',  'Chemistry I',                       'ndu', 'Chemistry',        'General chemistry: atoms, molecules, reactions, and solutions.', 4, '{}', 'Fall'),
  (gen_random_uuid(), 'ACC 210',  'Financial Accounting',              'ndu', 'Business',         'Accounting principles, financial statements, and analysis.', 3, '{}', 'Fall / Spring'),
  (gen_random_uuid(), 'ENG 211',  'English Composition',               'ndu', 'Languages',        'Academic writing, research, and argumentation.', 3, '{}', 'Fall / Spring'),
  (gen_random_uuid(), 'PHI 201',  'Introduction to Philosophy',        'ndu', 'Humanities',       'Major philosophical traditions, ethics, epistemology, and metaphysics.', 3, '{}', 'Fall / Spring')
on conflict do nothing;
