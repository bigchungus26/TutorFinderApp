# Tutr Design System

## Philosophy

Warm, academic, confident, student-first. The interface should feel like a well-organized study space — clean and focused, never cluttered. We use generous whitespace, a restrained color palette, and a serif display font to convey trust and approachability. Every element earns its place.

---

## Colors

All colors are defined as CSS custom properties in `src/index.css` and mapped to Tailwind classes in `tailwind.config.ts`. Never use raw hex/rgb values in components.

| Token | CSS Variable | Tailwind Class | Value | Use For | Don't Use For |
|-------|-------------|----------------|-------|---------|---------------|
| background | `--background` | `bg-background` | hsl(40 33% 97%) — warm cream | Page backgrounds | Card fills |
| surface | `--surface` | `bg-surface` | hsl(0 0% 100%) — white | Cards, sheets, inputs | Page backgrounds |
| surface-elevated | `--surface-elevated` | `bg-surface-elevated` | hsl(0 0% 100%) | Modals, floating panels | Regular cards |
| ink | `--ink` | `text-ink` | hsl(0 0% 10%) — near-black | Primary text, headings | Decorative elements |
| ink-muted | `--ink-muted` | `text-ink-muted` | hsl(0 0% 42%) | Secondary text, labels | Headings |
| ink-subtle | `--ink-subtle` | `text-ink-subtle` | hsl(0 0% 58%) | Placeholders, tertiary info | Body text |
| hairline | `--hairline` | `border-hairline` | hsl(40 20% 90%) | Borders, dividers | Text |
| accent | `--accent` | `bg-accent` / `text-accent` | hsl(152 60% 42%) — green | CTAs, active states, links | Warnings, errors |
| accent-soft | `--accent-soft` | `bg-accent-soft` | hsl(152 50% 93%) | Tinted backgrounds behind accent | Primary buttons |
| accent-foreground | `--accent-foreground` | `text-accent-foreground` | white | Text on accent backgrounds | — |
| success | `--success` | `text-success` | hsl(155 46% 33%) | Earnings, confirmations | CTAs |
| warning | `--warning` | `text-warning` | hsl(38 92% 50%) | Alerts, attention items | CTAs |
| danger | `--danger` | `text-danger` / `bg-danger` | hsl(0 84% 60%) | Errors, destructive actions | Information |
| uni-aub | `--uni-aub` | `text-uni-aub` | hsl(0 100% 27%) — maroon | AUB chips/dots only | Backgrounds |
| uni-lau | `--uni-lau` | `text-uni-lau` | hsl(220 100% 32%) — navy | LAU chips/dots only | Backgrounds |
| uni-ndu | `--uni-ndu` | `text-uni-ndu` | hsl(157 80% 24%) — forest | NDU chips/dots only | Backgrounds |

### University colors

University colors come from the database (`uni.color` field). They are applied via inline `style={{ backgroundColor: uni.color }}` since they're dynamic. Use them for:
- Small indicator dots (2-3px)
- Course card top accent bars
- University chip backgrounds at 10% opacity (`uni.color + "15"`)

Never use them for full section backgrounds or text on white.

---

## Typography

Typography is defined as CSS utility classes in `src/index.css`. Use one class per element — the class sets font-family, size, line-height, weight, and tracking.

| Token | Class | Font | Size/Line | Weight | Tracking | Use For |
|-------|-------|------|-----------|--------|----------|---------|
| display-xl | `.text-display-xl` | Fraunces | 36/44 | 500 | -0.02em | Hero headings, splash |
| display-lg | `.text-display-lg` | Fraunces | 28/36 | 500 | — | Page titles (Privacy, Terms, Login) |
| display-md | `.text-display-md` | Fraunces | 22/30 | 500 | — | Section headers, dashboard titles |
| display-sm | `.text-display-sm` | Fraunces | 18/26 | 500 | — | Card section titles, subsection heads |
| body-lg | `.text-body-lg` | Inter | 16/24 | 400 | — | Large body text, feature descriptions |
| body | `.text-body` | Inter | 15/22 | 400 | — | Default body text, names in cards |
| body-sm | `.text-body-sm` | Inter | 14/20 | 400 | — | Secondary body text, descriptions |
| label | `.text-label` | Inter | 13/18 | 500 | — | Form labels, small headings |
| caption | `.text-caption` | Inter | 12/16 | 500 | 0.01em | Timestamps, badges, tab labels |

### Rules
- Never combine `text-display-*` with additional `font-display`, `font-medium`, or `leading-*` — the token includes all of it.
- `font-display` and `font-body` classes are still available for one-off overrides but prefer the composite tokens.
- Don't use arbitrary Tailwind sizes like `text-[22px]`. If a new size is needed, define a token.

---

## Spacing

We use Tailwind's default 4px grid. Allowed spacing values:

| Class suffix | Pixels | Use For |
|---|---|---|
| 1 | 4px | Tight gaps (icon-to-text) |
| 2 | 8px | Inner padding, small gaps |
| 3 | 12px | Card inner padding, list gaps |
| 4 | 16px | Standard padding, section gaps |
| 5 | 20px | Page side padding (`px-5`) |
| 6 | 24px | Large padding, page margins |
| 8 | 32px | Section spacing |
| 10 | 40px | Large section gaps |
| 12 | 48px | Page top padding |
| 16 | 64px | Hero spacing |
| 20 | 80px | Empty state padding |
| 24 | 96px | Bottom nav clearance (`pb-24`) |

### Rules
- Avoid odd values like `p-7`, `gap-9`, `mb-11`. If you need them, reconsider the layout.
- Page content uses `px-5 pt-14 pb-4` consistently.
- Bottom navigation clearance is always `pb-24`.

---

## Radius

| Token | CSS Variable | Tailwind Class | Value | Use For |
|-------|-------------|----------------|-------|---------|
| radius-sm | `--radius-sm` | `rounded-sm` | 8px | Small inputs, inner elements |
| radius-md | `--radius-md` | `rounded-md` | 14px | Buttons, inputs, chips |
| radius-lg | `--radius-lg` | `rounded-lg` | 20px | Cards, panels |
| radius-xl | `--radius-xl` | `rounded-xl` | 28px | Sheets, modals, tab bar |
| radius-full | `--radius-full` | `rounded-pill` | 999px | Chips, avatars, pill buttons |

### Rules
- Cards always use `rounded-xl`.
- Buttons use `rounded-lg`.
- Avatars use `rounded-full`.
- Pill chips use `rounded-pill`.
- Never use arbitrary radii like `rounded-[12px]`.

---

## Shadows

| Token | CSS Variable | Tailwind Class | Value | Use For |
|-------|-------------|----------------|-------|---------|
| shadow-none | — | `shadow-none` | none | Default for everything |
| shadow-float | `--shadow-float` | `shadow-float` | `0 8px 32px rgba(20,20,20,0.08)` | Bottom tab bar, modals only |
| shadow-press | `--shadow-press` | `shadow-press` | `inset 0 1px 2px rgba(20,20,20,0.12)` | Pressed/active states |

### Rules
- **Almost never use shadows.** Cards use `border border-hairline`, not shadows.
- `shadow-float` is reserved for the bottom tab bar and modal overlays.
- If you think you need a shadow, use a border instead.

---

## Motion

Not in Tailwind config — used via Framer Motion props.

| Token | Value | Use For |
|-------|-------|---------|
| duration-fast | 150ms | Hover/focus state changes |
| duration-base | 220ms | Page transitions, element entry |
| duration-slow | 320ms | Sheet open/close, large transitions |
| ease-standard | `cubic-bezier(0.2, 0, 0, 1)` | Most transitions |
| ease-emphasized | `cubic-bezier(0.2, 0, 0, 1.2)` | Playful entrance (slight overshoot) |

### Rules
- `whileTap={{ scale: 0.98 }}` for large touchable areas (cards, buttons).
- `whileTap={{ scale: 0.96 }}` for small touchable areas (chips, pills).
- `whileTap={{ scale: 0.92 }}` for icon-only buttons (tab bar items).
- Page transitions use `duration: 0.22` with `easeOut`.

---

## Component Conventions

### Cards
- Always: `bg-surface rounded-xl border border-hairline p-4`
- Never: shadows, background gradients, colored borders
- Interactive cards add `whileTap={{ scale: 0.98 }}`

### Buttons (Primary CTA)
- Always: `h-14 rounded-lg bg-accent text-accent-foreground font-body font-semibold text-base`
- Full-width in mobile: add `w-full`
- Disabled: `disabled:opacity-40`
- Loading: show a spinner + "Loading…" text

### Form Inputs
- Always: `p-3.5 rounded-md border border-hairline bg-surface font-body text-sm`
- Focus: `border-accent ring-2 ring-accent/20` (browser default is fine)
- Error: `border-danger` with caption-sized error text below

### Bottom Tab Bar
- Container: `bg-surface rounded-xl shadow-float border border-hairline`
- Active tab: `text-accent`
- Inactive tab: `text-muted-ink`
- Label: `.text-caption`

### Empty States
- Centered layout with accent-soft circle icon container
- Heading in `text-display-sm`
- Description in `text-body-sm text-ink-muted`

---

## Do's and Don'ts

**Do:**
- Use `border border-hairline` for visual separation between cards
- Use `text-accent` for interactive text (links, active states)
- Use `bg-accent-soft` for selected/highlighted states
- Use semantic color names (`text-ink-muted`, not `text-gray-500`)
- Use typography tokens (`text-display-md`, not `font-display text-xl font-medium`)

**Don't:**
- Use box shadows on cards — use hairline borders
- Use raw hex colors — everything goes through CSS variables
- Use arbitrary Tailwind values (`text-[17px]`, `bg-[#eee]`) — define a token
- Mix typography classes — one `text-*` token per element
- Use Tailwind's default color palette (`gray-500`, `blue-600`) — use semantic tokens
- Put university colors on large surfaces — they're for dots and chips only
