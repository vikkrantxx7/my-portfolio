# Technical guide

## Architecture at a glance

This is a static-content portfolio application, not a database-backed product. React components render typed content from `src/content/`; TanStack Start provides server rendering and file-based routing; Vite and Nitro build the server and client output. The site has no authentication flow or runtime API dependency.

```text
src/content (typed data + registered MDX)
                  |
                  v
TanStack file routes -> page widgets -> shared UI/features
          |                 |
          +---- head/SEO ---+---- SSR HTML and client navigation
                                   |
                            Vite + Nitro build
                                   |
                         client assets + server output
```

### Source layout

| Path                 | Responsibility                                                                     |
| -------------------- | ---------------------------------------------------------------------------------- |
| `src/routes/`        | Root shell, home, project/blog pages, sitemap route                                |
| `src/content/`       | Site identity, portfolio data/types, validation, article and case-study registries |
| `src/features/`      | Reusable interactions with behavior-focused tests                                  |
| `src/widgets/`       | Composed page sections and page-specific navigation                                |
| `src/shared/ui/`     | Shared components such as docks, prose, headings, and form controls                |
| `src/shared/lib/`    | SEO helpers, reduced-motion handling, scroll and progress utilities                |
| `src/components/ui/` | Radix-based primitives                                                             |
| `src/styles.css`     | Global tokens, theme variables, base rules, and component CSS imports              |
| `public/`            | Static resume assets, app icons, manifest, and self-hosted fonts                   |

Features and widgets follow a simplified Feature-Sliced Design. Reusable UI primitives belong in `src/shared/ui`; component-specific CSS stays next to the component and is imported by the global stylesheet for SSR styling.

## Runtime and routing

The router is created in `src/router.tsx` with a fresh TanStack Query client, intent-based route preloading, and the shared scroll-restoration policy. The generated `src/routeTree.gen.ts` is build output and must not be edited manually. See [route conventions](../src/routes/README.md) before adding a route. Test files co-located in `src/routes/` (`*.test.*`) are excluded from route generation by `routeFileIgnorePattern` in `vite.config.ts`.

`src/routes/__root.tsx` provides the HTML shell, theme pre-paint script, shared head content, query provider, command palette, error/not-found boundaries, and post-hydration service-worker import. `src/server.ts` wraps the TanStack Start server entry and normalizes catastrophic SSR errors into the project's HTML error page.

Each public route makes an explicit sitemap decision with route `staticData`. Dynamic project and blog URLs are enumerated from the same registered content collections used to render those pages. Public canonical and Open Graph URLs are built by `pageUrl()` from `src/content/site.ts`, not from a request origin, so previews do not change public identity.

The sitemap includes `lastmod` for blog articles from their `publishedAt` frontmatter only. Project entries intentionally have no modification date because the content model does not provide a verified one.

## Content model and authoring

### Typed portfolio content

`src/content/data.ts` exports a `Content` object defined by `src/content/types.ts`. It includes profile data, snapshot, experience and achievements, projects and their case-study summaries, skills, and engineering-lab entries. Project artwork lives in the separate `src/content/project-artwork.ts` mapping and has light/dark asset URLs.

`validateContent()` checks project slug uniqueness, required repository references, diagram edge targets, unique experience/achievement IDs, valid project references, and lab-to-achievement references. `validateDiagram()` checks that every edge points to an existing diagram node. Content tests call these validators so content problems fail the test suite.

Personal/site identity is intentionally centralized in `src/content/`. Edit `src/content/data.ts` and `src/content/site.ts` when rebranding; `TEMPLATE.md` documents the assets to replace and resume consistency steps.

### Case studies

The typed project summary and architecture diagram are defined alongside project data. Long-form bodies are MDX under `src/content/case-studies/` and are explicitly imported and registered in `src/content/case-study-bodies.ts` by project slug. `validateMdxCaseStudy()` requires an HTTPS repository, a status, and non-empty repository-relative evidence sources.

The project detail widget renders the MDX body through shared `Prose` components and supplies the project's typed diagram. Keep the existing headings (Overview, System design, Decisions, Implementation, Results and learnings), include `<Diagram />` under System design, and cite verifiable repository files. If no body is registered, the typed-section fallback remains available.

### Blog articles

Blog MDX lives under `src/content/blog/`. Each post is registered in `src/content/blog.ts` with frontmatter and display/share cover assets. `validateBlogFrontmatter()` checks title, description, ISO date, positive reading time, and tags. That registry is the source for article lookup, tag lists, command-palette items, and sitemap URLs.

### MDX compilation

`mdx.config.ts` exposes one MDX plugin/options source shared by Vite and Vitest. `src/content/mdx-options.ts` configures YAML frontmatter, GitHub-flavored Markdown, and build-time Shiki highlighting with light and dark themes. It pins `development: false` to ensure SSR bundles use React's production JSX runtime. Do not rely on the Vite plugin's mode-dependent default.

Code blocks render through the shared `Prose` code-block component, which provides theme-aware highlighting and copy behavior. No runtime syntax highlighter is shipped to the browser.

## Important feature behavior

- **Audio lifecycle:** `createAudioEngine()` encapsulates one audio element, analyser graph, and subscription set in a closure. `useAudioEngine` retains the instance in a ref and reads its live `state` getter through `useSyncExternalStore`; snapshots retain their identity until a media-state update. `AudioEngine` is the factory's inferred return type, not a class.
- **Audio spectrum:** The audio engine uses a 2048-point FFT with 0.45 analyser smoothing. `src/features/audio-player/spectrum.ts` groups bins by the context's actual sample rate into 24 logarithmic bands from 60 Hz to 16 kHz (limited by Nyquist), mirrored across the 48 radial bars. Band averages use a contrast curve rather than saturating gain; fast attack and shorter decay preserve frequency differences. Rendering stays in DOM refs, and reduced motion keeps bars static.
- **Project filtering:** `src/features/filter-projects/` validates search parameters and applies pure matching to featured projects. Query-only navigation preserves existing hashes and disables both reset-scroll and automatic hash scrolling.
- **Achievement deep links:** `src/features/deep-link/` resolves known IDs only. The disclosure feature owns independent open state per achievement; hash updates replace history and avoid automatic router scrolling.
- **Theme:** `src/features/theme-toggle/` applies the root `dark`/`light` class, persists the choice, synchronizes browser chrome, and gates view transitions on support and reduced-motion preference.
- **Resume:** `src/features/resume-viewer/` encapsulates the dialog, HTML/PDF/image fallback, mobile zoom, independent document tone, and PDF download.
- **Service worker:** `src/features/pwa/register-sw.ts` is the only registration entry point. The worker is generated by `vite-plugin-pwa`; registration is blocked for dev, iframe, preview-host, and `?sw=off` contexts.
- **SEO:** `src/shared/lib/seo.ts` owns stable public URLs and Person JSON-LD. Route modules supply title, description, canonical, Open Graph, and article metadata as applicable.
- **Scroll restoration:** `src/shared/lib/scroll-restoration.ts` pairs the SSR inline restoration script with router-level navigation and Back/Forward restoration.

Preserve these invariants when changing the related features. The [root AGENTS.md](../AGENTS.md) contains repository-wide rules, cross-feature contracts, and an index of scoped guidance. Read applicable nested files before editing within their scope; also consult the relevant area's guidance when changing its callers or shared dependencies. Keep each detailed rule in its owning scope rather than copying it into the root.

## Styling and UI conventions

Tailwind CSS 4 is configured through the Lovable TanStack Vite configuration. Global CSS owns design tokens, dark/light themes, base styles, and shared utilities. Component CSS is colocated and imported at the top of `src/styles.css` to make styles available during SSR.

Shared UI variants use `class-variance-authority` (`cva`). Docks share `DockPosition`, `DockBar`, `DockIcon`, and `DockShell` from `src/shared/ui/dock-shell.tsx`; page widgets own destinations while shared shells own positioning and presentation. Consult the [shared UI guidance](../src/shared/ui/AGENTS.md) when composing or changing docks.

Use TanStack Router `Link` for internal navigation. Form state uses TanStack Form and shared context-bound fields/submit controls. Avoid adding another form-state stack or hand-rolling a parallel navigation pattern.

## Local development and commands

Install the exact lockfile with:

```sh
bun install --frozen-lockfile
```

| Command                 | Purpose                                       |
| ----------------------- | --------------------------------------------- |
| `bun run dev`           | Start the Vite development server             |
| `bun run build`         | Create the production client and server build |
| `bun run build:dev`     | Build using Vite's development mode           |
| `bun run preview`       | Preview a production build locally            |
| `bun run lint`          | Run `biome check .`                           |
| `bun run format`        | Apply Biome formatting and fixes              |
| `bun run test`          | Run the Vitest suite once                     |
| `bun run test:watch`    | Run Vitest interactively                      |
| `bun run test:coverage` | Run Vitest with V8 coverage                   |

Run tests through the package script (`bun run test`), not `bun test`: the latter starts Bun's native test runner, which ignores `vitest.config.ts` and fails without jsdom, the setup file, the MDX plugin, and Vitest-only mock APIs. Configure IDE test runs to use the `test` script or a Vitest run configuration.

Vitest uses jsdom in the `vmThreads` pool, `src/test/setup.ts` (which also polyfills browser globals missing from the VM context), and the same MDX plugin as the app. Tests live alongside the corresponding feature/widget/content and are selected from `src/**/*.{test,spec}.{ts,tsx}`. Prefer Testing Library assertions about rendered behavior. Route/widget tests can use `src/test/render-with-router.tsx`.

In development, Vite proxies `/__l5e/*` (Lovable CDN assets such as artwork and audio) to the public origin from `src/content/site.ts`, so asset URLs that are same-origin in production also resolve on localhost.

The project guidance expects tests for stories and behavior changes. Run the focused test while iterating, then lint and build when changes affect source/configuration. CI runs lint, coverage, and build.

## Build and deployment

`vite.config.ts` composes `@lovable.dev/vite-tanstack-config`, the shared MDX plugin, and PWA generation. The Lovable configuration supplies TanStack Start, React, Tailwind, Nitro, and environment integration; do not duplicate those plugins manually. Its bundled `vite-tsconfig-paths` plugin is removed from the resolved config in favor of Vite's native `resolve.tsconfigPaths`. Relative imports reachable from `vite.config.ts` (including `mdx.config.ts` and the `src/content` modules it loads) use explicit `.ts` extensions for compatibility with Vite's native config loader. The server entry is `src/server.ts`. Nitro is configured by the preset with Cloudflare as its default target; deployment should match the hosting environment's adapter/output requirements.

The build produces client and server output under generated directories (ignored by Git). `vite-plugin-pwa` generates `dist/client/sw.js` and precaches configured assets. A deploy should serve the client assets and route requests through the generated server output. Update `src/content/site.ts` and `public/robots.txt` to the final public origin before publishing; canonical links, share URLs, and sitemap identity use that configured origin.

GitHub Actions (`.github/workflows/ci.yml`) installs with the frozen Bun lockfile, verifies the pinned agentic-wiki lock, runs Biome, Vitest with coverage, and builds. Pull requests and pushes to `main` run the workflow.

## Extending the site

### Add a route

Create a route module in `src/routes/` using TanStack file-based naming. Add the appropriate `staticData.sitemap` decision and route-level SEO metadata. If adding a dynamic content page, source its sitemap entries from the same public content registry used to render it; do not invent modification dates.

### Add a project

Add the project summary and typed case-study data to `src/content/data.ts` (or its existing case-study module), validate the diagram, add the slug's light/dark artwork mapping, then add an MDX body and registry entry when long-form content is needed. See [TEMPLATE.md](../TEMPLATE.md) for detailed frontmatter and section requirements.

### Add a blog post

Create an MDX file under `src/content/blog/` with title, description, `publishedAt`, `readingMinutes`, tags, and cover metadata; add display and 1200×630 share image assets; import and register the post in `src/content/blog.ts`. Run the content tests and inspect the index, article, and tag-filter behavior.

### Update a resume

Keep shared facts consistent with `src/content/data.ts`, update `public/resume.html` and `public/resume.pdf` together, and regenerate/review the PDF separately. The automated test covers selected shared HTML facts; the PDF check is narrower and does not guarantee all PDF content matches. Follow the checklist in [TEMPLATE.md](../TEMPLATE.md).

## Documentation maintenance

Use the [documentation maintainer skill](../.github/skills/documentation-maintainer/SKILL.md) when a user requests documentation updates or when implementation work changes a documented route, user flow, architecture boundary, content process, command, or deployment assumption. Keep the README as the entry point and the functional and technical guides as the detailed references; avoid copying implementation-specific guidance into multiple documents.
