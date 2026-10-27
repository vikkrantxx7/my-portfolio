# Using this portfolio as a template

## 1. Your content (no code changes needed)
- `src/content/data.ts` — profile (name, monogram, email, links, avatar), snapshot, experience, projects, skills, lab notes.
- `src/content/site.ts` — public site URL (canonical links and sitemap), page titles/descriptions, theme colour.
- `src/content/case-studies.ts` — long-form case studies and architecture diagrams.
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
