# Theme switcher + accessible light theme

## What you get
- A round toggle button in the top-right of the header on every screen size (desktop: after "Resume PDF"; mobile: right edge of the header bar).
- Switching **to light**: the sun rises along an arc from the lower-left into the centre, while the moon sets from the centre down to the lower-right.
- Switching **to dark**: the opposite — the moon rises from the lower-left and the sun sets to the lower-right.
- Icons: Sun and Moon (lucide). With "reduce motion" turned on, the icons simply crossfade.
- Dark stays the default. Your choice is remembered on that device, and the page never flashes the wrong theme on load.
- Accessible label ("Switch to light theme" / "Switch to dark theme"), keyboard friendly, visible focus ring.

## Light theme palette (WCAG checked)
The dark cyan #62F4E0 is unreadable on white (about 1.4:1), so light mode uses deeper versions of the same hues.

| Role | Colour | Contrast on background |
|---|---|---|
| Background | #F6F7FB (cool paper) | — |
| Surface / cards | #FFFFFF with #E3E6EE border | — |
| Text | #0E1220 | ~17:1 (AAA) |
| Muted text | #4A5266 | ~7.4:1 (AAA) |
| Accent (cyan → deep teal) | #0A7C72 | ~5.2:1 (AA text) |
| Secondary (violet) | #5B45D6 | ~6.3:1 (AA text) |
| Focus ring | #0A7C72, 2px | ≥3:1 (AA UI) |

- Shadows: glows become soft, slate-tinted drop shadows (low opacity), with only a faint teal tint on primary buttons — glow on white looks muddy and reduces contrast.
- Hero grid, scroll ribbon, gradient frame CTA and halo all use the same tokens, so they adapt automatically; grid lines use a light slate tint.
- Tags/pills: tinted teal/violet backgrounds at ~10% with full-strength text so labels stay ≥4.5:1.

## Stories (TDD, tests first)
1. **Theme state** — read/save preference, apply `light`/`dark` class on the page root, pre-paint script to avoid flash. Tests: default dark, toggle flips class, choice persists, invalid saved value ignored.
2. **Light tokens** — add light values in the stylesheet; audit hard-coded dark-only styles (gradient frame background, halo, ribbon, header blur). Test: contrast helper asserts each pair above meets its target ratio.
3. **Theme toggle button** — sun/moon arc animation with Motion, reduced-motion fallback, label/aria-pressed. Tests: label changes, click switches theme, both icons rendered during transition.
4. **Header placement** — top right on all breakpoints; check the mobile dock and command palette still look right in both themes. Visual check in preview at desktop and mobile in both themes.

## Technical notes
- Tokens: keep current values as dark under `.dark`/`:root`, add a `.light` block; Tailwind `dark` custom variant already exists.
- Pre-paint inline script in the root head reads stored theme; React reads it in an effect (no hydration mismatch).
- New feature slice `features/theme-toggle`; arc motion via Motion `x`/`y`/`rotate` keyframes inside an `overflow-hidden` circle.
- Record in AGENTS.md: theme is a root class toggled by the theme-toggle feature; all colours via tokens.
