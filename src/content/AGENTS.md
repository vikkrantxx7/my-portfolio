# Content rules

- Typed static content passes `validateContent`; there is no database in v1.
- Project artwork is a separate typed mapping of concept illustrations, not product screenshots. Each entry carries `dark`/`light` CDN asset URLs chosen live via `useTheme` and shared by gallery cards and case studies.
- Case studies use typed repository-backed content, cite source files, and distinguish implemented features from plans or unverified outcomes.
- Architecture diagrams use typed layer/box/connection data checked by `validateDiagram`. Always list connections as text so diagrams read without hover or animation.
- Lab entries may reference a timeline achievement as `experienceId/achievementId`, checked by `validateContent`, and link to it via the deep-link hash.
- Author new case-study bodies in `case-studies/*.mdx`, register them in `case-study-bodies.ts`, and check frontmatter with `validateMdxCaseStudy`. Render through shared `Prose` components to preserve the page shell; summaries and diagrams stay typed, and projects without MDX retain typed sections.
- Blog MDX uses shared Prose and the case-study pipeline. `blog.ts` validates and registers posts for pages and search; search uses typed router destinations.
- Vite and Vitest share the compiler via `mdx.config.ts`. Its options in `mdx-options.ts` pin `development: false` so compiled MDX uses the production JSX runtime; never rely on the Rollup plugin's build-mode default, or production SSR crashes on `jsxDEV`.
- MDX code is Shiki-highlighted at build time with dual themes selected by the root class; no runtime highlighter ships.
- Resume content tests compare shared HTML facts, not prose. Re-export and review the PDF separately; only its email is tested.

These compilation and rendering contracts also apply when editing `mdx.config.ts` or widgets that render content.
