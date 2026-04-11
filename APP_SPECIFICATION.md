# Tutr — Complete Application Specification

**Version:** 1.0
**Date:** April 11, 2026
**Purpose:** Handoff document. A new developer can build the entire app from this without ever seeing the current version.

---

# Part 1 — Architecture Overview

## 1.1 What Tutr Is

A peer tutoring marketplace for Lebanese university students. Students at AUB (American University of Beirut), LAU (Lebanese American University), and NDU (Notre Dame University) find fellow students who excelled in their exact courses, view their verified grades, read reviews, and book one-on-one tutoring sessions. Tutors set their own hourly rates and manage incoming session requests.

## 1.2 Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Frontend framework | React | 18.3.1 |
| Language | TypeScript | 5.8.3 |
| Build tool | Vite | 5.4.19 |
| Routing | React Router DOM | 6.30.1 |
| UI components | shadcn/ui (60+ Radix-based components) | — |
| Styling | Tailwind CSS | 3.4.17 |
| Animation | Framer Motion | 11.0.0 |
| Data fetching/caching | TanStack React Query | 5.83.0 |
| Forms | React Hook Form + Zod | 7.61.1 / 3.25.76 |
| Backend / DB | Supabase (PostgreSQL + Auth + RLS) | — |
| Hosting | Vercel (auto-deploy from `main`) | — |
| Package manager | npm | — |

## 1.3 Repository Structure

```
TutorFinderApp/
├── src/
│   ├── pages/              # One file per route
│   ├── components/         # Shared app components (TutorCard, Footer, layouts)
│   ├── components/ui/      # shadcn/ui library (do not modify)
│   ├── contexts/           # AuthContext, UniversityContext
│   ├── hooks/              # useSupabaseQuery, useAuth
│   ├── lib/                # supabase.ts client
│   ├── types/              # database.ts (Supabase types)
│   ├── App.tsx             # Router + providers
│   ├── main.tsx            # React entry
│   └── index.css           # Design tokens + Tailwind
├── public/                 # Static: robots.txt, sitemap.xml, llms.txt, favicon
├── supabase/
│   ├── migrations/         # 00001_create_tables.sql, 00002_rls_policies.sql
│   └── seed.sql            # University + course seed data
├── .github/workflows/ci.yml
├── vercel.json             # Security headers + SPA rewrite
├── tailwind.config.ts      # Design tokens
├── DESIGN_SYSTEM.md
├── SECURITY.md
└── AUDIT_REPORT.md
```

## 1.4 State Management

| Concern | Mechanism | Scope |
|---------|-----------|-------|
| Auth (user, profile) | `AuthContext` (React Context) | Global — wraps entire app |
| University filter | `UniversityContext` (React Context + localStorage `tutr_university`) | Global |
| Server data (courses, tutors, sessions, reviews, requests) | React Query via `useSupabaseQuery.ts` hooks | Per-component, cached |
| Form state | Local `useState` in each page | Per-page |
| UI state (modals, tabs, filters) | Local `useState` | Per-component |

## 1.5 Authentication Model

- **Provider:** Supabase Auth (email + password)
- **Session management:** Supabase handles JWTs automatically via `@supabase/supabase-js`. Tokens stored in browser memory by the SDK.
- **Profile creation:** A PostgreSQL trigger (`on_auth_user_created`) auto-inserts a row in `profiles` when a user signs up, using `full_name` from the signup metadata.
- **Auth state flow:** `AuthContext` listens to `onAuthStateChange`. On every auth event, it fetches the user's profile from the `profiles` table.
- **Loading state:** While the initial session check runs, a full-screen spinner is shown. No routes render until `loading` is false.

## 1.6 User Roles

| Role | Value in `profiles.role` | Access |
|------|-------------------------|--------|
| Student | `"student"` | Discover, Search, Course Detail, Tutor Profile, Sessions, Student Profile |
| Tutor | `"tutor"` | Requests, Schedule, Earnings, Tutor Profile Settings |
| Not onboarded | `profile.onboarded_at === null` | Forced to `/choose-role` then onboarding |
| Not logged in | No Supabase session | Splash, Welcome, Login, Signup, Privacy, Terms, Course Detail, Tutor Profile (public) |

Users can switch between student and tutor modes from their profile page. The switch updates `profiles.role` via a direct Supabase update and refreshes the profile context.

## 1.7 Routing Structure

All routes are defined in `src/App.tsx` in a single `<Routes>` block with inline auth guards.

| Route | Component | Auth | Onboarded | Role Guard |
|-------|-----------|------|-----------|------------|
| `/` | SplashPage (not logged in) OR StudentLayout+DiscoverPage (student) OR redirect to `/tutor/requests` (tutor) | Varies | Yes if logged in | Role-based redirect |
| `/welcome` | WelcomePage | No | — | Redirects to `/` if onboarded, `/choose-role` if logged in but not onboarded |
| `/login` | LoginPage | No | — | Same redirect logic as `/welcome` |
| `/signup` | SignupPage | No | — | Same redirect logic as `/welcome` |
| `/choose-role` | WelcomePage (role picker mode) | Yes | No | Redirects to `/` if already onboarded |
| `/onboarding/student` | StudentOnboarding | Yes | — | — |
| `/onboarding/tutor` | TutorOnboarding | Yes | — | — |
| `/search` | StudentLayout+SearchPage | Yes | — | — |
| `/course/:id` | CourseDetail | No | — | — |
| `/tutor/:id` | TutorProfilePage | No | — | — |
| `/sessions` | StudentLayout+SessionsPage | Yes | — | — |
| `/profile` | StudentLayout+ProfilePage | Yes | — | — |
| `/tutor/requests` | TutorLayout+TutorRequests | Yes | — | — |
| `/tutor/schedule` | TutorLayout+TutorSchedule | Yes | — | — |
| `/tutor/earnings` | TutorLayout+TutorEarnings | Yes | — | — |
| `/tutor/profile` | TutorLayout+TutorProfileSettings | Yes | — | — |
| `/privacy` | PrivacyPolicy | No | — | — |
| `/terms` | TermsOfUse | No | — | — |
| `/design-system` | DesignSystem | No | — | Internal tool |
| `*` | NotFound | No | — | — |

## 1.8 Deployment

- **Platform:** Vercel
- **Git integration:** Auto-deploys from `main` branch on GitHub (`bigchungus26/TutorFinderApp`)
- **Environment variables (set in Vercel dashboard):**
  - `VITE_SUPABASE_URL` — Supabase project URL
  - `VITE_SUPABASE_ANON_KEY` — Supabase anonymous key
- **`vercel.json` configures:**
  - SPA rewrite: all non-file routes serve `index.html`
  - Security headers: HSTS, X-Content-Type-Options nosniff, X-Frame-Options DENY, Referrer-Policy strict-origin-when-cross-origin, Content-Security-Policy
- **CI:** GitHub Actions (`.github/workflows/ci.yml`) runs `npm ci` → `npm run build` → `npm test --run` on every PR

## 1.9 Database Schema

8 tables in Supabase PostgreSQL. Full schema in `supabase/migrations/00001_create_tables.sql`.

### universities
| Column | Type | Notes |
|--------|------|-------|
| id | text PK | "aub", "lau", "ndu" |
| name | text | Full name |
| short_name | text | "AUB", "LAU", "NDU" |
| color | text | Hex color for UI tinting |
| created_at | timestamptz | |

### courses
| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | Auto-generated |
| code | text | e.g. "CMPS 200" |
| name | text | e.g. "Introduction to Programming" |
| university_id | text FK→universities | |
| subject | text | e.g. "Computer Science" |
| description | text | |
| credits | smallint | Default 3 |
| prerequisites | text[] | Array of course codes |
| typical_semester | text | e.g. "Fall / Spring" |
| created_at | timestamptz | |

### profiles
| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK FK→auth.users | |
| role | text | "student" or "tutor" |
| full_name | text | |
| avatar_url | text | |
| university_id | text FK→universities | |
| major | text | |
| year | text | e.g. "Senior" |
| bio | text | Tutor bio |
| hourly_rate | numeric(6,2) | Tutor rate |
| verified | boolean | Default false |
| online | boolean | Default true |
| in_person | boolean | Default false |
| agreed_terms_at | timestamptz | Set during onboarding |
| onboarded_at | timestamptz | Set during onboarding — used as auth guard |
| created_at | timestamptz | |
| updated_at | timestamptz | Auto-updated by trigger |

### tutor_courses
| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | |
| tutor_id | uuid FK→profiles | |
| course_id | uuid FK→courses | |
| grade | text | "A", "A-", "B+", "B", "B-" |
| created_at | timestamptz | |

### sessions
| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | |
| tutor_id | uuid FK→profiles | |
| student_id | uuid FK→profiles | Must differ from tutor_id |
| course_id | uuid FK→courses | |
| date | date | |
| time | time | |
| duration | smallint | Minutes, default 60 |
| location | enum | "online" or "in-person" |
| status | enum | "upcoming", "completed", "cancelled" |
| price | numeric(8,2) | |
| created_at | timestamptz | |
| updated_at | timestamptz | |

### requests
| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | |
| student_id | uuid FK→profiles | |
| tutor_id | uuid FK→profiles | Must differ from student_id |
| course_id | uuid FK→courses | |
| date | date | |
| time | time | |
| duration | smallint | |
| location | enum | "online" or "in-person" |
| message | text | |
| status | enum | "pending", "accepted", "declined" |
| created_at | timestamptz | |
| updated_at | timestamptz | |

### reviews
| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | |
| session_id | uuid FK→sessions | Optional |
| tutor_id | uuid FK→profiles | |
| student_id | uuid FK→profiles | Must differ from tutor_id |
| course_id | uuid FK→courses | |
| rating | smallint | 1–5 |
| comment | text | |
| created_at | timestamptz | |

### tutor_stats
| Column | Type | Notes |
|--------|------|-------|
| tutor_id | uuid PK FK→profiles | |
| rating | numeric(3,2) | Average of reviews |
| review_count | integer | |
| sessions_completed | integer | |
| response_time | text | e.g. "< 1 hour" |
| updated_at | timestamptz | |

### Database Triggers
1. **`on_auth_user_created`** — After INSERT on `auth.users`: auto-inserts a `profiles` row with `id`, `full_name`, `avatar_url` from signup metadata.
2. **`trg_recalc_tutor_stats`** — After INSERT on `reviews`: recalculates average rating, review count, and sessions completed in `tutor_stats` via upsert.
3. **`trg_profiles_updated_at`**, **`trg_sessions_updated_at`**, **`trg_requests_updated_at`** — Before UPDATE: auto-sets `updated_at = now()`.

### Row Level Security (all tables have RLS enabled)
- `universities`, `courses`, `reviews`, `tutor_courses`, `tutor_stats` — publicly readable
- `profiles` — publicly readable; only own row writable
- `sessions` — only visible to tutor or student participant; students create; both update
- `requests` — only visible to tutor or student participant; students create; tutors update status; students delete pending

---

# Part 2 — Global UI System

## 2.1 Color Palette

All colors defined as HSL CSS custom properties in `src/index.css`, mapped to Tailwind in `tailwind.config.ts`.

| Token | HSL | Hex (approx) | Tailwind Class |
|-------|-----|-------------|----------------|
| background | 40 33% 97% | #f7f5f0 | `bg-background` |
| surface | 0 0% 100% | #ffffff | `bg-surface` |
| surface-elevated | 0 0% 100% | #ffffff | `bg-surface-elevated` |
| ink | 0 0% 10% | #1a1a1a | `text-ink` / `text-foreground` |
| ink-muted | 0 0% 42% | #6b6b6b | `text-ink-muted` / `text-muted-ink` |
| ink-subtle | 0 0% 58% | #949494 | `text-ink-subtle` |
| hairline | 40 20% 90% | #e8e4dd | `border-hairline` |
| accent | 152 60% 42% | #2ba66a | `bg-accent` / `text-accent` |
| accent-soft | 152 50% 93% | #e3f6ec | `bg-accent-soft` |
| accent-foreground | 0 0% 100% | #ffffff | `text-accent-foreground` |
| success | 155 46% 33% | #2d7a4f | `text-success` |
| warning | 38 92% 50% | #f5a623 | `text-warning` |
| danger | 0 84% 60% | #ef4444 | `text-danger` / `bg-danger` |
| destructive | 0 84% 60% | #ef4444 | `text-destructive` |
| uni-aub | 0 100% 27% | #8b0000 | `text-uni-aub` |
| uni-lau | 220 100% 32% | #003da5 | `text-uni-lau` |
| uni-ndu | 157 80% 24% | #0b6e4f | `text-uni-ndu` |

## 2.2 Typography

Two font families loaded from Google Fonts via `index.html`:
- **Fraunces** (variable, opsz 9-144, weights 400/500/600) — display headings
- **Inter** (weights 400/500/600) — body text

| Token | Class | Font | Size | Line Height | Weight | Tracking |
|-------|-------|------|------|-------------|--------|----------|
| display-xl | `text-display-xl` | Fraunces | 36px | 44px | 500 | -0.02em |
| display-lg | `text-display-lg` | Fraunces | 28px | 36px | 500 | — |
| display-md | `text-display-md` | Fraunces | 22px | 30px | 500 | — |
| display-sm | `text-display-sm` | Fraunces | 18px | 26px | 500 | — |
| body-lg | `text-body-lg` | Inter | 16px | 24px | 400 | — |
| body | `text-body` | Inter | 15px | 22px | 400 | — |
| body-sm | `text-body-sm` | Inter | 14px | 20px | 400 | — |
| label | `text-label` | Inter | 13px | 18px | 500 | — |
| caption | `text-caption` | Inter | 12px | 16px | 500 | 0.01em |

## 2.3 Spacing

4px grid. Allowed Tailwind suffix values: 1 (4px), 2 (8px), 3 (12px), 4 (16px), 5 (20px), 6 (24px), 8 (32px), 10 (40px), 12 (48px), 16 (64px), 20 (80px), 24 (96px).

## 2.4 Border Radii

| Token | Value | Tailwind | Usage |
|-------|-------|----------|-------|
| radius-sm | 8px | `rounded-sm` | Small inputs |
| radius-md | 14px | `rounded-md` | Buttons, inputs |
| radius-lg | 20px | `rounded-lg` | Cards |
| radius-xl | 28px | `rounded-xl` | Sheets, modals, tab bar |
| radius-full | 999px | `rounded-pill` | Chips, avatars |

## 2.5 Shadows

| Token | Value | Tailwind | Usage |
|-------|-------|----------|-------|
| shadow-none | none | `shadow-none` | Default — use borders |
| shadow-float | `0 8px 32px rgba(20,20,20,0.08)` | `shadow-float` | Bottom tab bar, modals only |
| shadow-press | `inset 0 1px 2px rgba(20,20,20,0.12)` | `shadow-press` | Pressed states |

## 2.6 Background Treatments

- **Page backgrounds:** Solid `bg-background` (warm cream `hsl(40 33% 97%)`)
- **Card backgrounds:** Solid `bg-surface` (white) with `border border-hairline`
- **Decorative blobs:** Used on Splash, Welcome, Login, Signup pages only. Two large `div` elements with `bg-accent-soft`, `rounded-full`, `blur-3xl`, partially off-screen (`translate-x/y`), `opacity-40-60`. Purely decorative.
- **No gradients, images, or patterns** are used anywhere.

## 2.7 Layout Primitives

### Phone Frame (Desktop)
On screens ≥480px, `#root` is constrained to `max-width: 440px` with `margin: 0 auto` and `box-shadow: var(--shadow-float)`, creating a phone-frame appearance.

### StudentLayout
Wraps all student dashboard pages. Contains:
1. `AnimatePresence` page transition wrapper (opacity + y-axis, 220ms)
2. `<Footer />` component (Privacy/Terms links)
3. Fixed bottom navigation bar at `bottom: 24px`, centered, `w-[calc(100%-48px)]`, `max-w-[392px]`

**Bottom nav tabs:** Discover (Sparkles icon, `/`), Search (Search icon, `/search`), Sessions (Calendar icon, `/sessions`), Profile (User icon, `/profile`). Active tab: `text-accent`. Inactive: `text-muted-ink`.

### TutorLayout
Identical structure to StudentLayout. Bottom nav tabs: Requests (Inbox icon, `/tutor/requests`), Schedule (CalendarDays icon, `/tutor/schedule`), Earnings (DollarSign icon, `/tutor/earnings`), Profile (User icon, `/tutor/profile`).

### Footer
Thin bar with `border-t border-hairline`. Contains two text links: "Privacy Policy" → `/privacy`, "Terms of Use" → `/terms`. Separated by a `·` middot. Text is `text-xs text-muted-ink`, underlined, hover turns `text-accent`.

### Toast
Sonner toast component mounted globally in `App.tsx` via `<Sonner />`. Available for success/error notifications but not currently triggered by any UI.

---

# Part 3 — Screens and Flows by Role

---

## 3.1 Unauthenticated User Flows

### 3.1.1 Splash Page

- **Route:** `/` (when not logged in)
- **Entry points:** Visiting the app URL directly for the first time; navigating to `/` while not authenticated.
- **Layout:** Full-screen, `bg-background`, vertically and horizontally centered content. Two decorative blurred circles (`bg-accent-soft`, `opacity-50` and `opacity-40`, positioned top-right and bottom-left, `blur-3xl`). No header, no footer, no navigation.
- **Content:**
  1. **App name** — `h1`, Fraunces 60px, `font-semibold`, `text-accent`, tracking-tight. Text: "Tutr".
  2. **Tagline** — `p`, `text-base text-muted-ink`, appears 400ms after the name with a `y: 8 → 0` animation. Text: "Peer tutoring, simplified."
- **Animations:**
  - Whole page: `opacity: 0 → 1` fade in.
  - Logo container: `scale: 0.8 → 1`, `opacity: 0 → 1`, 500ms ease-out.
  - Tagline: `opacity: 0 → 1`, `y: 8 → 0`, 400ms delay, 400ms duration.
- **Auto-redirect:** After 2000ms, navigates to `/welcome`.
- **Tap to skip:** Clicking anywhere on the page immediately navigates to `/welcome`.
- **Backend:** None.
- **Edge cases:** If user is already logged in and onboarded, the route guard in `App.tsx` shows the dashboard instead of splash. If logged in but not onboarded, redirects to `/choose-role`.

---

### 3.1.2 Welcome Page (Landing Mode)

- **Route:** `/welcome`
- **Entry points:** Auto-redirect from Splash after 2s; tapping the Splash screen; manually navigating to `/welcome`.
- **Layout:** Full-screen, `bg-background`, flex column, `px-6 pt-16 pb-8`. Two decorative blurred circles (same as Splash). `Footer` at the very bottom.
- **Content (top to bottom):**
  1. **Brand label** — `span`, `text-sm font-body font-semibold text-accent`, uppercase, tracking-wide. Text: "TUTR".
  2. **Headline** — `h1`, `text-display-xl`. Text: "Learn from students who've been there."
  3. **Subtitle** — `p`, `text-muted-ink text-base`, `mb-12`. Text: "Tutr connects you with top peer tutors at your university."
  4. **"Get started" button** — `motion.button` with `whileTap={{ scale: 0.98 }}`. Full-width, `bg-surface border-2 border-accent rounded-xl p-5`. Left-aligned text layout with ChevronRight icon on right (`text-accent`).
     - Primary text: "Get started" (Fraunces 18px medium)
     - Secondary text: "Create a free account" (`text-sm text-muted-ink`)
     - **Action:** Navigate to `/signup`
  5. **"Sign in" button** — Same layout but `border border-hairline` (not accent). Primary text in `text-muted-ink`. ChevronRight in `text-muted-ink`.
     - Primary text: "Sign in"
     - Secondary text: "I already have an account"
     - **Action:** Navigate to `/login`
  6. **Footer** — Privacy Policy / Terms of Use links.
- **Backend:** None.
- **Edge cases:** If user becomes logged in (e.g. from another tab), route guard redirects to `/` (if onboarded) or `/choose-role` (if not).

---

### 3.1.3 Signup Page

- **Route:** `/signup`
- **Entry points:** "Get started" button on Welcome page; "Don't have an account? Sign up" link on Login page.
- **Layout:** Full-screen, `bg-background`, flex column, `px-6 pt-16 pb-8`. One decorative blurred circle (top-right) and one (bottom-left). `Footer` at bottom.
- **Content:**
  1. **Brand label** — "TUTR" (same style as Welcome).
  2. **Headline** — `text-display-lg`. Text: "Create your account."
  3. **Subtitle** — `text-muted-ink text-base mb-8`. Text: "Join the peer tutoring community."
  4. **Form** (HTML `<form>`, `space-y-4`):
     - **Full name input:**
       - Label: "Full name" (`text-sm font-medium text-muted-ink`)
       - Input: `type="text"`, placeholder "Your full name", `required`
       - Style: `p-3.5 rounded-lg border border-hairline bg-surface font-body text-sm`
     - **Email input:**
       - Label: "Email"
       - Input: `type="email"`, placeholder "you@university.edu", `required`
     - **Password input:**
       - Label: "Password"
       - Input: `type="password"`, placeholder "At least 8 characters", `required`, `minLength={8}`
     - **Terms checkbox:**
       - `<label>` wrapping a checkbox + text
       - Checkbox: `w-4 h-4 accent-accent`
       - Text: `text-xs text-muted-ink` — "I agree to the Terms of Use and Privacy Policy." with `<Link>` elements to `/terms` and `/privacy` (open in new tab via `target="_blank"`), styled `text-accent underline`.
     - **Error message** (conditional): `text-sm text-destructive bg-destructive/10 rounded-lg px-3 py-2`. Shows the error string from Supabase.
     - **Submit button:** `motion.button type="submit"`, `w-full h-14 rounded-lg bg-accent text-accent-foreground font-body font-semibold text-base`. `disabled` when `loading || !agreedTerms`. Disabled state: `opacity-40`. Text: "Create account" or "Creating account…" while loading.
  5. **Sign in link** — `text-center mt-6`. `<Link to="/login">`, `text-sm text-muted-ink underline underline-offset-2`. Text: "Already have an account? Sign in"
  6. **Footer.**
- **Form submission flow:**
  1. Validate `agreedTerms === true` (button is disabled if not).
  2. Set `loading = true`, clear previous error.
  3. Call `signUp(email, password, fullName)` → Supabase `auth.signUp()` with `{ data: { full_name: fullName } }` in metadata.
  4. **On success:** Show "Check your email" screen (see below).
  5. **On error:** Display error message. Common errors: "User already registered", "Password should be at least 6 characters" (Supabase default, our UI says 8 but Supabase enforces 6).
  6. Set `loading = false`.
- **"Check your email" screen** (shown after successful signup if email confirmation is enabled):
  - Full-screen centered layout, `bg-background`.
  - Accent-soft circle with envelope emoji (text "✉️", `text-3xl`).
  - Heading: `font-display text-2xl font-medium text-center`. Text: "Check your email".
  - Body: `text-muted-ink text-center`. Text: "We sent a confirmation link to **{email}**. Click it to activate your account."
  - Link: "Go to sign in" → navigates to `/login`. `text-sm text-accent underline`.
- **Backend:** `supabase.auth.signUp({ email, password, options: { data: { full_name } } })`. On success, Supabase creates `auth.users` entry. The `handle_new_user` trigger auto-creates a `profiles` row. If email confirmation is disabled in Supabase settings, the user is immediately logged in and the `onAuthStateChange` listener fires, setting `user` and `profile` in AuthContext.
- **Edge cases:**
  - If Supabase has email confirmation disabled: The `onAuthStateChange` fires immediately, setting `isLoggedIn = true`. The route guard then redirects from `/signup` to `/choose-role` (since `hasOnboarded` is false). The "check email" screen may flash briefly or be skipped entirely.
  - Duplicate email: Supabase returns an error; displayed in the red error box.

---

### 3.1.4 Login Page

- **Route:** `/login`
- **Entry points:** "Sign in" button on Welcome page; "Already have an account? Sign in" link on Signup page; "Go to sign in" link on check-email screen.
- **Layout:** Identical frame to Signup (full-screen, background, one decorative blob top-right, footer).
- **Content:**
  1. **Brand label** — "TUTR".
  2. **Headline** — `text-display-lg`. Text: "Welcome back."
  3. **Subtitle** — `text-muted-ink text-base mb-8`. Text: "Sign in to continue."
  4. **Form:**
     - **Email input:** Label "Email", placeholder "you@university.edu", `type="email"`, `required`.
     - **Password input:** Label "Password", placeholder "••••••••", `type="password"`, `required`, `minLength={8}`.
     - **Error message** (conditional): Same style as signup.
     - **Submit button:** Text "Sign in" / "Signing in…". Same style as signup.
  5. **Signup link** — "Don't have an account? Sign up" → `/signup`.
  6. **Footer.**
- **Form submission flow:**
  1. Set `loading = true`, clear error.
  2. Call `signIn(email, password)` → Supabase `auth.signInWithPassword()`.
  3. **On success:** Navigate to `/`. The route guard then directs based on role/onboarding status.
  4. **On error:** Display error message. Common: "Invalid login credentials".
  5. Set `loading = false`.
- **Backend:** `supabase.auth.signInWithPassword({ email, password })`. On success, Supabase sets the session. `onAuthStateChange` fires → AuthContext fetches profile.

---

### 3.1.5 Privacy Policy Page

- **Route:** `/privacy`
- **Entry points:** Footer link from any page; Terms checkbox links on Signup/Onboarding; link from Terms page.
- **Layout:** `bg-background`, `px-6 pt-8 pb-16`. No nav bar, no layout wrapper.
- **Content:**
  1. **Back link** — `<Link to="/">`, inline-flex with ArrowLeft icon (16px) + text "Back". `text-sm text-muted-ink mb-6`.
  2. **Title** — `text-display-lg`. Text: "Privacy Policy".
  3. **Date** — `text-sm text-muted-ink mb-8`. Text: "Last updated: April 10, 2026".
  4. **Body** — 10 numbered sections in `space-y-6 text-sm leading-relaxed text-foreground`. Each section has an `h2` (`font-display text-lg font-medium mb-2`) and paragraph/list content. Sections cover: Who We Are, Data We Collect, Why We Collect It, Retention, Who We Share Data With, GDPR/CCPA Rights, Cookies, Security, Changes to This Policy, Contact. Contact email: `privacy@teachme.app` (rendered as `<a href="mailto:...">`, styled `text-accent underline`).
  5. **Bottom links** — `mt-10 pt-6 border-t border-hairline`, flex row, links to Terms and Privacy. Privacy is `text-accent`, Terms is normal.
- **Backend:** None. Static content.

---

### 3.1.6 Terms of Use Page

- **Route:** `/terms`
- **Entry points:** Same as Privacy Policy (footer, checkbox links, Privacy page link).
- **Layout:** Identical to Privacy Policy page.
- **Content:** 10 sections: Acceptance, What the Service Is, User Responsibilities, Payment & Billing, Cancellation & Refunds, Limitation of Liability, Acceptable Use, Termination, Governing Law, Contact. Contact email: `support@teachme.app`.
- **Backend:** None. Static content.

---

### 3.1.7 Course Detail Page (Public)

- **Route:** `/course/:id`
- **Entry points:** Tapping a course card on Discover page; tapping a course in Search results.
- **Layout:** Full-screen `bg-background`. No nav bar (standalone page). Padding `px-5 pt-14 pb-28`.
- **Loading state:** Full-screen centered spinner (`w-8 h-8`, accent border, transparent top border, `animate-spin`).
- **Not-found state:** If course or university data is null, renders nothing (`return null`).
- **Content:**
  1. **Back button** — `<button onClick={() => navigate(-1)}>`. ArrowLeft icon 22px. `mb-4 p-2 -ml-2 rounded-xl hover:bg-muted`.
  2. **University color bar** — Full-width `h-1.5` div with `rounded-full`, `backgroundColor: uni.color` (inline style). `mb-5`.
  3. **Course code** — `text-display-xl mb-1`. Text: e.g. "CMPS 200".
  4. **Course name** — `text-lg text-muted-ink mb-2`. Text: e.g. "Introduction to Programming".
  5. **Description** — `text-sm text-muted-ink leading-relaxed mb-4`. Full course description.
  6. **Tutor count** — Flex row with Users icon (15px) + text e.g. "18 tutors available". `text-sm text-muted-ink`.
  7. **Tabs** — Two pill buttons: "tutors" (default active) and "about". Active: `bg-foreground text-background`. Inactive: `text-muted-ink`. `rounded-pill text-sm font-medium`.
  8. **Tutors tab content:** List of `TutorCard` components for tutors who teach this course. If no tutors: centered text "No tutors for this course yet." in `text-muted-ink`.
  9. **About tab content:** Card with rows: Credits, Typical semester, Prerequisites (comma-joined or "None"), University. Each row: label left (`text-sm text-muted-ink`), value right (`text-sm font-medium`), separated by `border-t border-hairline`.
- **Backend:**
  - `useCourse(id)` → `supabase.from("courses").select("*").eq("id", id).single()`
  - `useUniversities()` → `supabase.from("universities").select("*")`
  - `useTutorsByCourse(id)` → `supabase.from("tutor_courses").select("*, tutor:profiles(*, tutor_stats(*))").eq("course_id", id)`

---

### 3.1.8 Tutor Profile Page (Public)

- **Route:** `/tutor/:id`
- **Entry points:** Tapping a TutorCard anywhere (Discover, Search, Course Detail).
- **Layout:** Full-screen `bg-background`, `pb-28` for book bar clearance. `px-5 pt-14 pb-6` for content area.
- **Loading state:** Full-screen centered spinner.
- **Not-found state:** `return null` if tutor or university data missing.
- **Content:**
  1. **Back button** — Same as Course Detail. `mb-6`.
  2. **Profile header** — Centered column:
     - Avatar: `w-24 h-24 rounded-full object-cover mb-3`. Fallback: `https://i.pravatar.cc/100`.
     - Name: `font-display text-2xl font-medium` with BadgeCheck icon (18px, `text-accent`) if `tutor.verified`.
     - University pill: `rounded-pill text-xs font-medium` with inline style `backgroundColor: uni.color + "15"`, `color: uni.color`. Text: uni short_name.
     - Major/year: `text-sm text-muted-ink`. e.g. "Computer Science, Senior".
  3. **Stats card** — `bg-surface rounded-xl border border-hairline p-4`. Three columns evenly spaced, separated by `w-px h-8 bg-hairline` vertical dividers:
     - **Rating:** Star icon (14px, `text-accent fill-accent`) + `font-display font-medium text-lg` showing rating or "—". Below: `text-xs text-muted-ink` showing review count.
     - **Sessions:** Number in display font. Below: "sessions".
     - **Response time:** Text like "< 1 hour" or "—". Below: "response".
  4. **About section** — `h2` "About" + `p` with tutor bio.
  5. **Courses section** (if any) — `h2` "Courses I teach" + flex-wrap of pills: `text-xs px-2.5 py-1 rounded-pill bg-muted font-medium`. Each shows "CODE · GRADE".
  6. **Reviews section** (if any) — `h2` "Reviews" + up to 3 review cards. Each card:
     - Student avatar (28px circle) + name (`text-sm font-medium`) + star icons aligned right.
     - Comment: `text-sm text-muted-ink leading-relaxed`.
     - Date: `text-xs text-muted-ink`. Formatted "MMM DD, YYYY".
  7. **Pricing section** — `h2` "Pricing" + card with two rows:
     - Row 1: Video icon + "1-on-1 · 60 min" → `$hourlyRate` right-aligned.
     - Row 2: MessageCircle icon + "Group (2–4) · 60 min" → `$round(hourlyRate * 0.67)/person`.
  8. **Sticky book CTA** — Fixed bar at bottom. `max-w-[440px]` centered. Hidden initially, appears when `scrollY > 200` (CSS `translate-y-0` vs `translate-y-full` transition, 300ms).
     - **Before booking:** Green button `w-full h-14 rounded-lg bg-accent text-accent-foreground font-body font-semibold`. Text: "Book a session · $rate/hr". `whileTap={{ scale: 0.98 }}`. On click: sets local `booked = true`.
     - **After booking:** Centered text: "Session request sent!" in `text-success font-medium`.
     - **Note:** Currently client-side only — does NOT create a real session or request in Supabase.
- **Backend:**
  - `useTutor(id)` → `supabase.from("profiles").select("*, tutor_stats(*), tutor_courses(*, course:courses(*))").eq("id", id).eq("role", "tutor").single()`
  - `useReviews(id)` → `supabase.from("reviews").select("*, student:profiles!reviews_student_id_fkey(full_name, avatar_url), course:courses(code, name)").eq("tutor_id", id).order("created_at", desc)`
  - `useUniversities()`

---

### 3.1.9 404 Not Found Page

- **Route:** `*` (any unmatched path)
- **Layout:** Full-screen `bg-muted`, flex centered.
- **Content:**
  - "404" in `text-4xl font-bold`.
  - "Oops! Page not found" in `text-xl text-muted-foreground`.
  - "Return to Home" link → `/`. `text-primary underline`.

---

## 3.2 Authenticated — Choose Role (Not Yet Onboarded)

### 3.2.1 Role Picker

- **Route:** `/choose-role` (renders WelcomePage in logged-in mode)
- **Entry points:** Automatic redirect after signup (when email confirmation is off); redirect from `/` when logged in but `onboarded_at` is null.
- **Layout:** Same frame as Welcome landing (full-screen, cream background, one decorative blob, footer).
- **Content:**
  1. **Brand label** — "TUTR".
  2. **Headline** — `text-display-xl`. Text: "How will you use Tutr?"
  3. **Subtitle** — `text-muted-ink text-base mb-12`. Text: "You can switch anytime from your profile."
  4. **"I'm a student" button** — Same card-style button as Welcome. `border-2 border-accent`. ChevronRight in accent.
     - Primary: "I'm a student"
     - Secondary: "Find tutors for your courses"
     - **Action:** Navigate to `/onboarding/student`
  5. **"I'm a tutor" button** — `border border-hairline`. Muted text and icon.
     - Primary: "I'm a tutor"
     - Secondary: "Share what you've aced and earn"
     - **Action:** Navigate to `/onboarding/tutor`
  6. **Footer.**
- **Backend:** None.

---

## 3.3 Student Onboarding Flow

### 3.3.1 Student Onboarding

- **Route:** `/onboarding/student`
- **Entry points:** "I'm a student" button on Role Picker.
- **Auth guard:** Redirects to `/login` if not logged in.
- **Layout:** Full-screen `bg-background`, flex column. Progress dots at top, slide content in middle, action button at bottom, footer at very bottom.
- **Progress dots:** 3 dots, centered, `pt-6 pb-2`. Active dot: `w-6 h-1.5 rounded-full bg-accent`. Inactive: `w-1.5 h-1.5 rounded-full bg-hairline`. Transition: `duration-300`.
- **Page transitions:** `AnimatePresence mode="wait"`. Enter: `opacity: 0, x: 40 → opacity: 1, x: 0`. Exit: `opacity: 0, x: -40`. Duration 220ms easeOut.

**Screen 1 — Welcome (step 0):**
- Content: Centered vertically, `px-6 pt-20 pb-8`.
- Decorative circle: `w-40 h-40 rounded-full bg-accent-soft`, inner `w-20 h-20 rounded-full bg-accent/20`.
- Heading: `text-display-md mb-3`. Text: "Find tutors who aced your exact course."
- Subtext: `text-muted-ink text-base`. Text: "Real students. Real grades. Real results."
- **Continue button** at bottom: `w-full h-14 rounded-lg bg-accent text-accent-foreground font-body font-semibold text-base`. Text: "Continue". Always enabled on this screen.

**Screen 2 — University Picker (step 1):**
- Content: `px-6 pt-12 pb-8`.
- Heading: `text-display-md mb-2`. Text: "Pick your university."
- Subtext: `text-muted-ink text-base mb-8`. Text: "We'll show you tutors and courses at your school."
- University cards (from `useUniversities()`): `motion.button whileTap={{ scale: 0.98 }}`. Each:
  - `w-full p-4 rounded-xl border text-left flex items-center gap-4 transition-colors`.
  - Selected: `border-accent bg-accent-soft`. Unselected: `border-hairline bg-surface`.
  - Left: Color bar `w-1 h-10 rounded-full` with `backgroundColor: uni.color` (inline).
  - Center: `font-display font-medium text-base` for short_name, `text-sm text-muted-ink` for full name.
- **Continue button:** `disabled` when no university selected (`disabled:opacity-40`).

**Screen 3 — Major & Year (step 2):**
- Content: `px-6 pt-12 pb-8`.
- Heading: `text-display-md mb-2`. Text: "What are you studying?"
- Subtext: `text-muted-ink text-base mb-6`. Text: "Pick your area of focus. You can change this later."
- **Major chips:** Flex-wrap of 10 pill buttons: "Computer Science", "Business", "Engineering", "Pre-med", "Economics", "Architecture", "Biology", "Mathematics", "Psychology", "Languages". `px-4 py-2.5 rounded-pill text-sm font-medium transition-colors`. Selected: `bg-accent text-accent-foreground`. Unselected: `bg-surface border border-hairline text-foreground`. Toggle on click (multi-select).
- **Year dropdown:** Label "Year" (`text-sm font-medium text-muted-ink mb-2`). `<select>` element. Options: "", "Freshman", "Sophomore", "Junior", "Senior", "Graduate".
- **Terms checkbox:** Same as Signup page — `text-xs text-muted-ink` with links to `/terms` and `/privacy`.
- **"Get started" button:** `disabled` when `!agreedTerms || saving`. Text: "Get started" or "Saving…".
- **Back button** below primary: `w-full mt-3 text-sm text-muted-ink`. Text: "Back". Decrements step.

**On finish (step 2 submit):**
1. Set `saving = true`.
2. `supabase.from("profiles").update({ role: "student", university_id, major, year, agreed_terms_at: now(), onboarded_at: now() }).eq("id", user.id)`.
3. Set selected university in `UniversityContext`.
4. Call `refreshProfile()` to reload profile in AuthContext.
5. Navigate to `/`.
6. On error: `console.error`.

---

## 3.4 Tutor Onboarding Flow

### 3.4.1 Tutor Onboarding

- **Route:** `/onboarding/tutor`
- **Entry points:** "I'm a tutor" button on Role Picker.
- **Auth guard:** Redirects to `/login` if not logged in.
- **Layout:** Same structure as Student Onboarding but with 4 progress dots.

**Screen 1 — Welcome (step 0):**
- Same decorative circle pattern but inner element is a rotated square (`w-16 h-16 rounded-xl bg-accent/20 rotate-12`).
- Heading: `text-display-md mb-3`. Text: "Teach what you've mastered."
- Subtext: "Help fellow students succeed and earn on your own schedule."

**Screen 2 — University Picker (step 1):**
- Heading: "Your university"
- Subtext: "We'll match you with students from your school."
- Same university cards as Student Onboarding.
- **Continue button:** Disabled if no university selected.

**Screen 3 — Course Selection (step 2):**
- Heading: `text-display-md mb-2`. Text: "Courses you can teach"
- Subtext: "Select courses and the grade you got."
- **Search input:** `pl-10 pr-4 py-3 rounded-lg border border-hairline bg-surface font-body text-sm`. Search icon (18px) absolutely positioned left. Placeholder: "Search courses…".
- **Selected courses list** (above search results, shown if any selected): Each course shown as:
  - `bg-accent-soft rounded-lg p-3`, flex row.
  - Course code: `text-sm font-medium`.
  - Grade selector: 5 pill buttons ("A", "A-", "B+", "B", "B-"). Active: `bg-accent text-accent-foreground`. Inactive: `bg-surface border border-hairline`. `text-xs px-2 py-1 rounded-pill font-medium`.
  - Remove button: X icon (14px).
- **Available courses list:** Scrollable, `max-h-52 overflow-auto`. Each: `motion.button whileTap={{ scale: 0.98 }}`, `w-full text-left p-3 rounded-lg hover:bg-muted`. Shows course code + name. Filtered by search query against `code` and `name`. Excludes already-selected courses.
- **Courses data:** From `useCourses(selectedUni)` — fetched from Supabase, filtered by selected university.
- **Continue button:** Disabled if `selectedCourses.length === 0`.

**Screen 4 — Rate & Bio (step 3):**
- Heading: `text-display-md mb-2`. Text: "Set your rate"
- Subtext: "You can adjust this anytime."
- **Rate display:** Centered `font-display text-5xl font-medium` + `text-muted-ink text-lg` "/hr". e.g. "$15/hr".
- **Rate slider:** `<input type="range" min={5} max={50}>`. `accent-accent`. Tick labels "$5" and "$50" below.
- **Bio textarea:** Label "Short bio" (`text-sm font-medium text-muted-ink`). `<textarea rows={3}>`, placeholder "Tell students what makes your sessions great…". `w-full p-3.5 rounded-lg border border-hairline bg-surface font-body text-sm resize-none`.
- **Terms checkbox:** Same as Student Onboarding.
- **"Start tutoring" button:** `disabled` when `!agreedTerms || saving`. Text: "Start tutoring" or "Saving…".

**On finish (step 3 submit):**
1. Set `saving = true`.
2. `supabase.from("profiles").update({ role: "tutor", university_id, bio, hourly_rate, agreed_terms_at: now(), onboarded_at: now() }).eq("id", user.id)`.
3. `supabase.from("tutor_courses").insert(courses.map(c => ({ tutor_id: user.id, course_id: c.courseId, grade: c.grade })))`.
4. Set university in context, refresh profile, navigate to `/tutor/requests`.

---

## 3.5 Student Dashboard Screens

All student dashboard screens are wrapped in `StudentLayout` (page transition + footer + bottom nav).

### 3.5.1 Discover Page (Student Home)

- **Route:** `/`
- **Entry points:** App load (for onboarded students); Discover tab in bottom nav; redirects from login/signup.
- **Layout:** `px-5 pt-14 pb-4`. Content scrolls above the fixed bottom nav.
- **Content:**
  1. **Header row** — Flex between:
     - Left: `font-display text-display-md`. Text: "Good {morning|afternoon|evening}, {firstName}". Time derived from `new Date().getHours()`: <12 = morning, <18 = afternoon, else evening. firstName from `profile.full_name.split(" ")[0]` or "there".
     - Right: Profile avatar `w-10 h-10 rounded-full`. Source: `profile.avatar_url` or fallback pravatar.
  2. **University pill** — `UniversityPill` component. Shows selected university short_name with colored dot. `whileTap={{ scale: 0.96 }}`. On click: opens `UniversitySwitcher`.
  3. **Search bar** (fake) — `motion.button whileTap={{ scale: 0.98 }}`. `w-full flex items-center gap-3 px-4 py-3.5 rounded-lg border border-hairline bg-surface`. Search icon (18px, muted) + placeholder text "Search courses, tutors, or codes…". On click: navigate to `/search`.
  4. **Popular courses section:**
     - Header: `font-display text-lg font-medium mb-3`. Text: "Popular courses at {uni.short_name}".
     - Horizontal scroll: `flex gap-3 overflow-x-auto pb-2 -mx-5 px-5`. Up to 8 course cards.
     - Each course card: `flex-shrink-0 w-[140px] bg-surface rounded-xl border border-hairline p-3.5`. Tap: `whileTap={{ scale: 0.97 }}`, navigate to `/course/{id}`.
       - Top: `w-full h-1` color bar, `backgroundColor: uni.color`.
       - Code: `font-display font-medium text-sm`.
       - Name: `text-xs text-muted-ink line-clamp-2`.
  5. **Top-rated tutors section:**
     - Header: "Top-rated tutors".
     - List: Up to 5 `TutorCard` components, sorted by `tutor_stats.rating` descending.
     - Hidden if no tutors.
  6. **Browse by subject section:**
     - Header: "Browse by subject".
     - 2-column grid, `gap-2.5`. One card per subject.
     - Each: `bg-surface rounded-xl border border-hairline p-4 flex items-center gap-3`. Subject icon (20px, mapped from a hardcoded dictionary) + subject name (`text-sm font-medium`). Tap: navigate to `/search?subject={subject}`.
     - Subject icons: Computer Science → Code, Mathematics → Calculator, Biology → FlaskConical, Chemistry → FlaskConical, Economics → DollarSign, Languages → Languages, Psychology → Brain, Engineering → Cpu, Architecture → PenTool, Business → BookOpen, Physics → Calculator, Humanities → BookOpen.
  7. **UniversitySwitcher** modal (see below).

**UniversitySwitcher subflow:**
- **Trigger:** Tapping the UniversityPill.
- **Backdrop:** Fixed inset, `bg-foreground/20`, z-50. Tap to close.
- **Sheet:** Fixed bottom, slides up. `bg-surface rounded-t-xl max-w-[440px] mx-auto`. Spring animation (damping 30, stiffness 300).
- **Handle:** Centered `w-10 h-1 rounded-full bg-hairline`.
- **Header:** "Choose your university" (display-xl) + close X button (rounded-xl, hover:bg-muted).
- **University list:** Same as onboarding cards but with a checkmark circle for selected. `w-5 h-5 rounded-full bg-accent` with SVG checkmark.
- **Action:** Sets university in `UniversityContext` (persists to localStorage) and closes.

---

### 3.5.2 Search Page

- **Route:** `/search`
- **Entry points:** Search tab in bottom nav; tapping fake search bar on Discover; "Browse by subject" cards (with `?subject=` query param).
- **Layout:** `px-5 pt-14 pb-4`.
- **Content:**
  1. **Search input** — Auto-focused. Search icon left, X clear button right (shown only when query non-empty). Value: initialized from `?subject=` URL param if present.
  2. **Filter row** — University pill + "Filters" button (SlidersHorizontal icon, `rounded-pill border border-hairline bg-surface text-sm font-medium`).
  3. **Filters panel** (collapsible, `AnimatePresence`):
     - `bg-surface rounded-xl border border-hairline p-4`.
     - **Price range:** Range slider, min $5 max $50. Label shows current range.
     - **Min rating:** 4 pill buttons: "Any" (0), "4+", "4.5+", "4.8+". Active: `bg-accent text-accent-foreground`. Inactive: `bg-muted`.
  4. **Tabs** — "All", "Courses", "Tutors", "Subjects". Active: `bg-foreground text-background`. Inactive: `text-muted-ink`. `rounded-pill text-sm font-medium`.
  5. **Results:**
     - **Courses section** (shown on "All" or "Courses" tab): Section header "COURSES" (uppercase, small, muted) on "All" tab. Course cards: `bg-surface rounded-xl border border-hairline p-4`. Shows code + name. Tap: navigate to `/course/{id}`. Capped at 4 on "All" tab, uncapped on "Courses" tab.
     - **Tutors section** (shown on "All" or "Tutors" tab): Section header "TUTORS". `TutorCard` list. Capped at 3 on "All" tab.
     - **No results state** (when query non-empty but both lists empty): Centered layout with accent-soft circle + Search icon (28px). "No results found" heading. "No tutors yet for that course. Be the first to request one." subtext.
  6. **UniversitySwitcher** modal.
- **Filtering logic:**
  - Courses filtered by: query matches `code`, `name`, or `subject` (case-insensitive).
  - Tutors filtered by: query matches `full_name` or `major`; hourly_rate within price range; rating ≥ minRating.
- **Backend:** `useCourses(selectedUniversity)`, `useTutors(selectedUniversity)`.

---

### 3.5.3 Sessions Page

- **Route:** `/sessions`
- **Entry points:** Sessions tab in bottom nav.
- **Layout:** `px-5 pt-14 pb-4`.
- **Content:**
  1. **Title** — `font-display text-display-md mb-5`. Text: "Sessions".
  2. **Tabs** — "upcoming" and "past" pill buttons. Active: `bg-foreground text-background`. Inactive: `text-muted-ink`.
  3. **Loading state:** Centered spinner.
  4. **Session cards** (list):
     - `bg-surface rounded-xl border border-hairline p-4`. `whileTap={{ scale: 0.98 }}`.
     - Tutor row: avatar (40px circle) + name (`font-display font-medium text-body`) + course code/name (`text-sm text-muted-ink`).
     - Date/time row: Calendar icon + formatted date ("Wed, Apr 12") + Clock icon + time ("14:00").
     - Bottom row: Location badge (`bg-accent-soft text-accent` for online with Video icon; `bg-muted text-foreground` for in-person with MapPin icon) + action button on upcoming tab only ("Join" for online, "Details" for in-person; `px-4 py-1.5 rounded-lg bg-accent text-accent-foreground text-sm font-medium`).
  5. **Empty state:** Centered layout. Accent-soft circle with Calendar icon (28px). "No sessions yet" heading. Contextual subtext based on tab.
- **Backend:** `useSessions(user.id, profile.role)` → `supabase.from("sessions").select("*, tutor:profiles!sessions_tutor_id_fkey(full_name, avatar_url), student:profiles!sessions_student_id_fkey(full_name, avatar_url), course:courses(code, name)").eq(column, userId).order("date", desc)`.

---

### 3.5.4 Student Profile Page

- **Route:** `/profile`
- **Entry points:** Profile tab in bottom nav.
- **Layout:** `px-5 pt-14 pb-4`.
- **Content:**
  1. **Profile header** — Centered column:
     - Avatar: `w-20 h-20 rounded-full mb-3`.
     - Name: `font-display text-xl font-medium mb-1`.
     - University pill: Inline style with `uni.color + "15"` background and `uni.color` text.
     - "Edit profile" button: `px-4 py-2 rounded-lg border border-hairline text-sm font-medium`. `whileTap={{ scale: 0.96 }}`. **Currently non-functional.**
  2. **Menu list** — `bg-surface rounded-xl border border-hairline divide-y divide-hairline`. 8 rows:
     - **My university** — GraduationCap icon, shows uni short_name on right. No action.
     - **Saved tutors** — Heart icon. **Non-functional.**
     - **Payment methods** — CreditCard icon. **Non-functional.**
     - **Notifications** — Bell icon. **Non-functional.**
     - **Switch to tutor mode** — ArrowRightLeft icon, `text-accent`. Action: calls `supabase.from("profiles").update({ role: "tutor" })`, refreshes profile, navigates to `/tutor/requests`.
     - **Help & support** — HelpCircle icon. **Non-functional.**
     - **About** — Info icon. **Non-functional.**
     - **Sign out** — LogOut icon, `text-destructive`. Action: calls `signOut()` (Supabase `auth.signOut()`), navigates to `/welcome`.
  - Each row: `motion.button whileTap={{ scale: 0.98 }}`, `h-14 px-4`. Icon (20px) + label (`text-sm font-medium`) + optional sublabel (`text-xs text-muted-ink`) + ChevronRight (16px, muted).

---

## 3.6 Tutor Dashboard Screens

All tutor dashboard screens are wrapped in `TutorLayout` (same structure as StudentLayout, different tab items).

### 3.6.1 Tutor Requests Page

- **Route:** `/tutor/requests`
- **Entry points:** Requests tab in bottom nav; redirect from `/` for tutor role; redirect after tutor onboarding; redirect after switching to tutor mode.
- **Layout:** `px-5 pt-14 pb-4`.
- **Content:**
  1. **Title** — `font-display text-display-md mb-5`. Text: "Requests".
  2. **Loading state:** Centered spinner.
  3. **Request cards** (filtered to `status === "pending"` only):
     - `motion.div layout` (animates when items are removed). `bg-surface rounded-xl border border-hairline p-4`.
     - Student row: avatar (40px) + name (`font-display font-medium text-body`) + course code/name.
     - Message: `text-sm text-muted-ink mb-3 leading-relaxed`. Full message text.
     - Details row: Calendar + date, Clock + time, location badge (Video/MapPin icon + text).
     - **Accept button:** `flex-1 h-11 rounded-lg bg-accent text-accent-foreground font-medium text-sm`. Check icon + "Accept". `whileTap={{ scale: 0.96 }}`.
     - **Decline button:** `flex-1 h-11 rounded-lg border border-hairline text-muted-ink font-medium text-sm`. X icon + "Decline". `whileTap={{ scale: 0.96 }}`.
     - **Accept action:** `useUpdateRequest().mutate({ id, status: "accepted" })` → `supabase.from("requests").update({ status: "accepted" }).eq("id", id)`. Invalidates "requests" query cache.
     - **Decline action:** Same but `status: "declined"`.
  4. **Empty state:** "All caught up!" heading. "No pending requests right now." subtext.
- **Backend:** `useRequests(user.id, "tutor")` → `supabase.from("requests").select("*, student:profiles!...(full_name, avatar_url), tutor:profiles!...(full_name, avatar_url), course:courses(code, name)").eq("tutor_id", userId).order("created_at", desc)`.

---

### 3.6.2 Tutor Schedule Page

- **Route:** `/tutor/schedule`
- **Entry points:** Schedule tab in bottom nav.
- **Layout:** `px-5 pt-14 pb-4`.
- **Content:**
  1. **Title** — `font-display text-display-md mb-5`. Text: "Schedule".
  2. **Subtitle** — `text-sm text-muted-ink mb-4`. Text: "This week's booked sessions".
  3. **Schedule grid** — Horizontal scroll (`overflow-x-auto -mx-5 px-5 pb-4`). Inner flex container `min-w-[500px]`.
     - 7 columns (Mon–Sun), equal width.
     - Column header: day name (`text-xs font-medium text-muted-ink text-center mb-2`).
     - 9 time slots per column (9:00–17:00). Each slot: `text-xs text-center py-2 rounded-lg font-medium`.
       - Booked: `bg-accent text-accent-foreground`. Shows time text.
       - Empty: `bg-muted text-muted-ink`. No text (empty string).
  - **Note:** Currently uses hardcoded static data, NOT connected to Supabase sessions.
- **Backend:** None (static data). TODO: wire to real sessions query.

---

### 3.6.3 Tutor Earnings Page

- **Route:** `/tutor/earnings`
- **Entry points:** Earnings tab in bottom nav.
- **Layout:** `px-5 pt-14 pb-4`.
- **Content:**
  1. **Title** — `font-display text-display-md mb-5`. Text: "Earnings".
  2. **Monthly total card** — `bg-surface rounded-xl border border-hairline p-6 text-center mb-6`.
     - Label: `text-sm text-muted-ink mb-1`. Text: "This month".
     - Amount: `font-display text-4xl font-medium`. Text: "${totalThisMonth}" (sum of completed sessions in current month).
  3. **Loading state:** Centered spinner below total card.
  4. **Recent sessions list** (completed only, up to 10):
     - Header: `font-display text-base font-medium mb-3`. Text: "Recent sessions".
     - `bg-surface rounded-xl border border-hairline divide-y divide-hairline`.
     - Each row: Student name (`text-sm font-medium`) + course code + date on left; `+$amount` right-aligned in `font-display font-medium text-success`.
  5. **Empty state:** "No completed sessions yet. Your earnings will appear here."
- **Backend:** `useSessions(user.id, "tutor")`. Filters to `status === "completed"` client-side. Calculates monthly total by filtering on current month/year.

---

### 3.6.4 Tutor Profile Settings Page

- **Route:** `/tutor/profile`
- **Entry points:** Profile tab in tutor bottom nav.
- **Layout:** `px-5 pt-14 pb-4`.
- **Content:**
  1. **Profile header** — Centered column:
     - Avatar: `w-20 h-20 rounded-full mb-3`.
     - Name: `font-display text-xl font-medium` + BadgeCheck icon if verified.
     - University pill (same inline style as student profile).
     - Major/year: `text-sm text-muted-ink`.
  2. **Stats card** — Same 3-column layout as public tutor profile. Shows "—" for rating, "0" for sessions, current hourly_rate.
  3. **Menu list** — 4 rows:
     - **Edit profile** — Settings icon. **Non-functional.**
     - **Switch to student mode** — ArrowRightLeft icon, `text-accent`. Action: updates `role: "student"`, refreshes profile, navigates to `/`.
     - **Help & support** — **Non-functional.**
     - **Sign out** — `text-destructive`. Same as student sign out.

---

## 3.7 Shared Components

### 3.7.1 TutorCard

Used on: Discover, Search, Course Detail.

- `<Link to="/tutor/{id}">` wrapping a `motion.div whileTap={{ scale: 0.98 }}`.
- `bg-surface rounded-xl border border-hairline p-4 flex gap-3.5`.
- **Left column:** Avatar `w-12 h-12 rounded-full object-cover`.
- **Center column:**
  - Name line: `font-display font-medium text-body` + BadgeCheck icon (15px, accent) if verified.
  - Subtext: `text-sm text-muted-ink`. "{major}, {year}".
  - Course pills: Up to 3 shown + "+N" overflow pill. `text-xs px-2 py-0.5 rounded-pill bg-muted`.
  - Rating line (if >0): Star icon (13px, accent filled) + rating + "· {count} reviews".
- **Right column:** Rate `font-display font-medium text-body` "$rate" + "/hr" in caption.
- **Data shape:** Accepts Supabase profile with joined `tutor_stats` and `tutor_courses[].course`.

### 3.7.2 UniversityPill

Pill-shaped button: colored dot (2px circle) + university short_name + down-chevron SVG. `rounded-pill bg-surface border border-hairline text-sm font-body font-medium`. `whileTap={{ scale: 0.96 }}`. Reads from `useUniversities()` and `UniversityContext`.

### 3.7.3 UniversitySwitcher

Bottom sheet modal (documented in Discover flow above).

### 3.7.4 Footer

Always-visible thin bar with Privacy/Terms links. Mounted in: Welcome, Login, Signup, StudentOnboarding, TutorOnboarding, StudentLayout, TutorLayout.

---

# Part 4 — Data Flow Summary

## 4.1 Supabase Query Hooks

All defined in `src/hooks/useSupabaseQuery.ts`. Each wraps a Supabase query with React Query.

| Hook | Query | Stale Time | Used By |
|------|-------|-----------|---------|
| `useUniversities()` | `universities.*` ordered by short_name | 1 hour | Onboarding, Discover, Search, Profile pages, Pill, Switcher |
| `useCourses(uniId?)` | `courses.*` filtered by university, ordered by code | 30 min | Onboarding, Discover, Search |
| `useCourse(id)` | `courses.* WHERE id = ?` single | default | Course Detail |
| `useSubjects(uniId)` | Distinct `courses.subject` for university | default | Discover |
| `useTutors(uniId?)` | `profiles.* WHERE role=tutor` + joined `tutor_stats`, `tutor_courses(*, course:courses(*))` | default | Discover, Search |
| `useTutor(id)` | Single profile + stats + courses | default | Tutor Profile |
| `useTutorsByCourse(courseId)` | `tutor_courses WHERE course_id` + joined `tutor:profiles(*, tutor_stats(*))` | default | Course Detail |
| `useReviews(tutorId)` | `reviews WHERE tutor_id` + joined student profile + course | default | Tutor Profile |
| `useSessions(userId, role)` | `sessions WHERE tutor_id/student_id` + joined profiles + course | default | Sessions, Earnings |
| `useRequests(userId, role)` | `requests WHERE tutor_id/student_id` + joined profiles + course | default | Tutor Requests |

## 4.2 Mutation Hooks

| Hook | Action | Invalidates |
|------|--------|-------------|
| `useUpdateRequest()` | Update request status | "requests" |
| `useCreateReview()` | Insert review | "reviews", "tutor" |
| `useCreateSession()` | Insert session | "sessions" |
| `useUpdateSession()` | Update session status | "sessions" |
| `useUpdateProfile()` | Update profile fields | "profile", "tutors" |
| `useSetTutorCourses()` | Delete + re-insert tutor_courses | "tutors" |

---

# Part 5 — Not Yet Implemented

These features are shown in the UI but are non-functional stubs:

| Feature | Location | Current State |
|---------|----------|---------------|
| Edit profile | Student Profile, Tutor Profile Settings | Button exists, no action |
| Saved tutors | Student Profile | Menu row, no action |
| Payment methods | Student Profile | Menu row, no action |
| Notifications | Student Profile | Menu row, no action |
| Help & support | Both Profiles | Menu row, no action |
| About | Student Profile | Menu row, no action |
| Book a session (real) | Tutor Profile Page | Sets local state only, no Supabase write |
| File/avatar upload | All profiles | Uses placeholder URLs |
| Real-time messaging | — | Not built |
| Password reset | Login page | No "Forgot password" link in UI |
| Email notifications | — | Not built |
| Tutor schedule (real data) | Tutor Schedule | Static hardcoded data |
| Admin dashboard | — | Not built |

---

*End of specification.*
