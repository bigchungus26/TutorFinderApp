# Teachme — App Flow System

Complete reference for authentication state resolution, route guarding, and transition behaviour across the Teachme tutoring marketplace.

---

## 1. State Table

Every possible combination of network, auth, and profile state maps to exactly one destination.

| # | State | Network | User | profile.role | profile.onboarded_at | Destination | Notes |
|---|-------|---------|------|--------------|----------------------|-------------|-------|
| 1 | Offline | ✗ | any | any | any | `/offline` | Checked first; no network = no auth possible |
| 2 | Unauthenticated (no deep link) | ✓ | `null` | — | — | `/welcome` | Default landing for logged-out users |
| 3 | Unauthenticated (with deep link) | ✓ | `null` | — | — | `/welcome?redirect=<encoded>` | Deep link preserved in query param |
| 4 | Authenticated, no role | ✓ | ✓ | `null` | — | `/choose-role` | User signed up but hasn't picked student/tutor |
| 5 | Authenticated, role set, not onboarded | ✓ | ✓ | `"student"` | `null` | `/onboarding/student` | Mid-onboarding student |
| 6 | Authenticated, role set, not onboarded | ✓ | ✓ | `"tutor"` | `null` | `/onboarding/tutor` | Mid-onboarding tutor |
| 7 | Fully onboarded student (no deep link) | ✓ | ✓ | `"student"` | ✓ | `/` | Discover screen |
| 8 | Fully onboarded student (with deep link) | ✓ | ✓ | `"student"` | ✓ | `<deepLink>` | Resumes where they left off |
| 9 | Fully onboarded tutor (no deep link) | ✓ | ✓ | `"tutor"` | ✓ | `/tutor/requests` | Tutor home |
| 10 | Fully onboarded tutor (with deep link) | ✓ | ✓ | `"tutor"` | ✓ | `<deepLink>` | Resumes where they left off |
| 11 | Error / timeout | any | unknown | unknown | unknown | `/welcome` | Graceful fallback on any async failure |
| 12 | Session expired / force sign-out | ✓ | → `null` | — | — | `/welcome` | `initAuthListener` fires SIGNED_OUT event |

---

## 2. Splash Resolution Flowchart

The SplashPage runs parallel checks on mount and uses `resolveDestination()` to determine where to navigate. A minimum 900 ms display window and a 2500 ms hard timeout gate the transition.

```
┌─────────────────────────────────────────────────────────────┐
│                     App Boots → /                           │
│                   SplashPage mounts                         │
└──────────────────────────┬──────────────────────────────────┘
                           │  (parallel)
              ┌────────────┴────────────┐
              ▼                         ▼
    navigator.onLine          supabase.auth.getSession()
              │                         │
              └────────────┬────────────┘
                           │
                     Both resolved
                           │
                    ┌──────▼──────┐
                    │   online?   │
                    └──────┬──────┘
                     No ◄──┤──► Yes
                     │           │
                     ▼           ▼
              /offline    user in session?
                           No ◄──┤──► Yes
                           │           │
                           ▼           ▼
                      /welcome   fetch profile
                    (+ redirect  from supabase
                     if pending)      │
                                ┌─────▼─────┐
                                │  profile  │
                                │  .role?   │
                                └─────┬─────┘
                           null ◄─────┤─────► set
                             │                │
                             ▼                ▼
                       /choose-role    onboarded_at?
                                   null ◄────┤────► set
                                     │              │
                                     ▼              ▼
                           /onboarding/:role   role = ?
                                          student ◄──┤──► tutor
                                            │               │
                                            ▼               ▼
                                      deepLink || /   deepLink ||
                                                    /tutor/requests
                           │
                    ┌──────▼──────────────────────────────┐
                    │  Wait for: max(0, 900ms - elapsed)  │
                    │  Hard cap: 2500ms total              │
                    └──────┬──────────────────────────────┘
                           │
                    ┌──────▼──────┐
                    │  Exit anim  │  scale 1→1.02 + opacity→0 (220ms)
                    └──────┬──────┘
                           │
                    navigate(destination, { replace: true })
```

---

## 3. Route Table

All routes and their guard requirements.

| Route | Guard | Required Role | Layout | Notes |
|-------|-------|---------------|--------|-------|
| `/` (Splash) | none | none | none | Only shown during initial boot when user is null |
| `/welcome` | `PublicOnly` | none | none | Redirects if already onboarded |
| `/login` | `PublicOnly` | none | none | Redirects if already onboarded |
| `/signup` | `PublicOnly` | none | none | Redirects if already onboarded |
| `/privacy` | none | none | none | Always accessible |
| `/terms` | none | none | none | Always accessible |
| `/design-system` | none | none | none | Dev-only design reference |
| `/offline` | none | none | none | Shown when `!navigator.onLine` |
| `/choose-role` | `RequireAuth` | none | none | Authenticated users without a role |
| `/onboarding/student` | `RequireAuth` | none | none | Students completing signup |
| `/onboarding/tutor` | `RequireAuth` | none | none | Tutors completing signup |
| `/` | `RequireAuth` | `student` (soft) | `StudentLayout` | Discover — tutors are redirected to `/tutor/requests` |
| `/search` | `RequireAuth` | `student` | `StudentLayout` | |
| `/course/:id` | `ErrorBoundary` | none | none | Public-ish; wrapped for error resilience |
| `/tutor/:id` | `ErrorBoundary` | none | none | Public-ish; wrapped for error resilience |
| `/sessions` | `RequireAuth` | `student` | `StudentLayout` | |
| `/profile` | `RequireAuth` | `student` | `StudentLayout` | |
| `/saved` | `RequireAuth` | `student` | `StudentLayout` | |
| `/messages` | `RequireAuth` | `student` | `StudentLayout` | |
| `/messages/:id` | `RequireAuth` | `student` | none | Full-screen thread view |
| `/tutor/requests` | `RequireAuth` | `tutor` | `TutorLayout` | Tutor home |
| `/tutor/schedule` | `RequireAuth` | `tutor` | `TutorLayout` | |
| `/tutor/earnings` | `RequireAuth` | `tutor` | `TutorLayout` | |
| `/tutor/profile` | `RequireAuth` | `tutor` | `TutorLayout` | |
| `*` | none | none | none | `NotFound` 404 page |

---

## 4. Guard Behaviours

### PublicOnly (`src/components/guards/PublicOnly.tsx`)

Wraps `/welcome`, `/login`, `/signup`.

| Auth State | Action |
|------------|--------|
| `loading = true` | Render single pulsing accent dot (`animate-pulse`) |
| Authenticated + `onboarded_at` set | `Navigate` to role home (`/` or `/tutor/requests`) |
| Authenticated + not onboarded | `Navigate` to `/onboarding/:role` or `/choose-role` |
| Unauthenticated | Render children |

### RequireAuth (`src/components/guards/RequireAuth.tsx`)

Wraps all protected routes.

| Auth State | Action |
|------------|--------|
| `loading = true` | Render shimmer skeleton (3 card rows) |
| No user | Save `location.pathname + search + hash` to `sessionStorage["pendingRoute"]`, then `Navigate` to `/welcome` |
| Authenticated | Render children |

### RequireRole (`src/components/guards/RequireRole.tsx`)

Stacked inside `RequireAuth` for role-specific routes.

| State | Action |
|-------|--------|
| `loading = true` | Render `null` (parent skeleton visible) |
| No profile | Render `null` |
| `profile.role !== required role` | Fire sonner toast "This page is for tutors/students", then `Navigate` to correct home |
| Role matches | Render children |

---

## 5. Auth Listener (`src/lib/authListener.ts`)

`initAuthListener(navigate, queryClient)` subscribes to `supabase.auth.onAuthStateChange`.

| Event | Side Effects |
|-------|-------------|
| `SIGNED_OUT` | 1. Save current path to `sessionStorage["pendingRoute"]` (non-trivial paths only) → 2. `queryClient.clear()` to purge stale data → 3. `toast("You've been signed out")` → 4. `navigate("/welcome", { replace: true })` |
| All other events | No action (auth state is managed by `AuthContext`) |

Returns a cleanup function — unsubscribes the Supabase channel.

---

## 6. Transition Types

| Transition | Trigger | Animation | Duration |
|------------|---------|-----------|----------|
| Splash entrance (wordmark) | SplashPage mount | `fadeSlideUp`: opacity 0→1, y 12→0 | 220 ms |
| Splash entrance (dots) | 350 ms after mount | Staggered opacity 0→1, scale 0.6→1 | 150/300/450 ms |
| Dot bounce loop | After entrance | CSS `@keyframes bounce`, y 0→−6→0 | 1000 ms ∞ |
| Splash exit | After resolve + min timer | scale 1→1.02 + opacity 1→0 | 220 ms |
| Page entrance | Route change | `fadeSlideUp` via `AnimatePresence` | 220 ms |
| Page exit | Route change | opacity 1→0, y 0→−8 | 150 ms |
| Tab switch | Bottom nav tap | Fade only (no slide) | 220 ms |
| Sheet entrance | Bottom sheet open | Spring from y 100% | ~300 ms |
| Offline auto-retry | Every 5 s | None (silent check) | — |
| Reduced motion | `prefers-reduced-motion: reduce` | All variants degrade to opacity fade | 150 ms |

---

## 7. Deep Link & Pending Route Flow

```
1. User visits /sessions (not logged in)
        │
        ▼
   RequireAuth fires
        │
        ▼
   sessionStorage["pendingRoute"] = "/sessions"
        │
        ▼
   Navigate → /welcome
        │
   User logs in
        │
        ▼
   SplashPage reads sessionStorage["pendingRoute"]
        │
        ▼
   resolveDestination({ deepLink: "/sessions", ... })
        │
        ▼
   navigate("/sessions", { replace: true })
        │
        ▼
   sessionStorage["pendingRoute"] cleared
```

Or, on force sign-out via `initAuthListener`:

```
1. Token expires / server signs out user
        │
        ▼
   supabase fires SIGNED_OUT
        │
        ▼
   initAuthListener:
     save pendingRoute (if non-trivial path)
     queryClient.clear()
     toast("You've been signed out")
     navigate("/welcome")
```

---

## 8. File Map

| File | Purpose |
|------|---------|
| `src/lib/routing.ts` | Pure `resolveDestination()` — no React, no side effects |
| `src/lib/authListener.ts` | `initAuthListener()` — global SIGNED_OUT handler |
| `src/lib/supabase.ts` | Supabase client singleton |
| `src/lib/motion.ts` | Framer Motion variants + transitions |
| `src/pages/SplashPage.tsx` | Boot screen with async resolution and timed exit |
| `src/pages/OfflinePage.tsx` | No-network screen with 5 s auto-retry |
| `src/components/guards/PublicOnly.tsx` | Blocks authenticated users from public routes |
| `src/components/guards/RequireAuth.tsx` | Blocks unauthenticated users from protected routes |
| `src/components/guards/RequireRole.tsx` | Blocks wrong-role users from role-specific routes |
| `src/contexts/AuthContext.tsx` | React context: user, profile, loading, auth actions |
| `src/App.tsx` | Route definitions; wraps guards inline |
