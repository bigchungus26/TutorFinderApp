-- ============================================================
-- Teachme — Seed Data (Expanded)
-- Includes: universities, 60+ courses, 20 tutor profiles,
--           30 reviews, availability, sample notifications.
-- Run AFTER all migrations.
-- ============================================================

-- ============================================================
-- UNIVERSITIES
-- ============================================================
insert into public.universities (id, name, short_name, color) values
  ('aub', 'American University of Beirut', 'AUB', '#8B0000'),
  ('lau', 'Lebanese American University', 'LAU', '#003DA5'),
  ('ndu', 'Notre Dame University',         'NDU', '#0B6E4F')
on conflict (id) do nothing;

-- ============================================================
-- COURSES (60+ across AUB, LAU, NDU)
-- ============================================================
insert into public.courses (id, code, name, university_id, subject, description, credits, prerequisites, typical_semester) values
  -- ── AUB ──────────────────────────────────────────────────
  ('10000000-0000-0000-0000-000000000001', 'CMPS 200', 'Introduction to Programming',       'aub', 'Computer Science', 'Intro to programming with C++. Variables, loops, functions, arrays, basic OOP.', 3, '{}', 'Fall / Spring'),
  ('10000000-0000-0000-0000-000000000002', 'CMPS 211', 'Discrete Structures',               'aub', 'Computer Science', 'Logic, sets, relations, functions, graphs, proof techniques.', 3, '{CMPS 200}', 'Fall / Spring'),
  ('10000000-0000-0000-0000-000000000003', 'CMPS 274', 'Operating Systems',                 'aub', 'Computer Science', 'Processes, threads, memory management, file systems, synchronization.', 3, '{CMPS 211}', 'Spring'),
  ('10000000-0000-0000-0000-000000000004', 'CMPS 252', 'Software Engineering',              'aub', 'Computer Science', 'Software lifecycle, design patterns, team projects.', 3, '{CMPS 211}', 'Fall'),
  ('10000000-0000-0000-0000-000000000005', 'CMPS 303', 'Algorithms',                        'aub', 'Computer Science', 'Sorting, dynamic programming, graph algorithms, complexity.', 3, '{CMPS 211}', 'Fall'),
  ('10000000-0000-0000-0000-000000000006', 'CMPS 277', 'Database Systems',                  'aub', 'Computer Science', 'Relational model, SQL, normalization, transactions.', 3, '{CMPS 211}', 'Spring'),
  ('10000000-0000-0000-0000-000000000007', 'CMPS 282', 'Computer Networks',                 'aub', 'Computer Science', 'TCP/IP, HTTP, routing, network security.', 3, '{CMPS 274}', 'Fall'),
  ('10000000-0000-0000-0000-000000000008', 'EECE 230', 'Introduction to Computing',         'aub', 'Engineering',      'Python for engineers: data structures, algorithms, applications.', 3, '{}', 'Fall'),
  ('10000000-0000-0000-0000-000000000009', 'EECE 310', 'Signals & Systems',                 'aub', 'Engineering',      'Continuous and discrete-time signals, Fourier analysis, filtering.', 3, '{MATH 201}', 'Spring'),
  ('10000000-0000-0000-0000-000000000010', 'MATH 201', 'Calculus III',                      'aub', 'Mathematics',      'Multivariable calculus, partial derivatives, multiple integrals.', 3, '{MATH 102}', 'Fall / Spring'),
  ('10000000-0000-0000-0000-000000000011', 'MATH 218', 'Linear Algebra',                    'aub', 'Mathematics',      'Matrices, vector spaces, eigenvalues, linear transformations.', 3, '{MATH 201}', 'Spring'),
  ('10000000-0000-0000-0000-000000000012', 'MATH 202', 'Differential Equations',            'aub', 'Mathematics',      'ODEs: separable, linear, Laplace transforms, systems.', 3, '{MATH 201}', 'Fall / Spring'),
  ('10000000-0000-0000-0000-000000000013', 'MATH 212', 'Probability & Statistics',          'aub', 'Mathematics',      'Sample spaces, distributions, hypothesis testing, regression.', 3, '{MATH 201}', 'Spring'),
  ('10000000-0000-0000-0000-000000000014', 'BIOL 201', 'General Biology I',                 'aub', 'Biology',          'Cell biology, genetics, molecular biology, evolution.', 4, '{}', 'Fall'),
  ('10000000-0000-0000-0000-000000000015', 'BIOL 210', 'Genetics',                          'aub', 'Biology',          'Mendelian genetics, DNA replication, gene expression.', 3, '{BIOL 201}', 'Spring'),
  ('10000000-0000-0000-0000-000000000016', 'CHEM 201', 'General Chemistry I',               'aub', 'Chemistry',        'Atomic structure, bonding, stoichiometry, thermochemistry.', 4, '{}', 'Fall'),
  ('10000000-0000-0000-0000-000000000017', 'CHEM 211', 'Organic Chemistry I',               'aub', 'Chemistry',        'Hydrocarbons, functional groups, stereochemistry, reactions.', 4, '{CHEM 201}', 'Spring'),
  ('10000000-0000-0000-0000-000000000018', 'ECON 211', 'Principles of Microeconomics',      'aub', 'Economics',        'Supply/demand, market structures, consumer theory, welfare.', 3, '{}', 'Fall / Spring'),
  ('10000000-0000-0000-0000-000000000019', 'ECON 212', 'Principles of Macroeconomics',      'aub', 'Economics',        'GDP, inflation, unemployment, monetary/fiscal policy.', 3, '{}', 'Fall / Spring'),
  ('10000000-0000-0000-0000-000000000020', 'PHYS 210', 'General Physics I',                 'aub', 'Physics',          'Mechanics, waves, thermodynamics with calculus.', 4, '{MATH 201}', 'Fall'),
  ('10000000-0000-0000-0000-000000000021', 'PHYS 211', 'General Physics II',                'aub', 'Physics',          'Electromagnetism, optics, modern physics.', 4, '{PHYS 210}', 'Spring'),
  ('10000000-0000-0000-0000-000000000022', 'ARAB 201', 'Arabic Literature',                 'aub', 'Languages',        'Survey of classical and modern Arabic literature.', 3, '{}', 'Fall / Spring'),
  ('10000000-0000-0000-0000-000000000023', 'ARCH 201', 'Design Studio I',                   'aub', 'Architecture',     'Intro architectural design with emphasis on spatial thinking.', 6, '{}', 'Fall'),

  -- ── LAU ──────────────────────────────────────────────────
  ('20000000-0000-0000-0000-000000000001', 'CSC 210',  'Programming I',                     'lau', 'Computer Science', 'Intro to Java. OOP concepts and problem solving.', 3, '{}', 'Fall'),
  ('20000000-0000-0000-0000-000000000002', 'CSC 211',  'Programming II',                    'lau', 'Computer Science', 'Advanced Java. Generics, collections, design patterns.', 3, '{CSC 210}', 'Spring'),
  ('20000000-0000-0000-0000-000000000003', 'CSC 243',  'Data Structures',                   'lau', 'Computer Science', 'Arrays, linked lists, trees, graphs, sorting, searching.', 3, '{CSC 211}', 'Spring'),
  ('20000000-0000-0000-0000-000000000004', 'CSC 245',  'Algorithms',                        'lau', 'Computer Science', 'Divide and conquer, dynamic programming, greedy, NP.', 3, '{CSC 243}', 'Fall'),
  ('20000000-0000-0000-0000-000000000005', 'CSC 310',  'Database Systems',                  'lau', 'Computer Science', 'Relational databases, SQL, normalization, design.', 3, '{CSC 243}', 'Fall'),
  ('20000000-0000-0000-0000-000000000006', 'CSC 315',  'Operating Systems',                 'lau', 'Computer Science', 'Process management, memory, file systems, concurrency.', 3, '{CSC 243}', 'Spring'),
  ('20000000-0000-0000-0000-000000000007', 'CSC 320',  'Computer Networks',                 'lau', 'Computer Science', 'Network layers, protocols, socket programming.', 3, '{CSC 315}', 'Fall'),
  ('20000000-0000-0000-0000-000000000008', 'MTH 201',  'Calculus I',                        'lau', 'Mathematics',      'Limits, derivatives, integrals of single-variable functions.', 3, '{}', 'Fall / Spring'),
  ('20000000-0000-0000-0000-000000000009', 'MTH 202',  'Calculus II',                       'lau', 'Mathematics',      'Techniques of integration, sequences, series, polar coords.', 3, '{MTH 201}', 'Spring'),
  ('20000000-0000-0000-0000-000000000010', 'MTH 203',  'Calculus III',                      'lau', 'Mathematics',      'Multivariable calculus and vector analysis.', 3, '{MTH 202}', 'Fall'),
  ('20000000-0000-0000-0000-000000000011', 'MTH 211',  'Linear Algebra',                    'lau', 'Mathematics',      'Systems of equations, matrices, vector spaces.', 3, '{MTH 201}', 'Spring'),
  ('20000000-0000-0000-0000-000000000012', 'MTH 215',  'Probability & Statistics',          'lau', 'Mathematics',      'Random variables, distributions, inference.', 3, '{MTH 202}', 'Fall'),
  ('20000000-0000-0000-0000-000000000013', 'BIO 201',  'General Biology I',                 'lau', 'Biology',          'Cell biology, genetics, ecology.', 4, '{}', 'Fall'),
  ('20000000-0000-0000-0000-000000000014', 'ECO 201',  'Principles of Economics',           'lau', 'Economics',        'Micro and macroeconomic principles, market equilibrium.', 3, '{}', 'Fall'),
  ('20000000-0000-0000-0000-000000000015', 'BUS 201',  'Principles of Management',          'lau', 'Business',         'Planning, organizing, leading, controlling.', 3, '{}', 'Fall / Spring'),
  ('20000000-0000-0000-0000-000000000016', 'BUS 305',  'Marketing Management',              'lau', 'Business',         'Market segmentation, positioning, 4Ps, digital marketing.', 3, '{BUS 201}', 'Spring'),
  ('20000000-0000-0000-0000-000000000017', 'PHY 211',  'Physics I',                         'lau', 'Physics',          'Newtonian mechanics, energy, momentum.', 4, '{}', 'Fall'),
  ('20000000-0000-0000-0000-000000000018', 'PHY 212',  'Physics II',                        'lau', 'Physics',          'Electricity, magnetism, waves, optics.', 4, '{PHY 211}', 'Spring'),
  ('20000000-0000-0000-0000-000000000019', 'PSY 201',  'Introduction to Psychology',        'lau', 'Psychology',       'Cognition, behavior, development, disorders.', 3, '{}', 'Fall / Spring'),
  ('20000000-0000-0000-0000-000000000020', 'CHM 201',  'General Chemistry I',               'lau', 'Chemistry',        'Atomic structure, bonding, reactions.', 4, '{}', 'Fall'),

  -- ── NDU ──────────────────────────────────────────────────
  ('30000000-0000-0000-0000-000000000001', 'CSC 207',  'Computer Programming',              'ndu', 'Computer Science', 'Fundamentals of programming in C.', 3, '{}', 'Fall'),
  ('30000000-0000-0000-0000-000000000002', 'CSC 226',  'Object-Oriented Programming',       'ndu', 'Computer Science', 'OOP in Java: classes, inheritance, polymorphism.', 3, '{CSC 207}', 'Spring'),
  ('30000000-0000-0000-0000-000000000003', 'CSC 307',  'Data Structures',                   'ndu', 'Computer Science', 'Lists, stacks, queues, trees, graphs, hashing.', 3, '{CSC 226}', 'Fall'),
  ('30000000-0000-0000-0000-000000000004', 'CSC 308',  'Algorithms',                        'ndu', 'Computer Science', 'Algorithm design, analysis, and complexity theory.', 3, '{CSC 307}', 'Spring'),
  ('30000000-0000-0000-0000-000000000005', 'CSC 312',  'Database Management',               'ndu', 'Computer Science', 'SQL, ER modeling, normalization.', 3, '{CSC 307}', 'Fall'),
  ('30000000-0000-0000-0000-000000000006', 'CSC 410',  'Software Engineering',              'ndu', 'Computer Science', 'SDLC, agile, testing, deployment.', 3, '{CSC 308}', 'Spring'),
  ('30000000-0000-0000-0000-000000000007', 'MAT 211',  'Calculus I',                        'ndu', 'Mathematics',      'Limits, continuity, differentiation, integration.', 3, '{}', 'Fall / Spring'),
  ('30000000-0000-0000-0000-000000000008', 'MAT 212',  'Calculus II',                       'ndu', 'Mathematics',      'Integration techniques, series, improper integrals.', 3, '{MAT 211}', 'Spring'),
  ('30000000-0000-0000-0000-000000000009', 'MAT 213',  'Calculus III',                      'ndu', 'Mathematics',      'Multivariable calculus, vector fields, Stokes theorem.', 3, '{MAT 212}', 'Fall'),
  ('30000000-0000-0000-0000-000000000010', 'MAT 221',  'Linear Algebra',                    'ndu', 'Mathematics',      'Vector spaces, linear maps, eigenvalues.', 3, '{MAT 211}', 'Spring'),
  ('30000000-0000-0000-0000-000000000011', 'BIO 211',  'Biology I',                         'ndu', 'Biology',          'Cell structure, metabolism, genetics.', 4, '{}', 'Fall'),
  ('30000000-0000-0000-0000-000000000012', 'CHM 211',  'Chemistry I',                       'ndu', 'Chemistry',        'General chemistry: atoms, molecules, reactions.', 4, '{}', 'Fall'),
  ('30000000-0000-0000-0000-000000000013', 'CHM 212',  'Organic Chemistry',                 'ndu', 'Chemistry',        'Organic reactions, mechanisms, spectroscopy.', 4, '{CHM 211}', 'Spring'),
  ('30000000-0000-0000-0000-000000000014', 'ACC 210',  'Financial Accounting',              'ndu', 'Business',         'Accounting principles, financial statements.', 3, '{}', 'Fall / Spring'),
  ('30000000-0000-0000-0000-000000000015', 'ACC 220',  'Managerial Accounting',             'ndu', 'Business',         'Cost accounting, budgeting, variance analysis.', 3, '{ACC 210}', 'Spring'),
  ('30000000-0000-0000-0000-000000000016', 'ENG 211',  'English Composition',               'ndu', 'Languages',        'Academic writing, research, argumentation.', 3, '{}', 'Fall / Spring'),
  ('30000000-0000-0000-0000-000000000017', 'PHI 201',  'Introduction to Philosophy',        'ndu', 'Humanities',       'Ethics, epistemology, metaphysics.', 3, '{}', 'Fall / Spring'),
  ('30000000-0000-0000-0000-000000000018', 'PHY 201',  'Physics I',                         'ndu', 'Physics',          'Mechanics, oscillations, thermodynamics.', 4, '{MAT 211}', 'Fall'),
  ('30000000-0000-0000-0000-000000000019', 'ECO 211',  'Introduction to Economics',         'ndu', 'Economics',        'Micro and macro fundamentals, Lebanese economy context.', 3, '{}', 'Fall / Spring'),
  ('30000000-0000-0000-0000-000000000020', 'PSY 211',  'Introduction to Psychology',        'ndu', 'Psychology',       'Human behavior, cognitive processes, personality.', 3, '{}', 'Fall / Spring')
on conflict (id) do nothing;
