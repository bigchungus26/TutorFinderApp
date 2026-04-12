-- ============================================================
-- Tutr — Cleanup Bad AUB Courses
-- Some rows from the AUB full catalog scrape got corrupted when
-- the subagent concatenated whole program-plan blobs into a
-- single course's description or name field. This file finds
-- and deletes those rows.
--
-- Safe: only deletes rows where the description is clearly
-- polluted (length > 300 chars). Real course descriptions are
-- always under 250 chars in this seed.
-- ============================================================

-- Step 1: Diagnostic — show what we're about to delete
select code, name, length(description) as desc_len
from public.courses
where university_id = 'aub'
  and (length(description) > 300 or length(name) > 150)
order by desc_len desc;

-- Step 2: Delete corrupted rows.
-- Cascading deletes on tutor_courses/sessions/reviews/etc. are
-- safe — the demo data does not reference these specific codes.
delete from public.courses
where university_id = 'aub'
  and (length(description) > 300 or length(name) > 150);

-- Step 3: Verify the search result would now be clean
select count(*) as remaining_aub_courses
from public.courses
where university_id = 'aub';

select count(*) as aub_courses_with_bad_descriptions
from public.courses
where university_id = 'aub' and length(description) > 300;
