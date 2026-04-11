# TUTR — Operational Runbook

This document describes recurring manual operational tasks that must be performed
by the TUTR team. None of these are automated — they require a human.

---

## 1. Yearly Course Catalog Scrape

**Frequency:** Once per year, before fall semester (ideally late August).
**Why:** The `courses` table is seeded manually. University catalogs update annually.
**How:**
1. Visit each university's official course catalog:
   - **AUB:** https://www.aub.edu.lb/Registrar/Documents/catalogs/ (look for current year PDF)
   - **LAU:** https://www.lau.edu.lb/academics/catalog/
   - **NDU:** https://www.ndu.edu.lb/academics/courses
2. Extract new or changed courses (code, name, subject, credits).
3. Insert/update rows in `public.courses` via the Supabase SQL editor or a migration script.
4. Mark any removed courses as deprecated (do NOT delete — they may still be in session history).
5. Review `course_submissions` table for any pending user-submitted courses (`status = 'pending'`).
   Approve worthy ones by inserting them into `public.courses` and setting `status = 'approved'`.

**Note:** Claude Code does not implement the scraper. This is a manual task.

---

## 2. Semester Date Refresh

**Frequency:** Before each new semester (Fall/Spring/Summer).
**Why:** The `semesters` table drives auto-refresh of student courses.
**How:**
1. Check official calendars:
   - **AUB:** https://www.aub.edu.lb/Registrar/Documents/calendars/calendar2025-26.pdf
   - **LAU:** https://www.lau.edu.lb/calendar/
   - **NDU:** https://www.ndu.edu.lb/academics/academic-calendar
2. Update `start_date` and `end_date` for the upcoming semester in `public.semesters`.
3. Set `is_current = true` for the now-active semester; set `is_current = false` for all others.
4. Optionally update `last_synced_at` to today's date.

**SQL template:**
```sql
-- Mark all inactive
UPDATE public.semesters SET is_current = false;

-- Activate the new semester
UPDATE public.semesters
SET is_current = true,
    start_date = 'YYYY-MM-DD',
    end_date   = 'YYYY-MM-DD',
    last_synced_at = now()
WHERE university_id = 'aub'  -- repeat for 'lau', 'ndu'
  AND term = 'fall'
  AND name = 'Fall 2026-2027';
```

---

## 3. Tutor Subscription Management

**Frequency:** Monthly (when tutors pay) and on-demand (when new tutors onboard).
**Why:** Payment is processed offline (OMT/Whish). Admin manually marks subscriptions active.
**How:**
1. Navigate to `/admin/subscriptions` in the app (requires your user ID in `VITE_ADMIN_USER_IDS`).
2. Find the tutor by name.
3. Set their status to `active` and enter a `current_period_end` date (30 days from payment).
4. After 30 days without renewal: set to `grace_period` (7-day window). After 7 more days: `inactive`.

**Env var required:** `VITE_ADMIN_USER_IDS` — comma-separated list of Supabase user UUIDs granted admin access.

**Alternative via SQL:**
```sql
INSERT INTO public.tutor_subscriptions (tutor_id, status, current_period_end, updated_at)
VALUES ('UUID_HERE', 'active', now() + interval '30 days', now())
ON CONFLICT (tutor_id) DO UPDATE
  SET status = 'active',
      current_period_end = now() + interval '30 days',
      updated_at = now();
```

---

## 4. Ad Boost Management

**Frequency:** On-demand (when tutors pay for a boost).
**Why:** Boost payment is also processed offline.
**How:**
1. Navigate to `/admin/boosts` in the app.
2. Find the tutor and click "Activate boost", optionally setting an end date (default: 7 days).

---

## 5. Support Email & WhatsApp Setup

**Status:** TODO — placeholder values in `/support` page.
**Action required:**
1. Create a support email (e.g. `support@tutr.app`) and set up an inbox.
2. Create or designate a WhatsApp number for student/tutor support.
3. Update `src/pages/SupportPage.tsx` — replace both `[support email — coming soon]` and
   `[number — coming soon]` with the real values.

---

## 6. Course Submission Review

**Frequency:** Weekly (or as submissions come in).
**How:**
1. Query pending submissions:
   ```sql
   SELECT * FROM public.course_submissions WHERE status = 'pending' ORDER BY created_at;
   ```
2. For each valid submission, insert into `public.courses` and set `status = 'approved'`, `reviewed_at = now()`.
3. For invalid ones, set `status = 'rejected'`.

---

## 7. No-Show Dispute Resolution

If a user contacts support claiming a no-show report is incorrect:
1. Look up the session and no_shows row in Supabase.
2. If the report is in error, delete the `no_shows` row.
3. If a suspension was triggered unfairly, clear `suspended_until`:
   ```sql
   UPDATE public.profiles SET suspended_until = null WHERE id = 'UUID_HERE';
   ```

---

## 8. Monthly Checklist

- [ ] Process new tutor subscription payments, update `tutor_subscriptions`
- [ ] Check `tutor_subscriptions` for expired `current_period_end` — move to `grace_period` → `inactive`
- [ ] Review `course_submissions` — approve or reject
- [ ] Check `no_shows` for any disputes needing manual resolution
- [ ] Verify semester dates are correct for next semester
- [ ] Review any open `support_tickets`
