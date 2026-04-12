-- ============================================================
-- Tutr — Restore AUB Physics courses
-- The cleanup_bad_aub_courses.sql over-deleted legitimate PHYS
-- courses whose descriptions were just long, not actually
-- corrupted. This re-inserts the standard AUB Physics catalog.
--
-- Safe to re-run: ON CONFLICT (university_id, code) DO NOTHING
-- ============================================================

insert into public.courses (id, code, name, university_id, subject, description, credits, prerequisites, typical_semester) values

  -- Freshman / lower-division
  (gen_random_uuid(), 'PHYS 101', 'The Galileo-Newton Revolution', 'aub', 'Physics',
   'A freshman course on mechanics, motion, gravity, and the historical development of classical physics.',
   3, '{}', 'Fall / Spring'),

  (gen_random_uuid(), 'PHYS 102', 'Einstein Revolution', 'aub', 'Physics',
   'A freshman course on modern physics: relativity, quantum mechanics, and their revolutionary ideas.',
   3, '{}', 'Fall / Spring'),

  (gen_random_uuid(), 'PHYS 103', 'Topics in Modern Physics', 'aub', 'Physics',
   'Freshman course covering contemporary topics in modern physics accessible without calculus.',
   3, '{}', 'Fall / Spring'),

  (gen_random_uuid(), 'PHYS 201', 'General Physics I', 'aub', 'Physics',
   'Algebra-based mechanics: kinematics, Newton laws, energy, momentum, rotation, oscillations, and waves.',
   3, '{}', 'Fall / Spring'),

  (gen_random_uuid(), 'PHYS 202', 'General Physics II', 'aub', 'Physics',
   'Algebra-based electromagnetism, optics, and modern physics, continuation of PHYS 201.',
   3, '{}', 'Fall / Spring'),

  (gen_random_uuid(), 'PHYS 203', 'General Physics Laboratory I', 'aub', 'Physics',
   'Hands-on experiments accompanying PHYS 201 covering mechanics, oscillations, and waves.',
   1, '{}', 'Fall / Spring'),

  (gen_random_uuid(), 'PHYS 204', 'General Physics Laboratory II', 'aub', 'Physics',
   'Hands-on experiments accompanying PHYS 202 covering electricity, magnetism, and optics.',
   1, '{}', 'Fall / Spring'),

  (gen_random_uuid(), 'PHYS 210', 'General Physics I', 'aub', 'Physics',
   'Calculus-based mechanics and thermodynamics: kinematics, Newton laws, energy, momentum, fluids, heat.',
   3, '{}', 'Fall / Spring'),

  (gen_random_uuid(), 'PHYS 211', 'General Physics II', 'aub', 'Physics',
   'Calculus-based electricity, magnetism, optics, and wave phenomena, continuation of PHYS 210.',
   3, '{}', 'Fall / Spring'),

  (gen_random_uuid(), 'PHYS 212', 'General Physics Laboratory', 'aub', 'Physics',
   'Calculus-based lab experiments covering the content of PHYS 210 and PHYS 211.',
   1, '{}', 'Fall / Spring'),

  -- Upper-division physics major core
  (gen_random_uuid(), 'PHYS 220', 'Modern Physics', 'aub', 'Physics',
   'Special relativity, early quantum theory, atomic structure, nuclear physics, and elementary particles.',
   3, '{}', 'Fall / Spring'),

  (gen_random_uuid(), 'PHYS 221', 'Classical Mechanics', 'aub', 'Physics',
   'Newtonian mechanics in depth: central forces, rigid body motion, Lagrangian and Hamiltonian formulations.',
   3, '{}', 'Fall / Spring'),

  (gen_random_uuid(), 'PHYS 222', 'Electromagnetism I', 'aub', 'Physics',
   'Electrostatics, magnetostatics, and their applications using vector calculus.',
   3, '{}', 'Fall / Spring'),

  (gen_random_uuid(), 'PHYS 223', 'Electromagnetism II', 'aub', 'Physics',
   'Maxwell equations, electromagnetic waves, radiation, and electrodynamics.',
   3, '{}', 'Fall / Spring'),

  (gen_random_uuid(), 'PHYS 224', 'Thermal Physics', 'aub', 'Physics',
   'Kinetic theory, thermodynamics, and introduction to statistical mechanics.',
   3, '{}', 'Fall / Spring'),

  (gen_random_uuid(), 'PHYS 225', 'Quantum Mechanics I', 'aub', 'Physics',
   'Introduction to quantum mechanics: Schrodinger equation, one-dimensional systems, harmonic oscillator.',
   3, '{}', 'Fall / Spring'),

  (gen_random_uuid(), 'PHYS 226', 'Quantum Mechanics II', 'aub', 'Physics',
   'Three-dimensional systems, angular momentum, spin, identical particles, perturbation theory.',
   3, '{}', 'Fall / Spring'),

  (gen_random_uuid(), 'PHYS 227', 'Mathematical Methods in Physics', 'aub', 'Physics',
   'Mathematical tools for physics: linear algebra, complex analysis, PDEs, special functions, Fourier analysis.',
   3, '{}', 'Fall / Spring'),

  (gen_random_uuid(), 'PHYS 228', 'Optics', 'aub', 'Physics',
   'Geometrical and physical optics: lenses, interference, diffraction, polarization, lasers.',
   3, '{}', 'Fall / Spring'),

  (gen_random_uuid(), 'PHYS 230', 'Electronics for Physicists', 'aub', 'Physics',
   'Introduction to analog and digital electronics for physics experiments and instrumentation.',
   3, '{}', 'Fall / Spring'),

  (gen_random_uuid(), 'PHYS 231', 'Solid State Physics', 'aub', 'Physics',
   'Crystal structure, lattice vibrations, band theory, semiconductors, and properties of solids.',
   3, '{}', 'Fall / Spring'),

  (gen_random_uuid(), 'PHYS 232', 'Nuclear and Particle Physics', 'aub', 'Physics',
   'Nuclear structure, radioactivity, nuclear reactions, elementary particles, and the Standard Model.',
   3, '{}', 'Fall / Spring'),

  (gen_random_uuid(), 'PHYS 235', 'Statistical Mechanics', 'aub', 'Physics',
   'Foundations of statistical mechanics, ensembles, partition functions, and applications to physical systems.',
   3, '{}', 'Fall / Spring'),

  (gen_random_uuid(), 'PHYS 240', 'Advanced Laboratory', 'aub', 'Physics',
   'Advanced experimental physics laboratory covering modern physics, optics, and condensed matter experiments.',
   3, '{}', 'Fall / Spring'),

  (gen_random_uuid(), 'PHYS 250', 'Astrophysics', 'aub', 'Physics',
   'Introduction to stellar structure, galaxies, cosmology, and the physics of the universe.',
   3, '{}', 'Fall / Spring'),

  (gen_random_uuid(), 'PHYS 260', 'Computational Physics', 'aub', 'Physics',
   'Numerical methods and computer simulations applied to physics problems.',
   3, '{}', 'Fall / Spring'),

  (gen_random_uuid(), 'PHYS 280', 'Special Topics in Physics', 'aub', 'Physics',
   'Variable-content seminar on advanced or current topics in physics.',
   3, '{}', 'Fall / Spring'),

  (gen_random_uuid(), 'PHYS 299', 'Senior Project', 'aub', 'Physics',
   'Independent research project supervised by a faculty member, culminating in a thesis and defense.',
   3, '{}', 'Fall / Spring')

on conflict (university_id, code) do nothing;
