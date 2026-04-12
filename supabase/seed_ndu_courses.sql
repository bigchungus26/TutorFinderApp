-- ============================================================
-- Tutr — NDU Course Seed (28 courses, 2024-2025 catalog)
-- Source: https://www.ndu.edu.lb/Library/Assets/Files/Documents/
--         OfficeoftheRegistrar/Catalog%202024-2025.pdf
--
-- Architecture (ARP), Civil Engineering (CEN), Music (MUS/MUM)
--
-- Safe to re-run: ON CONFLICT (university_id, code) DO NOTHING
-- ============================================================

insert into public.courses (id, code, name, university_id, subject, description, credits, prerequisites, typical_semester) values

  -- ============================================================
  -- ARCHITECTURE (ARP) — 13 courses
  -- ============================================================
  (gen_random_uuid(), 'ARP 215', 'Cultural Themes in Lebanese Architecture', 'ndu', 'Architecture',
   'Introduces Lebanese art and architecture through key cultural determinants and a historical overview of morphological development.',
   3, '{}', 'Fall / Spring'),

  (gen_random_uuid(), 'ARP 221', 'Architectural Sketching and Rendering', 'ndu', 'Architecture',
   'Develops visual perception and spatial concepts through sketching and multiple freehand media.',
   3, '{"FAP 211","ARP 226"}', 'Fall / Spring'),

  (gen_random_uuid(), 'ARP 222', 'Principles of Architectural Design', 'ndu', 'Architecture',
   'Introduces core design principles (proportion, color, perception) with experiential learning using life-size models.',
   3, '{}', 'Fall / Spring'),

  (gen_random_uuid(), 'ARP 223', 'Descriptive Geometry', 'ndu', 'Architecture',
   'Covers geometric projections in space, including intersections of solids and volumetric development.',
   3, '{}', 'Fall / Spring'),

  (gen_random_uuid(), 'ARP 224', 'Applied Architectural Design I', 'ndu', 'Architecture',
   'Applies CAD concepts and software workflows to develop and communicate architectural projects.',
   3, '{}', 'Fall / Spring'),

  (gen_random_uuid(), 'ARP 225', 'Statics for Architecture', 'ndu', 'Architecture',
   'Introduces forces, moments, and equilibrium analysis using free-body diagrams and structural problem sets (beams, trusses, frames).',
   3, '{"MAT 103","PHS 101","ENL 110"}', 'Fall / Spring'),

  (gen_random_uuid(), 'ARP 226', 'Technical Drawing I', 'ndu', 'Architecture',
   'Builds graphic communication skills in 2D and 3D drafting techniques for representing architectural objects and projects.',
   3, '{}', 'Fall / Spring'),

  (gen_random_uuid(), 'ARP 232', 'Methodology of Architectural Design', 'ndu', 'Architecture',
   'Introduces architectural design methodologies through precedent analysis and small-scale project development.',
   3, '{"ENL 105","ARP 222","ARP 223","ARP 226"}', 'Fall / Spring'),

  (gen_random_uuid(), 'ARP 233', '3D Architectural Survey', 'ndu', 'Architecture',
   'Develops skills in constructing architectural models across scales and materials, including planning, detailing, budgeting, and techniques.',
   2, '{"ARP 223","ARP 226"}', 'Fall / Spring'),

  (gen_random_uuid(), 'ARP 301', 'Technical Drawing II', 'ndu', 'Architecture',
   'Focuses on architectural perspective drawing, including multi vanishing-point techniques and shadow construction.',
   3, '{"ARP 223","ARP 226"}', 'Fall / Spring'),

  (gen_random_uuid(), 'ARP 311', 'Architectural Design I', 'ndu', 'Architecture',
   'Covers foundational architectural design issues via contextual and precedent analysis combined with design practice. High-credit design studio.',
   6, '{"MAT 103","PHS 101","ARP 221","ARP 232","ARP 301"}', 'Fall / Spring'),

  (gen_random_uuid(), 'ARP 313', 'History of Architecture I', 'ndu', 'Architecture',
   'Surveys architecture from prehistoric periods through the Roman Empire, emphasizing origins and development.',
   3, '{"ENL 105"}', 'Fall / Spring'),

  (gen_random_uuid(), 'ARP 316', 'Strength of Materials', 'ndu', 'Architecture',
   'Studies material properties and mechanics topics (stress, axial loads, bending, shear, buckling) with real-life examples.',
   3, '{"ARP 225"}', 'Fall / Spring'),

  -- ============================================================
  -- CIVIL ENGINEERING (CEN) — 13 courses
  -- ============================================================
  (gen_random_uuid(), 'CEN 201', 'Engineering Mechanics', 'ndu', 'Civil Engineering',
   'Covers forces and structural analysis fundamentals (free-body diagrams, beams, trusses, stress-strain, torsion, buckling) used in engineering mechanics.',
   3, '{}', 'Fall / Spring'),

  (gen_random_uuid(), 'CEN 202', 'Statics', 'ndu', 'Civil Engineering',
   'Introduces equilibrium analysis (forces, moments, couples) and applications to beams and trusses and engineering problem solving.',
   3, '{}', 'Fall / Spring'),

  (gen_random_uuid(), 'CEN 203', 'Mechanics of Materials', 'ndu', 'Civil Engineering',
   'Covers mechanics of materials topics including torsion, stress-strain relations, beam stresses and deflections, and column buckling.',
   3, '{"CEN 202"}', 'Fall / Spring'),

  (gen_random_uuid(), 'CEN 204', 'Mechanics of Materials Laboratory', 'ndu', 'Civil Engineering',
   'Laboratory experiments for material characterization, including static and fatigue testing (tension, compression, bending, buckling).',
   1, '{"CEN 203"}', 'Fall / Spring'),

  (gen_random_uuid(), 'CEN 210', 'Structures I', 'ndu', 'Civil Engineering',
   'Introduces structural forms and analysis of determinate structures, including moving loads and influence lines and an introduction to indeterminate structures and collapse concepts.',
   3, '{"CEN 203"}', 'Fall / Spring'),

  (gen_random_uuid(), 'CEN 220', 'Soil Mechanics', 'ndu', 'Civil Engineering',
   'Covers soil properties and stress-strain behavior, seepage and flow nets, and bearing capacity concepts for footings on sand and clay.',
   3, '{"CEN 203"}', 'Fall / Spring'),

  (gen_random_uuid(), 'CEN 221', 'Soil Mechanics Laboratory', 'ndu', 'Civil Engineering',
   'Lab tests on soils covering physical properties, compressibility, stress-strain relationships, and shear strength.',
   1, '{"CEN 220"}', 'Fall / Spring'),

  (gen_random_uuid(), 'CEN 250', 'Surveying', 'ndu', 'Civil Engineering',
   'Introduces surveying and instrumentation and foundational principles relevant to photogrammetry, remote sensing and GPS.',
   2, '{}', 'Fall / Spring'),

  (gen_random_uuid(), 'CEN 251', 'Field Surveying', 'ndu', 'Civil Engineering',
   'Field plane surveying and mapping, including location and route surveying applications. Corequisite: CEN 250.',
   1, '{}', 'Fall / Spring'),

  (gen_random_uuid(), 'CEN 271', 'Civil Engineering CAD', 'ndu', 'Civil Engineering',
   'Introductory CAD lab covering engineering and architecture CAD tools for 2D and 3D representations (AutoCAD and related tools).',
   1, '{}', 'Fall / Spring'),

  (gen_random_uuid(), 'CEN 304', 'Construction Materials', 'ndu', 'Civil Engineering',
   'Surveys construction material types and properties and introduces testing procedures used to evaluate materials.',
   3, '{"CEN 203"}', 'Fall / Spring'),

  (gen_random_uuid(), 'CEN 311', 'Structures II', 'ndu', 'Civil Engineering',
   'Analyzes indeterminate structures using methods such as consistent deformations and moment distribution, including energy theorems for trusses, beams, and frames.',
   3, '{"CEN 210"}', 'Fall / Spring'),

  (gen_random_uuid(), 'CEN 320', 'Foundation Engineering', 'ndu', 'Civil Engineering',
   'Covers site investigation and sampling plus design of shallow and deep foundations, settlement analysis, and retaining-wall stability.',
   3, '{"CEN 220"}', 'Fall / Spring'),

  -- ============================================================
  -- MUSIC (MUS / MUM) — 2 courses
  -- ============================================================
  (gen_random_uuid(), 'MUS 244', 'Ethnomusicology', 'ndu', 'Music',
   'Introduces comparative study of music across cultures and historical periods.',
   3, '{}', 'Fall / Spring'),

  (gen_random_uuid(), 'MUM 475', 'Acoustics of Music', 'ndu', 'Music',
   'Introduces wave physics concepts needed to understand musical acoustics, instruments, and room and hall sound effects.',
   3, '{}', 'Fall / Spring')

on conflict (university_id, code) do nothing;
