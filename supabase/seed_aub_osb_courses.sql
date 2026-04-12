-- ============================================================
-- Tutr — AUB Olayan School of Business (OSB) Course Seed
-- 31 courses from the AUB 2025-26 undergraduate catalogue.
-- Source: https://www.aub.edu.lb/Registrar/catalogue2025-26/ug/Documents/ug-osb.pdf
--
-- Covers Accounting (ACCT), Business Core (BUSS), Decision Systems
-- (DCSN), Finance (FINA), Information Systems (INFO),
-- Management (MNGT), and Marketing (MKTG).
--
-- Cross-listed courses (ACCT 232/INFO 232, DCSN 225/INFO 225) are
-- stored under the primary code.
--
-- Safe to re-run: ON CONFLICT (university_id, code) DO NOTHING
-- ============================================================

insert into public.courses (id, code, name, university_id, subject, description, credits, prerequisites, typical_semester) values

  -- ============================================================
  -- ACCOUNTING (ACCT) — 9 courses
  -- ============================================================
  (gen_random_uuid(), 'ACCT 210', 'Financial Accounting', 'aub', 'Accounting',
   'Core BBA introduction to financial accounting principles, measurement, and reporting.',
   3, '{}', 'Fall / Spring'),

  (gen_random_uuid(), 'ACCT 215', 'Management Accounting', 'aub', 'Accounting',
   'Core BBA course on managerial accounting topics including cost behavior, budgeting, and decision-making.',
   3, '{}', 'Fall / Spring'),

  (gen_random_uuid(), 'ACCT 230', 'Introduction to External Auditing', 'aub', 'Accounting',
   'Introduces auditing and professional responsibilities, including standards, evidence, reporting, internal control evaluation, and sampling/EDP auditing.',
   3, '{}', 'Fall / Spring'),

  (gen_random_uuid(), 'ACCT 231', 'Fraud Examination and Internal Audit', 'aub', 'Accounting',
   'Covers fraud detection and prevention plus internal audit functions, governance, engagement planning, and investigation techniques.',
   3, '{"ACCT 215"}', 'Fall / Spring'),

  (gen_random_uuid(), 'ACCT 232', 'Accounting Information Systems', 'aub', 'Accounting',
   'Surveys core AIS application cycles (sales/receivables, inventory, purchasing/payables, payroll, production) emphasizing documentation, design, use, and auditing of AIS subsystems. Cross-listed with INFO 232.',
   3, '{"ACCT 211","INFO 200"}', 'Fall / Spring'),

  (gen_random_uuid(), 'ACCT 235', 'Taxation', 'aub', 'Accounting',
   'Introduces Lebanese tax rules and applications (individuals and entities) with tax-planning orientation and selected international/US tax elements.',
   3, '{"ACCT 211"}', 'Fall / Spring'),

  (gen_random_uuid(), 'ACCT 240', 'Fund Accounting', 'aub', 'Accounting',
   'Introduces fund accounting for nonprofit and governmental entities, focusing on reporting and control of activities.',
   3, '{"ACCT 215"}', 'Fall / Spring'),

  (gen_random_uuid(), 'ACCT 241', 'Profit Planning and Budgeting Control', 'aub', 'Accounting',
   'Budgeting and control topics such as sales planning, production/materials planning, labor/overhead control, expense planning, and capital-expenditure planning.',
   3, '{"ACCT 215"}', 'Fall / Spring'),

  (gen_random_uuid(), 'ACCT 246', 'International Accounting', 'aub', 'Accounting',
   'Compares accounting and auditing issues across international and US perspectives and standards.',
   3, '{"ACCT 215"}', 'Fall / Spring'),

  -- ============================================================
  -- BUSINESS CORE (BUSS) — 6 courses
  -- ============================================================
  (gen_random_uuid(), 'BUSS 200', 'Business Data Analysis', 'aub', 'Business',
   'Core BBA course introducing data analysis techniques and their application to business decision-making.',
   3, '{}', 'Fall / Spring'),

  (gen_random_uuid(), 'BUSS 211', 'Business Law', 'aub', 'Business',
   'Core BBA course covering legal foundations of business operations in Lebanon and beyond.',
   2, '{}', 'Fall / Spring'),

  (gen_random_uuid(), 'BUSS 215', 'Business Ethics', 'aub', 'Business',
   'Core BBA course on ethical frameworks, corporate social responsibility, and ethical decision-making.',
   3, '{}', 'Fall / Spring'),

  (gen_random_uuid(), 'BUSS 239', 'Business Communication Skills Workshop', 'aub', 'Business',
   'Zero-credit workshop developing written and oral communication skills for business contexts.',
   0, '{}', 'Fall / Spring'),

  (gen_random_uuid(), 'BUSS 245', 'Internship/Practicum', 'aub', 'Business',
   'Supervised internship or practicum placement providing real-world business experience.',
   1, '{}', 'Summer'),

  (gen_random_uuid(), 'BUSS 249', 'Strategic Management', 'aub', 'Business',
   'Capstone BBA course integrating business functions through strategic analysis and decision-making.',
   3, '{}', 'Fall / Spring'),

  -- ============================================================
  -- DECISION SYSTEMS / OPERATIONS MANAGEMENT (DCSN) — 5 courses
  -- ============================================================
  (gen_random_uuid(), 'DCSN 200', 'Operations Management', 'aub', 'Business',
   'Core BBA course covering operations management fundamentals including process design, capacity, quality, and supply chain basics.',
   3, '{}', 'Fall / Spring'),

  (gen_random_uuid(), 'DCSN 225', 'Enterprise Systems Design and Implementation', 'aub', 'Business',
   'Covers cross-functional business processes and enterprise systems, emphasizing ERP-supported process integration, implementation, and analytics use of enterprise data. Cross-listed with INFO 225.',
   3, '{"INFO 200","DCSN 200"}', 'Fall or Spring'),

  (gen_random_uuid(), 'DCSN 227', 'Operations Management II', 'aub', 'Business',
   'Builds on operations management with emphasis on process improvement and resource planning (lean operations, MRP/ERP, scheduling) for competitive advantage.',
   3, '{"DCSN 200"}', 'Fall / Spring'),

  (gen_random_uuid(), 'DCSN 250', 'Special Topics in Business Decision Systems', 'aub', 'Business',
   'Variable-content course addressing decision-systems topics not covered in standard offerings; repeatable when topics differ.',
   3, '{}', 'Fall / Spring'),

  (gen_random_uuid(), 'DCSN 253', 'Technical Skills Workshop in Operations Management', 'aub', 'Business',
   'Short zero-credit workshop building practical skills using tools, technologies, and methodologies relevant to operations management.',
   0, '{}', 'Fall / Spring'),

  -- ============================================================
  -- FINANCE (FINA) — 1 course
  -- ============================================================
  (gen_random_uuid(), 'FINA 210', 'Business Finance', 'aub', 'Finance',
   'Core BBA course introducing financial management, capital budgeting, cost of capital, and financial statement analysis.',
   3, '{}', 'Fall / Spring'),

  -- ============================================================
  -- INFORMATION SYSTEMS (INFO) — 1 course
  -- ============================================================
  (gen_random_uuid(), 'INFO 200', 'Foundations of Information Systems', 'aub', 'Information Systems',
   'Core BBA course on the role of information systems in business, covering hardware, software, databases, networks, and IS strategy.',
   3, '{}', 'Fall / Spring'),

  -- ============================================================
  -- MANAGEMENT (MNGT) — 1 course
  -- ============================================================
  (gen_random_uuid(), 'MNGT 215', 'Fundamentals of Management and Organizational Behavior', 'aub', 'Management',
   'Core BBA course covering management functions, leadership, motivation, team dynamics, and organizational behavior theories.',
   3, '{}', 'Fall / Spring'),

  -- ============================================================
  -- MARKETING (MKTG) — 7 courses
  -- ============================================================
  (gen_random_uuid(), 'MKTG 210', 'Principles of Marketing', 'aub', 'Marketing',
   'Core BBA course introducing marketing concepts, consumer behavior, segmentation, and the marketing mix.',
   3, '{}', 'Fall / Spring'),

  (gen_random_uuid(), 'MKTG 231', 'Customer Experience Design', 'aub', 'Marketing',
   'Designing and managing holistic customer experiences that build durable customer-brand relationships beyond traditional marketing approaches.',
   3, '{"MKTG 210","ENGL 204"}', 'Fall / Spring'),

  (gen_random_uuid(), 'MKTG 235', 'Retailing and Merchandising', 'aub', 'Marketing',
   'Examines retail formats and key issues such as location, layout, merchandising, category management, and store-activity coordination for retail decision-making.',
   3, '{"MKTG 210","ENGL 204"}', 'Fall / Spring'),

  (gen_random_uuid(), 'MKTG 238', 'Public Relations', 'aub', 'Marketing',
   'Introduces strategic PR practice across traditional and digital channels, including crisis communication and ethical considerations for reputation management.',
   3, '{"MKTG 210","ENGL 204"}', 'Fall / Spring'),

  (gen_random_uuid(), 'MKTG 240', 'Consumer Behavior', 'aub', 'Marketing',
   'Analyzes drivers of consumer decision-making and how customer insight informs customer-focused marketing strategies.',
   3, '{"MKTG 210","ENGL 204"}', 'Fall / Spring'),

  (gen_random_uuid(), 'MKTG 241', 'Luxury and Fashion Brand Marketing', 'aub', 'Marketing',
   'Luxury and fashion brand strategy, consumer profiling, identity and desirability creation, and emerging themes like inclusivity and sustainability.',
   3, '{"MKTG 210","ENGL 204"}', 'Fall / Spring'),

  (gen_random_uuid(), 'MKTG 242', 'Digital Content Creation for Business', 'aub', 'Marketing',
   'Hands-on course on planning and producing multimedia brand content (briefs, calendars, video, photo, visual, and copy assets) aligned to online brand strategy.',
   3, '{"MKTG 210","ENGL 204"}', 'Fall / Spring')

on conflict (university_id, code) do nothing;
