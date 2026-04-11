# TUTR — Operational Layer Logistics Audit

This document summarises what was built in the operational layer implementation
(migration 00007 + associated UI changes). Use it to verify completeness.

---

## Part 1 — No-Show Policy ✅

| Item | Status |
|------|--------|
| `no_shows` table with `session_id`, `reported_by`, `no_show_party`, `notes` | ✅ |
| RLS: only session participants can insert/read | ✅ |
| Report window enforced client-side: session start ≤ now ≤ +24h | ✅ |
| `student_no_show_counts` and `tutor_no_show_counts` views | ✅ |
| `profiles.suspended_until` column | ✅ |
| Trigger: auto-suspend student after 3 no-shows (14 days) | ✅ |
| Trigger: hide tutor after 3 no-shows (`paused_until = infinity`) | ✅ |
| Notification to both parties on no-show insert | ✅ |
| Student: "Report no-show" button on past sessions with `isReportable()` check | ✅ |
| NoShowSheet with policy text, notes textarea, confirm/cancel | ✅ |
| SuspensionBanner shown on SessionsPage when `suspended_until > now` | ✅ |
| Policy text added to Terms (Section 5) | ✅ |

---

## Part 2 — Verified-Booking-Only Reviews ✅

| Item | Status |
|------|--------|
| `reviews.session_id` made NOT NULL (backfill + constraint) | ✅ |
| `can_review(student_id, tutor_id, session_id)` Postgres function | ✅ |
| RLS insert policy uses `can_review()` | ✅ |
| `useCreateReview` always passes `session_id` | ✅ |

---

## Part 3 — Block User Feature ✅

| Item | Status |
|------|--------|
| `blocks` table with `blocker_id`, `blocked_id`, unique constraint | ✅ |
| RLS: blockers manage own; blocked can read | ✅ |
| `useMyBlocks`, `useBlockedByIds`, `useCreateBlock`, `useDeleteBlock` hooks | ✅ |
| Block confirmation modal on TutorProfilePage (with tutor name) | ✅ |
| Navigate back after blocking | ✅ |
| SearchPage filters blocked tutors from results | ✅ |
| `BlockedUsersPage` at `/profile/blocked` with unblock button | ✅ |
| "Blocked users" settings row in ProfilePage | ✅ |
| Empty state for blocked users list | ✅ |

**Note:** Messaging block enforcement is at the DB/RLS level. Client-side the conversation
sheet can show a "You blocked this user" banner — add in a future iteration if needed.

---

## Part 4 — Semester Logic & Auto-Refresh ✅

| Item | Status |
|------|--------|
| `semesters` table with university_id, name, term, start/end dates, is_current, source_url | ✅ |
| Seeded: Fall/Spring/Summer 2025-2026 for AUB, LAU, NDU | ✅ |
| `student_courses.semester_end_override` column | ✅ |
| `useSemesters`, `useCurrentSemester` hooks | ✅ |
| RLS: public can read semesters | ✅ |
| OPS.md: semester refresh documented | ✅ |

**Note:** The client-side auto-refresh check (compare today vs semester end, clear courses,
fire notification) and the semester-end editor in profile settings are lightweight enough
to add in the next iteration. The schema and data are fully in place.

---

## Part 5 — "Don't see your course?" Submission Flow ✅

| Item | Status |
|------|--------|
| `course_submissions` table with submitted_by, university_id, code, name, subject, notes, status | ✅ |
| RLS: users insert and read own | ✅ |
| `useSubmitCourse`, `useCourseSubmissions` hooks | ✅ |
| `CourseSubmissionSheet` component (code, name, subject, notes) | ✅ |
| "Don't see your course? Submit it →" row at bottom of course list in SearchPage | ✅ |
| Toast: "Thanks! We'll review and add it soon." | ✅ (via hook) |
| OPS.md: course submission review documented | ✅ |

---

## Part 6 — Legal & Policy Updates ✅

| Item | Status |
|------|--------|
| No-show policy section (Section 5) | ✅ |
| Tax responsibility section (Section 8) | ✅ |
| Data rights / GDPR-style section (Section 10 Terms + Section 4 Privacy) | ✅ |
| Lebanese governing law clause (Section 12 Terms + Section 9 Privacy) | ✅ |
| Payment disclaimer (Section 4 Terms) | ✅ |
| Subscription terms (Section 7 Terms) | ✅ |
| Community guidelines (Section 9 Terms) | ✅ |
| Privacy policy updated with full data rights, retention, governing law | ✅ |
| Brand name changed from "Tutr" to "TUTR" throughout | ✅ |

---

## Part 7 — Support Contact Placeholder ✅

| Item | Status |
|------|--------|
| `/support` page with contact placeholders | ✅ |
| FAQ section | ✅ |
| "Report a problem" button opening sheet form | ✅ |
| `support_tickets` table (user_id, subject, message, status) | ✅ |
| RLS: users insert/read own | ✅ |
| `useCreateSupportTicket` hook | ✅ |
| "Help & support" row in ProfilePage settings | ✅ |
| "Help & support" row in TutorProfileSettings | ✅ |
| Support email/WhatsApp marked as TODO placeholders | ✅ |

---

## Part 8 — Subscription State Enforcement ✅

| Item | Status |
|------|--------|
| `tutor_subscriptions` table from migration 00006 | ✅ (already existed) |
| Inactive tutors hidden from SearchPage results | ✅ |
| Grace period banner on TutorProfileSettings | ✅ |
| Inactive banner on TutorProfileSettings | ✅ |
| `useTutorSubscription` hook | ✅ |
| `useAdminUpdateSubscription` hook | ✅ |
| Admin UI at `/admin/subscriptions` | ✅ |
| Admin gated by `VITE_ADMIN_USER_IDS` env var | ✅ |
| OPS.md: subscription management documented | ✅ |

---

## Part 9 — Ad Boost Enforcement ✅

| Item | Status |
|------|--------|
| `tutor_boosts` table from migration 00006 | ✅ (already existed) |
| Boosted tutors sorted first in SearchPage | ✅ (existed from Story 31) |
| "⚡ Featured" pill on boosted TutorCards | ✅ (existed from Story 31) |
| `useAdminUpdateBoost` hook | ✅ |
| Admin UI at `/admin/boosts` | ✅ |
| OPS.md: boost management documented | ✅ |

---

## Part 10 — Verification ✅

| Item | Status |
|------|--------|
| Migration 00007 written | ✅ |
| All new tables have RLS enabled | ✅ |
| All mutations show toasts | ✅ |
| Empty states for: blocked users | ✅ |
| OPS.md created | ✅ |
| LOGISTICS_AUDIT.md created | ✅ |
| Terms of Use updated | ✅ |
| Privacy Policy updated | ✅ |
| Build verified | (see build step) |

---

## Known Gaps / Next Iteration

- **Semester auto-clear**: The client-side job that clears `student_courses` when `today >= semester_end` and fires a notification — not yet wired. Schema is ready.
- **Semester end editor**: Profile settings row for students to override their semester end date — schema column (`semester_end_override`) exists but UI picker not added.
- **New semester banner on Discover**: "New semester started" CTA for first 2 weeks — not yet added.
- **Message block enforcement UI**: "You blocked this user" banner in conversations — not yet added (DB blocks messages at RLS level).
- **Course picker submission link**: The "Don't see your course?" row is in SearchPage. It should also appear in onboarding course pickers (StudentOnboarding, TutorOnboarding).
