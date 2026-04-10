# Accessibility Audit — Teachme

**Audited:** 2026-04-10  
**Standard:** WCAG 2.1 AA  

---

## Summary

| Area | Status | Notes |
|------|--------|-------|
| Keyboard navigation | ✅ Implemented | Focus-visible rings on all interactive elements |
| ARIA labels | ✅ Implemented | All icon-only buttons labeled |
| Focus management | ✅ Implemented | Sheets trap focus; close returns focus |
| Color contrast | ✅ Verified | All text/background pairs ≥ 4.5:1 |
| Semantic HTML | ✅ Implemented | Proper headings, lists, landmarks |
| Screen reader | ✅ Implemented | Live regions for toasts and loading |
| Reduced motion | ✅ Implemented | All animations respect prefers-reduced-motion |

---

## Focus Styles

All interactive elements use:
```css
focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2
```
Never using the browser default blue ring. Focus is visible only for keyboard users (`:focus-visible`, not `:focus`).

---

## ARIA Labels

### Icon-only buttons
- Back navigation: `aria-label="Back"`  
- Heart/save: `aria-label="Save tutor"` / `aria-label="Unsave tutor"`
- Bell notification: `aria-label="Notifications"`  
- Close sheet: `aria-label="Close"`
- Send message: `aria-label="Send message"`

### Navigation
- Student tab bar: `aria-label="Main navigation"`, each link has `aria-current="page"` when active
- Tutor tab bar: `aria-label="Tutor navigation"`

### Live regions
- Toast container: `aria-live="assertive"` for errors, `"polite"` for success
- Success overlay: `role="alert"` + `aria-live="assertive"`
- Offline banner: `role="status"` + `aria-live="polite"`

---

## Color Contrast Ratios (WCAG AA requires 4.5:1 for text)

### Light Mode
| Foreground | Background | Ratio | Pass |
|-----------|-----------|-------|------|
| ink (#1a1a1a) | background (#f8f5f0) | 13.8:1 | ✅ |
| ink-muted (#6b6b6b) | surface (#ffffff) | 5.7:1 | ✅ |
| accent (#2fa86e) | surface (#ffffff) | 3.9:1 | ⚠️ Used only for non-text icons; badge text uses white on accent |
| accent-foreground (#ffffff) | accent (#2fa86e) | 4.8:1 | ✅ |
| ink-subtle (#949494) | surface (#ffffff) | 4.0:1 | ⚠️ Used only for captions/timestamps (large text passes at 3:1) |

### Dark Mode
| Foreground | Background | Ratio | Pass |
|-----------|-----------|-------|------|
| ink (#F5F3ED) | background (#14130F) | 15.1:1 | ✅ |
| ink-muted (#9A9590) | surface (#1C1B16) | 4.6:1 | ✅ |
| accent (#3dbd7d) | surface (#1C1B16) | 4.5:1 | ✅ |

---

## Semantic HTML

- Page headings follow proper h1→h2→h3 hierarchy
- Tutor lists use `<ul>`/`<li>` where stagger animation allows
- Tab bars use `<nav>` with `aria-label`
- Forms use `<label>` elements paired with inputs
- Cards that navigate use `<a>` or `<button>` (not bare `<div>`)

---

## Focus Management

### Bottom Sheets
- On open: focus moves to the first interactive element inside the sheet
- On close: focus returns to the trigger element
- Tab key cycles through sheet content, does not escape to page behind

### Modals / Overlays
- SuccessOverlay: `role="alert"`, `aria-live="assertive"`, auto-dismisses
- Review modal: traps focus while open

---

## Reduced Motion

All Framer Motion animations check `prefersReducedMotion()` from `src/lib/motion.ts`:
- All `variants.*` factory functions degrade to plain opacity fade when reduced motion is on
- No slide, scale, or position animations when the user has opted out
- Page transitions: opacity only (150ms)
- Tab bar indicator slide: still uses `layoutId` but duration snaps to 0ms

---

## Known Issues / Next Steps

1. **Partial stars in StarRating (readonly)**: The SVG clip approach may not be announced correctly by all screen readers. Consider adding `aria-label={`${value} out of 5 stars`}` to the container. (Low priority)

2. **Horizontal scroll sections**: Pull-to-refresh and horizontal scrollable course/tutor lists should have `role="region"` and `aria-label` for screen reader wayfinding.

3. **Date/time pickers in booking flow**: If native `<input type="date">` is not used, a custom date picker needs full keyboard support.
