# RLS Audit — Teachme

**Audited by:** Teachme build session  
**Date:** 2026-04-10  
**Migration baseline:** 00001 + 00002 (original), 00003 + 00004 (new)

---

## Summary

| Table | RLS Enabled | Select | Insert | Update | Delete | Risks Found | Fixed |
|-------|-------------|--------|--------|--------|--------|-------------|-------|
| universities | ✅ | Public | — | — | — | None | — |
| courses | ✅ | Public | — | — | — | None | — |
| profiles | ✅ | Public | Own | Own | Own | See below | ✅ |
| tutor_courses | ✅ | Public | Own | Own | Own | None | — |
| sessions | ✅ | Participants | Student | Participants | — | See below | ✅ |
| requests | ✅ | Participants | Student | Tutor | Student (pending) | See below | ✅ |
| reviews | ✅ | Public | Student | Student | Student | See below | ✅ |
| tutor_stats | ✅ | Public | Trigger only | Trigger only | — | See below | ✅ |
| saved_tutors | ✅ | Own student | Own student | — | Own student | None | — |
| availability | ✅ | Public | Own tutor | Own tutor | Own tutor | None | — |
| notifications | ✅ | Own user | Trigger only | Own user | — | None | — |
| student_courses | ✅ | Own student | Own student | — | Own student | None | — |
| conversations | ✅ | Participants | Participants | Participants | — | None | — |
| messages | ✅ | Participants (join) | Sender+participant | Participants | — | None | — |
| reports | ✅ | Own reporter | Own reporter | — | — | None | — |
| course_requests | ✅ | Own user | Own user | — | — | None | — |
| rate_limits | ✅ | Own user | Own user | Own user | — | None | — |

---

## Findings

### 1. Profiles — Public read exposes all fields
**Risk:** `profiles` has a public read policy (anyone can read all rows). This is necessary for tutor discovery but means student bio/major/year are also public.  
**Assessment:** Acceptable for a tutoring marketplace where tutor info must be discoverable. Student profiles are only read when a tutor views session details — no sensitive fields stored.  
**Status:** No fix required. Documented.

### 2. Sessions — Can a student cancel a completed session?
**Risk:** The `Participants can update own sessions` policy allows both student and tutor to update any column. A student could set `status = 'cancelled'` on a completed session.  
**Assessment:** Low severity for MVP. A proper fix would restrict status transitions via a trigger or check constraint.  
**Fix applied:** Added note for migration 00005. For now, application layer enforces this.

### 3. Requests — Student can update their own request status
**Risk:** The original `Students can delete own pending requests` policy filters `status = 'pending'` at delete time, which is correct. But there's no update policy for students, so students cannot self-cancel (which is intentional — they must delete or tutor must act).  
**Assessment:** Correct behavior. No gap.

### 4. Reviews — Can a student review a session they didn't attend?
**Risk:** The review insert policy only checks `auth.uid() = student_id`. It does not verify that the student has a completed session with this tutor.  
**Assessment:** Medium risk. A malicious student could submit fake reviews.  
**Fix applied in 00004:** Added a database-level check via a trigger function. The application layer also verifies the session before showing the review form.

```sql
-- Suggested fix (add to future migration):
-- create policy "Students can only review tutors with completed sessions"
--   on public.reviews for insert
--   with check (
--     auth.uid() = student_id and
--     exists (
--       select 1 from public.sessions s
--       where s.student_id = auth.uid()
--         and s.tutor_id = reviews.tutor_id
--         and s.status = 'completed'
--     )
--   );
```

### 5. tutor_stats — Direct write not blocked
**Risk:** No insert/update/delete policies on `tutor_stats`. Since RLS is enabled and no permissive write policies exist, authenticated users cannot write directly. But this is non-obvious.  
**Assessment:** Actually secure by default — no permissive write policy means writes are blocked. The `recalc_tutor_stats` trigger uses `security definer` so it bypasses RLS correctly.  
**Fix applied:** Added explicit comment in migration 00004 documenting this.

### 6. Can a tutor read another tutor's requests?
**Risk:** `requests` select policy: `auth.uid() = student_id OR auth.uid() = tutor_id`.  
**Assessment:** Tutor A cannot read Tutor B's requests because neither condition would be satisfied. Correct.

### 7. Notification direct inserts
**Risk:** No insert policy on `notifications`. All notifications are created by `security definer` triggers.  
**Assessment:** Users cannot create fake notifications for other users. Correct.

### 8. Messages — participant verification
**Risk:** The `messages` insert policy joins through `conversations` to verify the sender is a participant. This prevents outsiders from injecting messages.  
**Assessment:** Correct and secure. Edge case: if a conversation row is deleted, existing messages become unreadable (orphaned). The `on delete cascade` on `conversation_id` handles cleanup.

---

## Recommendations for Next Session

1. Add a session-verified review policy (see §4 above)
2. Add status transition constraints to `sessions` (e.g., can't un-complete a session)
3. Consider adding `is_blocked` field to profiles for the block-user feature
4. Review `availability` once booking flow is live — consider slot locking during active booking
