# Using this portfolio as a template

## 1. Your content (no code changes needed)
- `src/content/data.ts` — profile (name, monogram, email, links, avatar), snapshot, experience, projects, skills, lab notes.
- `src/content/site.ts` — public site URL (canonical links and sitemap), page titles/descriptions, theme colour.
- `src/content/case-studies/*.mdx` — long-form case-study bodies (the default for new studies).
- `src/content/case-studies.ts` — typed case-study data and architecture diagrams; also supports the legacy typed-section fallback.
- `src/content/project-artwork.ts` — illustration per project (images in `src/assets`).

`bun run test` checks your content (`validateContent`) and fails if your name, email, avatar or domain is still written anywhere outside `src/content/`.

## 2. Files to replace
- `public/resume.pdf` — your resume (file name shown on download comes from `profile.resumeFileName`).
- `public/favicon.png`, `public/icon-*.png`, `public/apple-touch-icon.png`, `public/manifest.webmanifest` — browser and installed-app icons/name.
- `src/assets/og-banner.jpg` — 1200x630 social share banner.
- `public/robots.txt` — update the sitemap URL to your domain.

## 3. Colours and fonts
All brand colours live in two blocks in `src/styles.css`: `:root` (dark, default) and `.light`. Fonts are imported at the top of that file.

## 4. Reusable effects
Effect styles live beside their components (e.g. `src/widgets/nav/header-energy.css`) and are pulled in at the top of `src/styles.css`.

The lightning hand-off works on any container:

```tsx
<div ref={ref}>
  <button data-energy-target="a" data-energy-shape="pill">A</button>
  <button data-energy-target="b" data-energy-shape="circle">B</button>
  <HeaderEnergy active={current} navRef={ref} />
</div>
```

## 5. Commands
`bun run test` · `bun run lint` · `bun run format` · `bun run build`

## 6. Adding a case study
1. Add the project summary to `src/content/data.ts` and its typed case-study data, including a validated architecture diagram, to `src/content/case-studies.ts`.
2. Create `src/content/case-studies/<project-slug>.mdx`. Use PrepForge or git-contributor-stats as a starting point. Required YAML frontmatter: `repository` (repository URL), `status`, and `sources` (each with a `label` and repository-relative `path`). Keep outcomes evidence-backed and separate implemented features from plans or unverified claims.
3. Write the body with the existing section headings: Overview, System design, Decisions, Implementation, and Results and learnings. Insert `<Diagram />` under System design; the page supplies the project's typed diagram automatically. Shared `Prose` components provide typography and theme support without changing the surrounding page.
4. Import the MDX default body and named `frontmatter` in `src/content/case-study-bodies.ts`, then register `{ Body, frontmatter }` under the exact project slug. Follow the existing entries for the frontmatter type conversion.
5. Run `bun run test` to check content, frontmatter and body registration, then open `/projects/<project-slug>` to review the page. The existing project address, navigation, citations and SEO shell are reused.

MDX is the default for upcoming case studies. Projects without a registered body still render their typed sections, so the fallback remains available.
