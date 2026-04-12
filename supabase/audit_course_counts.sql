-- ============================================================
-- Tutr — Course Count Audit
-- Shows course counts per university and per subject so we can
-- identify which subjects got over-deleted by the cleanup.
-- ============================================================

-- 1. Total courses per university (expected: AUB ~1280, LAU 534, NDU 1275)
select
  university_id,
  count(*) as course_count
from public.courses
group by university_id
order by university_id;

-- 2. AUB course breakdown by subject (sorted alphabetically)
select
  subject,
  count(*) as courses
from public.courses
where university_id = 'aub'
group by subject
order by subject;

-- 3. AUB subjects with suspiciously low counts (flag potential over-deletion)
-- Real subjects at AUB should have at least 5-10 courses. Anything with 1-4
-- is either a niche subject or was gutted by the cleanup.
select
  subject,
  count(*) as courses
from public.courses
where university_id = 'aub'
group by subject
having count(*) < 5
order by courses asc;

-- 4. LAU subjects (sanity check — should be untouched)
select
  subject,
  count(*) as courses
from public.courses
where university_id = 'lau'
group by subject
order by subject;

-- 5. NDU subjects (sanity check — should be untouched)
select
  subject,
  count(*) as courses
from public.courses
where university_id = 'ndu'
group by subject
order by subject;
