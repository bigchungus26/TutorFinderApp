# Master Prompt — Legal, SEO & Security Hardening

You are auditing and hardening this application for production. Work through every section below in order. Before touching code, read the project structure, the framework in use, the auth system, the database layer, and the deployment target. Adapt file paths, route syntax, and ORM calls to match this project's stack — do not assume FastAPI, Next.js, Express, or any specific framework unless you've confirmed it. At the end, produce a single report listing what you found, what you fixed, and what remains.

## Global constraints (apply to every section):

- Do not break existing functionality.
- Do not add third-party analytics, tracking pixels, or cookie banners unless explicitly required.
- Do not commit secrets. If you find any, flag them immediately and stop.
- Every fix must be verified with a concrete test before moving on.
- If a section doesn't apply to this project (e.g. no payments, no webhooks), say so explicitly in the report and skip it — don't fabricate work.

---

## 1. Legal pages — Privacy Policy & Terms of Use

Create two public, no-auth pages: `/privacy` and `/terms`. Match the app's existing visual style (fonts, colors, spacing, card treatment) — read the existing templates first and mirror them. Do not invent a new design system.

**Privacy Policy must cover:** who we are and contact email; exact data collected (account, profile, usage, payment, communications); why each category is collected; retention periods; who data is shared with (list every third party: payment processor, email provider, hosting, analytics if any); GDPR and CCPA rights (access, correct, delete, export, withdraw consent) with the email to exercise them; cookie usage (session only vs tracking); security measures (TLS, password hashing, DB location); policy change notification; contact.

**Terms of Use must cover:** acceptance; what the service is; user responsibilities; payment and billing terms if applicable; cancellation and refund policy; limitation of liability with a maximum liability cap; acceptable use (no scraping, no reverse engineering, no unlawful use, no accessing other users' data); termination; governing law and jurisdiction; contact.

**Registration consent:** add a required checkbox on the signup form linking to `/terms` and `/privacy`. Server-side, reject registration if the checkbox is not checked. Add a timestamp column `agreed_terms_at` on the user model and populate it on registration. Run the migration.

**Footer links:** add Privacy and Terms links to the footer of every page — landing, auth pages, and logged-in pages.

**Verify:** `/privacy` and `/terms` load without login; registration fails without the checkbox; `agreed_terms_at` is saved; footer links work on every page.

---

## 2. AI discoverability — llms.txt, robots.txt, sitemap.xml, meta tags

Create `/llms.txt` as a plain-text file served at the root. Include: one-line description, what the product does, who it's for, pricing model, key features, geographic coverage, contact email, and a short "alternatives we're better than" section. This is what ChatGPT, Claude, and Perplexity will read when users ask about this category of product.

Create `/robots.txt` allowing public routes (`/`, `/privacy`, `/terms`, `/llms.txt`, landing) and disallowing authenticated routes (`/admin`, `/auth`, any user dashboard paths). Include a `Sitemap:` line.

Create `/sitemap.xml` listing every public page with `changefreq` and `priority`.

**Landing page `<head>`:** add meta description, meta keywords, Open Graph tags (`og:title`, `og:description`, `og:url`, `og:type`), `meta robots=index,follow`, and `<link rel="canonical">`.

All three files must be publicly accessible with zero authentication. Verify each URL returns the correct content type (`text/plain`, `text/plain`, `application/xml`).

---

## 3. Security audit — mass assignment & privileged fields

This is the highest-priority section. The vulnerability: routes that blindly apply user-submitted data to database models, letting users modify fields they should never be able to touch (billing status, credit balance, role, commission rates, platform fees, internal IDs, etc.).

**Step 1 — Inventory.** Read every model file. For each model, list every field that should be read-only to end users. Typical candidates: anything related to billing, balances, fees, payouts, Stripe/payment processor IDs, role, permissions, `is_active`, `is_admin`, internal foreign keys that determine ownership, audit timestamps, and any field set by webhooks or background jobs.

**Step 2 — Create `security/field_allowlists.py`** (or the equivalent for this stack). Define explicit allowlist sets for every user-writable resource — one set per role per resource. Include a `filter_fields(data, allowlist)` helper that returns only keys present in the allowlist and silently drops everything else.

**Step 3 — Audit every write route.** Read every POST/PUT/PATCH handler in the project. Find and fix these dangerous patterns:

- `for k, v in data.items(): setattr(obj, k, v)`
- `Model(**request_data)` without filtering
- `model.update(request.json)` or `Object.assign(model, body)`
- Pydantic/Zod schemas that include privileged fields
- Any ORM `update()` call fed directly from request body

Replace each with: `safe = filter_fields(data, ALLOWLIST)` then apply only `safe`. No exceptions.

**Step 4 — IDOR checks.** Every route that fetches a resource by ID must verify ownership in the same query: `WHERE id = ? AND owner_id = current_user.owner_id`. If the resource doesn't match, return 403 (not 404 — but don't leak existence either; 403 or 404 consistently). Audit every `GET /resource/:id`, `PATCH`, `DELETE`, and any nested route.

**Step 5 — Row-level security.** If using Supabase, Postgres RLS, or similar: verify policies exist for every table, covering SELECT/INSERT/UPDATE/DELETE per role. RLS controls which rows a user sees; the application layer controls which columns they can write. Both layers are required. If RLS policies are missing or unrun, write them and apply them.

**Verify with concrete tests:**

- POST to a settings endpoint with a privileged field in the body (e.g. `credit_balance=99999`, `role=admin`, `is_active=true`) — confirm it's silently dropped.
- GET another user's resource by guessing their ID — confirm 403.
- PATCH another user's resource — confirm 403.
- Confirm no route in the codebase uses blind `setattr`, spread operators, or `**data` on raw user input.

---

## 4. Auth hardening

- Rate limit login, registration, and password reset. Max 10 attempts per IP per 15 minutes. Return 429 after that.
- Password hashing: confirm bcrypt, argon2, or scrypt. Reject if plain text, MD5, SHA1, or unsalted SHA256 is used anywhere.
- Session tokens / JWTs: must be `httpOnly`, `Secure`, `SameSite=Lax` or `Strict`. JWTs must be signed with a secret from environment variables, never hardcoded.
- Password requirements: minimum 8 characters server-side enforced.
- Account enumeration: login and password-reset responses must not reveal whether an email exists. Use a generic "if this email exists, we've sent a reset link" message.
- Logout must actually invalidate the session server-side, not just clear the client cookie.

---

## 5. Webhook signature validation

For every incoming webhook endpoint (Stripe, WhatsApp/Meta, Twilio, GitHub, etc.):

- Read the raw request body before any parsing.
- Verify the signature header using `hmac.compare_digest` or the provider's official SDK (`stripe.Webhook.construct_event`, etc.).
- On failure, return 403 and do nothing else — no logging of the payload, no partial processing.
- The webhook secret must come from environment variables.

Test each webhook endpoint with an invalid signature and confirm rejection.

---

## 6. Secrets, environment & repository hygiene

### In the repo:

- Confirm `.env`, `.env.local`, `.env.production`, `*.pem`, `*.key`, `credentials.json`, `service-account*.json` are all in `.gitignore`.
- Run `git log -p | grep -iE "(api[_-]?key|secret|password|token|bearer)"` across history. If any secret was ever committed, flag it in the report with the commit hash — the user must rotate that secret immediately even if it's been removed from the current tree.
- Confirm `.env.example` exists with placeholder values documenting every required variable.
- Check `package.json`, `requirements.txt`, `pyproject.toml`, `Cargo.toml` for hardcoded URLs with embedded credentials.

### GitHub:

- Confirm the repo is private if it should be.
- Enable Dependabot alerts and secret scanning (document the steps if you can't do it yourself — you likely can't via code).
- Add a `.github/workflows/` CI job that runs tests on every PR if one doesn't exist.
- Add branch protection recommendation to the report: require PR review, require status checks, block force-push to main.
- Check for a `SECURITY.md` with a contact for vulnerability reports. Create one if missing.

### Vercel / deployment platform:

- Every secret must live in the platform's environment variables UI, not in the repo. List every env var the app reads and confirm each is set in the deployment target.
- Confirm production and preview environments have separate secrets where it matters (especially Stripe — test keys for preview, live keys for production only).
- Confirm `NODE_ENV=production` or equivalent is set in production.
- **Security headers:** add `Strict-Transport-Security`, `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: strict-origin-when-cross-origin`, and a basic `Content-Security-Policy`. On Vercel this goes in `vercel.json` under `headers`. On Next.js, use `next.config.js` `headers()`. Adapt to the actual stack.
- Confirm HTTPS is enforced and HTTP redirects to HTTPS.
- Confirm the custom domain has a valid certificate.

### Database:

- Database connection string must come from env vars, never hardcoded.
- Production database must not be publicly accessible from `0.0.0.0/0` — restrict to the deployment platform's IPs or use a connection pooler.
- Confirm backups are enabled on the hosting provider.

---

## 7. Input validation & output safety

- Every user input field has server-side length limits and type validation.
- File uploads: validate MIME type and magic bytes, enforce a max size, store outside the webroot or on object storage with randomized filenames, never trust the client-provided filename.
- All user-generated content rendered in HTML is escaped by the template engine — confirm no `dangerouslySetInnerHTML`, `v-html`, `|safe`, `{{{ }}}`, or equivalent on untrusted data.
- All database queries use parameterized queries or an ORM — no string concatenation into SQL anywhere. Grep for it.
- Redirects after login, password reset, etc. must validate the target URL is same-origin to prevent open redirect attacks.

---

## 8. Final report

Produce a single report at the end with these sections:

1. **Vulnerabilities found** — every issue discovered, tagged Critical / High / Medium / Low, with file path and line number.
2. **Fixes applied** — every change made, grouped by section, with file paths.
3. **Verification results** — the concrete test results for each section's verification checklist.
4. **Remaining risks** — anything that couldn't be fixed in code (needs dashboard config, needs secret rotation, needs manual GitHub settings, needs a paid plan feature) with clear instructions for the user to complete it themselves.
5. **Recommended next steps** — prioritized list of follow-ups beyond this audit's scope.

---

**Begin now.** Start by reading the project structure and identifying the stack, then work through sections 1–8 in order.
