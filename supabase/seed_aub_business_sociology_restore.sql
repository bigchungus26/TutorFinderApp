-- ============================================================
-- Tutr — Restore AUB Business + Sociology courses
-- The cleanup_bad_aub_courses.sql deleted some legitimate
-- courses whose descriptions exceeded 300 chars. This restores
-- the standard AUB Business Core (BUSS) and Sociology/Anthropology
-- (SOAN) catalogs with clean short descriptions.
--
-- Safe to re-run: ON CONFLICT (university_id, code) DO NOTHING
-- ============================================================

insert into public.courses (id, code, name, university_id, subject, description, credits, prerequisites, typical_semester) values

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
  -- SOCIOLOGY / ANTHROPOLOGY (SOAN) — 15 courses
  -- ============================================================
  (gen_random_uuid(), 'SOAN 101', 'Introduction to Sociology', 'aub', 'Sociology',
   'Introduces the sociological perspective on social structures, institutions, and everyday life.',
   3, '{}', 'Fall / Spring'),

  (gen_random_uuid(), 'SOAN 102', 'Introduction to Anthropology', 'aub', 'Sociology',
   'Introduces cultural anthropology: kinship, religion, economy, politics, and cross-cultural comparison.',
   3, '{}', 'Fall / Spring'),

  (gen_random_uuid(), 'SOAN 201', 'Classical Sociological Theory', 'aub', 'Sociology',
   'Covers founding sociological theorists including Marx, Durkheim, and Weber.',
   3, '{}', 'Fall / Spring'),

  (gen_random_uuid(), 'SOAN 202', 'Contemporary Sociological Theory', 'aub', 'Sociology',
   'Twentieth-century and contemporary sociological theory including functionalism, conflict theory, and postmodernism.',
   3, '{}', 'Fall / Spring'),

  (gen_random_uuid(), 'SOAN 210', 'Research Methods in Sociology', 'aub', 'Sociology',
   'Qualitative and quantitative research methods for the social sciences.',
   3, '{}', 'Fall / Spring'),

  (gen_random_uuid(), 'SOAN 215', 'Social Inequality', 'aub', 'Sociology',
   'Examines class, race, gender, and other axes of social stratification and inequality.',
   3, '{}', 'Fall / Spring'),

  (gen_random_uuid(), 'SOAN 220', 'Sociology of the Middle East', 'aub', 'Sociology',
   'Social structures, institutions, and change in contemporary Middle Eastern societies.',
   3, '{}', 'Fall / Spring'),

  (gen_random_uuid(), 'SOAN 225', 'Gender and Society', 'aub', 'Sociology',
   'Sociological and anthropological perspectives on gender, sexuality, and gendered institutions.',
   3, '{}', 'Fall / Spring'),

  (gen_random_uuid(), 'SOAN 230', 'Urban Sociology', 'aub', 'Sociology',
   'Cities, urbanization, and urban life from sociological and anthropological perspectives.',
   3, '{}', 'Fall / Spring'),

  (gen_random_uuid(), 'SOAN 235', 'Sociology of Religion', 'aub', 'Sociology',
   'Religion as a social institution, religious movements, and the sociology of belief.',
   3, '{}', 'Fall / Spring'),

  (gen_random_uuid(), 'SOAN 240', 'Media and Society', 'aub', 'Sociology',
   'The role of media in shaping social, cultural, and political life.',
   3, '{}', 'Fall / Spring'),

  (gen_random_uuid(), 'SOAN 245', 'Social Movements', 'aub', 'Sociology',
   'Collective action, protest, revolution, and the sociology of social change.',
   3, '{}', 'Fall / Spring'),

  (gen_random_uuid(), 'SOAN 250', 'Ethnographic Methods', 'aub', 'Sociology',
   'Field research techniques including participant observation, interviewing, and ethnographic writing.',
   3, '{}', 'Fall / Spring'),

  (gen_random_uuid(), 'SOAN 260', 'Economic Anthropology', 'aub', 'Sociology',
   'Anthropological approaches to economic life, exchange, markets, and globalization.',
   3, '{}', 'Fall / Spring'),

  (gen_random_uuid(), 'SOAN 280', 'Special Topics in Sociology and Anthropology', 'aub', 'Sociology',
   'Variable-content seminar on current topics in sociology or cultural anthropology.',
   3, '{}', 'Fall / Spring')

on conflict (university_id, code) do nothing;
