# Portfolio — Story Plan (Cinematic Interactive Resume)

Based on the shared ChatGPT concept: dark cinematic look, glowing accents, motion, a resume you can scan in 30 seconds and click into for depth, plus project case-study pages. Audience: recruiters and technical leaders.

## Things to decide before we build

1. **Framework**: The chat recommends Next.js. This project runs on TanStack Start (React 19, TypeScript, Vite). It gives us the same things the chat wanted: file-based pages, a separate page for each project, page metadata and server rendering. The plan uses TanStack Start.
2. **Stitches**: Stitches is no longer maintained (its authors stopped work on it in 2023, and the last release was 1.2.8). It also has known server-rendering problems with React 19. Using it next to Tailwind v4 would give us two styling systems that do the same job. My recommendation: use **Tailwind v4 + CSS variables + `cva` variants**. This gets us the Stitches-style typed variant API (`variants`, `compoundVariants`) without the risk. If you still want Stitches, Story 0 will set it up just for component variants.
3. **Content**: Placeholder data under the name Vikkrant Sharma; real experience, links and resume PDF to come.
4. **Ask Vikk AI assistant**: parked for a future phase.

Status: Stories 0–6 done. Story 6 uses the two resume-backed projects rather than inventing 3–5, with concept artwork, technology/domain URL filters, empty/reset states and working project overview destinations. Full case-study sections remain in Story 7. Story 5 achievement links remain compatible with query filters. Current resume achievements have no related project references; referenced projects link to Selected Work until Story 7 adds case-study pages.

## Design system (from the mockups)

- Colors: Void #080A0F, Surface #11151D, Electric cyan #62F4E0 (main highlight), Violet #9B87FF (secondary), Text #F4F6FA, Muted #9299AA
- Fonts: Geist for headings and body text, Geist Mono for small technical labels
- Motion: slow background effects done in CSS, quick feedback on clicks, springy reveals with Motion for React, and less motion for people who ask for it in their device settings
- Glow only on active elements, project artwork and a few hero details

## TDD approach (every story)

Red → Green → Refactor. We write Vitest + Testing Library tests first, using the acceptance criteria (ACs) below. Then we write the smallest amount of code that makes them pass, then tidy up. Content rules get unit tests against the typed data. A story is only done when its tests pass and the build is clean.

---

## Story 0 — Foundation and design tokens
- AC1: Color, font, spacing and glow tokens are defined in styles.css for the dark theme.
- AC2: Geist and Geist Mono fonts load. The page shows no placeholder.
- AC3: A typed content model exists (Profile, Experience, Achievement, Project, Skill), and placeholder data passes validation (unique IDs, project references that resolve).
- AC4: Base UI pieces have tested variants: Button (primary/ghost/glow), Tag, Section heading.
- AC5: The site title and description are set. No default "Lovable App" text remains.

## Story 1 — Site navigation shell
- AC1: A sticky top bar shows the name, Work, Experience, About and Resume PDF.
- AC2: Clicking a link scrolls to its section (instant scroll when reduced motion is on).
- AC3: The link for the section currently on screen is highlighted.
- AC4: On mobile, a menu button opens and closes an accessible menu (Esc closes it, focus stays inside the menu while it's open).

## Story 2 — Hero (01 / Intro)
- AC1: A full-height opening with the headline, a role line, and the buttons "Explore my work" and "Download resume".
- AC2: Animated grid and light background in CSS only, so it never stops content from appearing. It stays still when reduced motion is on.
- AC3: "Explore my work" scrolls to Selected Work, and "Download resume" downloads the PDF.

## Story 3 — Engineering snapshot (02)
- AC1: Shows the main strengths, key numbers (years of experience and similar) and problem areas, all from the content data.
- AC2: Numbers count up when they scroll into view. With reduced motion they show their final value right away.

## Story 4 — Career timeline with expandable achievements (04) — core feature
- AC1: A timeline of roles in time order (company, role, dates). Bullets are collapsed by default.
- AC2: Each bullet is a button with `aria-expanded`. Click, Enter and Space all toggle it.
- AC3: An opened bullet shows Context, Contribution, Decisions, Impact and related project links.
- AC4: A smooth spring animation when bullets open and close, with no animation when reduced motion is on.
- AC5: Several bullets can be open at once. Focus is clearly visible.

## Story 5 — Shareable deep links for achievements
- AC1: Opening a bullet updates the address to `#exp-<company>-<id>`, without adding a new entry to browser history on every click.
- AC2: Loading a URL that contains this link opens that bullet and scrolls to it.
- AC3: A "Copy link" button copies the link and shows a confirmation message.
- AC4: Unknown links are ignored and nothing breaks.

## Story 6 — Selected work: project gallery (03)
- AC1: 3–5 featured project cards, each with the problem, your role, the tech used and an "Open case study" link.
- AC2: Hovering adds depth and a glow, but no information appears only on hover.
- AC3: Filter by domain or technology without reloading the page. The filter is saved in the URL (`?tech=`). An empty result shows a message.

## Story 7 — Project case-study page (`/projects/$slug`)
- AC1: Sections: Overview, System design, Decisions, Implementation, Results and learnings, Links.
- AC2: Each project page has its own title, description and social preview tags.
- AC3: An unknown project address shows a "not found" page with a link back.
- AC4: Previous and next project links.

## Story 8 — Interactive architecture diagram
- AC1: Diagrams come from typed data (boxes and connections) and are readable even without animation.
- AC2: Hovering over or focusing a box highlights it and its connections. It works with the keyboard.
- AC3: Layers appear as you scroll, unless reduced motion is on.

## Story 9 — Engineering lab (05) and Contact (06)
- AC1: Lab cards for experiments and notes, coming from the content data.
- AC2: Contact shows Email (copy button plus a mailto link), LinkedIn and GitHub, with accessible labels.

## Story 10 — Command palette (progressive enhancement)
- AC1: ⌘K / Ctrl+K opens it, and Esc closes it.
- AC2: Searches sections, projects and achievements. Arrow keys move through results and Enter jumps to one.
- AC3: Every place it can reach is also reachable through the normal navigation.

## Story 11 — Resume PDF and SEO polish
- AC1: The resume PDF is served and linked from the nav and the hero.
- AC2: Sitemap, robots file, and structured data describing you as a person.
- AC3: Every page has its own title and description. Good Lighthouse accessibility, SEO and performance scores (target 90 or higher).

---

## Technical details
- Stack: TanStack Start v1, React 19, TypeScript, Tailwind CSS v4, Motion for React (`motion`), `class-variance-authority`, Vitest + @testing-library/react + user-event. All at their latest stable versions.
- Structure (simplified Feature-Sliced Design): `src/content` (typed data), `src/entities`, `src/features` (expand-achievement, filter-projects, deep-link, command-palette), `src/widgets` (hero, timeline, gallery, nav), `src/shared/ui`, and pages in `src/routes`.
- No database for the first version. All content is typed static data.
- Reduced-motion support goes through one shared `usePrefersReducedMotion` hook, and tests mock `matchMedia`.
