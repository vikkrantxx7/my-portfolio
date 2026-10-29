# Make the portfolio a reusable template

Goal: anyone can rebrand the site by editing only `src/content/`, and the lightning navigation can be reused on any nav bar. No visual change to your site.

## Story T1 — Site config in one place

Add a typed `site` config (site URL, name, short name, tagline, SEO title/description, social banner, favicon) next to the existing profile data, checked by `validateContent`.

ACs
- No personal name, email, avatar or domain appears outside `src/content/` (checked by a test that scans source files).
- Page titles, descriptions, canonical URLs, sitemap URLs, JSON-LD and the contact aria-label all read from config.
- Changing the site URL in config changes every canonical/og:url.

## Story T2 — Configurable theme colours

Move brand colours (both themes) into documented token blocks at the top of the stylesheet with a short "how to rebrand" comment; the dark/light palettes stay token-driven.

ACs
- Every brand colour is defined once per theme; no component uses a raw brand hex (except the resume viewer controls, which are intentionally fixed).

## Story T3 — Reusable lightning navigation

Generalise the header energy effect so it is not tied to the avatar or `#section` links.

ACs
- Accepts a container plus a resolver (default: elements marked `data-energy-target="<key>"`) and an active key.
- Site nav keeps identical behaviour; existing tests stay green.
- A new test renders it in a plain tab bar to prove independence.
- Geometry module has no DOM or site imports.

## Story T4 — Component styles live with their components

Move component-only CSS (lightning nav, dock ignition, scroll progress, gradient-frame CTA, theme-toggle transitions, glow halo) out of the global stylesheet into a stylesheet beside each component, imported by that component.

ACs
- The global stylesheet keeps only tokens, theme blocks, base rules and shared utilities.
- Each moved component's styles live in its own folder, so copying the folder copies its look.
- Visual output unchanged in both themes and with reduced motion (Playwright screenshot comparison before/after).

## Story T5 — Template guide

Add a `TEMPLATE.md`: which files to edit, how to swap avatar/banner/resume PDF, how to run tests.

## Technical notes

- New `src/content/site.ts` + types; `pageUrl` reads `site.url`.
- Header energy moves its target lookup behind a prop; `site-nav` passes its existing selectors via data attributes.
- TDD per story; record the config rule in `AGENTS.md`.
