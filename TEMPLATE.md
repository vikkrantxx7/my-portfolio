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
  <button data-energy-target="a" data-energy-shape="pill">
    A
  </button>
  <button data-energy-target="b" data-energy-shape="circle">
    B
  </button>
  <HeaderEnergy active={current} navRef={ref} />
</div>;
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

## 7. Keeping the portfolio and resume in sync

### Shared facts, different depth

Treat `src/content/data.ts` as the reference for shared facts: name, professional title, email/profile links, company names, role titles, employment dates, years of experience and headline improvement metrics. Keep these facts identical in the portfolio and resume. The portfolio may expand on context, decisions and outcomes; resume bullets can be shorter and need not match word for word. Resume-only information, such as the phone number, education or certifications, does not need to appear on the homepage.

`public/resume.html` is the resume document source and `public/resume.pdf` is its downloadable export. They are not generated from `data.ts` automatically. If you maintain an external resume generator, update its source too, then bring both outputs into this project together.

### Update checklist

1. Update the shared facts in `src/content/data.ts`. For a new job, update the previous job's end date and add the new role newest first; review the professional title and years-of-experience figure at the same time.
2. Update the same facts in the resume HTML (or its external source). Preserve concise resume bullets; expand portfolio descriptions separately without changing the underlying numbers, dates or claims. Review related lab notes and case studies when an achievement changes.
3. Regenerate the PDF from the updated HTML using your existing export process. Replace `public/resume.html` and `public/resume.pdf` together. Do not leave a new preview paired with an old download.
4. Run `bunx vitest run src/content/resume.test.ts`, then `bun run test`. Fix factual mismatches rather than weakening the checks. When introducing a new shared metric, add a specific consistency check alongside the existing ones.
5. Open **View Resume** from the homepage and check the HTML preview. Download and open the PDF; review page breaks, contact links and the facts you changed. Publish only after both versions agree.

### What the checks cover

`src/content/resume.test.ts` compares the HTML's name, professional title, email and public profile links, company order, each role title and date range, years of experience, and the bundle/image/development-effort metrics against portfolio content. It accepts equivalent profile URLs with or without `www` or a trailing slash. Descriptive sentences are intentionally not compared.

The existing PDF check verifies its email link only; it does **not** prove all PDF text matches the HTML. PDF regeneration and the download review remain required manual steps. These checks detect drift; they do not automatically rewrite content or advance the years-of-experience number.
