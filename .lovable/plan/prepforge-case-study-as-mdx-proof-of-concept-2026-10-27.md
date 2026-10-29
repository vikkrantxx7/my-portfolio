# PrepForge case study as MDX (proof of concept)

Goal: render the PrepForge case study body from an MDX file while the page shell (back link, header, tech pills, diagram, pager, dock, SEO) stays identical. Other case studies keep the current typed data, so we can compare side by side.

## Stories

### M1 — MDX pipeline

- Add `@mdx-js/rollup` (with `remark-gfm`, `remark-frontmatter`, `remark-mdx-frontmatter`) to the Vite config, ordered before the React plugin.
- AC: an `.mdx` file imports as a React component in dev, SSR and build; a test renders a tiny fixture MDX.

### M2 — Frontmatter contract

- `src/content/case-studies/prepforge.mdx` carries frontmatter: `repository`, `status`, `sources[]`.
- Typed `MdxCaseStudy` + `validateMdxCaseStudy` (missing/invalid fields fail); `validateContent` covers it.
- AC: tests reject missing repository, empty sources, non-repo source paths.

### M3 — Shared prose components

- `src/shared/ui/prose/` maps `h2, h3, p, ul, ol, a, code, pre, blockquote, table` to site tokens (works in light and dark), internal links via TanStack `Link`.
- Custom embeds available in MDX: `<ArchitectureDiagram />` (existing widget, from the typed diagram) and `<Callout kind="decision|plan">` to keep "implemented vs planned" explicit.
- AC: tests for heading anchors, external links opening safely, internal links using the router, Callout labels.

### M4 — Wire into the project page

- Optional `body` (MDX component) on PrepForge; `ProjectDetail` renders MDX body when present, else existing sections.
- Content ported 1:1 from current PrepForge data (overview, architecture, decisions, implementation, results, sources) — no new claims.
- AC: PrepForge page shows the same headings/sections; other projects unchanged; SEO head unchanged; diagram connections still listed as text.

### M5 — Verify and record

- Playwright check of /projects/prepforge in both themes, desktop and mobile; offline cache still works.
- Record AGENTS.md rule (MDX case studies + validation), update roadmap.

## Out of scope

Blog section, syntax-highlighting theme (decide after POC), migrating other case studies.
