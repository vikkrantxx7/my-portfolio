# Portfolio

A server-rendered, content-driven portfolio for presenting professional experience, selected projects, engineering notes, and a resume. The site is built as a responsive single-page home experience with shareable project and blog pages, accessible navigation, dark/light themes, and an installable offline shell.

## Get started

This repository uses [Bun](https://bun.sh/) and the committed `bun.lock` file.

```sh
git clone <repository-url>
cd <repository-directory>
bun install --frozen-lockfile
bun run dev
```

Vite prints the local development URL when the server starts. To check changes before publishing:

```sh
bun run lint
bun run test
bun run build
bun run preview
```

Other useful commands are `bun run test:watch`, `bun run test:coverage`, and `bun run format`. Formatting and linting use Biome; tests use Vitest, jsdom, and Testing Library. Use `bun run test` rather than `bun test`, which starts Bun's own test runner and ignores the Vitest configuration.

## What the site does

- **Home (`/`)** — profile hero, strengths and metrics, project gallery, career timeline, engineering notes, and contact links.
- **Projects (`/projects/:slug`)** — evidence-backed case studies with architecture diagrams, sources, and previous/next navigation.
- **Blog (`/blog`, `/blog/:slug`)** — registered MDX articles with tag filtering, reading metadata, and article sharing metadata.
- **Resume** — opens an in-app viewer with HTML/PDF fallback, zoom controls where needed, paper/dark viewing modes, and PDF download.
- **Navigation and discovery** — responsive section navigation, a command palette (`Ctrl+K` / `⌘K`), browser-history-aware scroll restoration, and shareable achievement links.
- **Preferences and offline use** — persistent light/dark theme and a production-only service worker for cached app assets.

The site is driven by typed local content; it does not use a database or require a backend API.

## Documentation

- [Functional guide](docs/functional-guide.md) — page behavior and user journeys.
- [Technical guide](docs/technical-guide.md) — architecture, data/content pipelines, routing, testing, and deployment.
- [Template guide](TEMPLATE.md) — rebranding, resume synchronization, and adding content.
- [Route conventions](src/routes/README.md) — TanStack file-based routing rules.
- [Documentation maintainer skill](.github/skills/documentation-maintainer/SKILL.md) — instructions for updating docs on demand.

## Technology

| Area                   | Implementation                                                          |
| ---------------------- | ----------------------------------------------------------------------- |
| Application            | React 19, TypeScript, TanStack Start and TanStack Router                |
| Rendering and bundling | SSR with Vite and Nitro                                                 |
| Styling                | Tailwind CSS 4, component-local CSS, CSS variables/themes               |
| Content                | Typed TypeScript data and MDX, compiled with shared Vite/Vitest options |
| UI and interaction     | Radix UI, Lucide, Motion, TanStack Form, React Query                    |
| Validation and tests   | Repository content validators, Vitest, Testing Library, jsdom           |
| Quality and CI         | Biome, Bun, GitHub Actions                                              |
| Offline support        | `vite-plugin-pwa` with a generated Workbox service worker               |

## Repository map

```text
src/
  content/       Site identity, typed portfolio data, blog and case-study MDX
  routes/        Home, project, blog, sitemap, and root routes
  features/      User-facing behavior such as search, theme, filters, and resume
  widgets/       Page sections and composed experiences
  shared/        Reusable UI primitives and browser utilities
  components/ui/ Radix-based UI building blocks
public/          Resume exports, icons, fonts, and web app manifest
docs/            Functional and technical documentation
.github/skills/  Repository-level agent skills
```

## Content and template use

To rebrand the portfolio, begin with `src/content/data.ts` and `src/content/site.ts`. Replace the resume and public icons under `public/`, review `public/robots.txt`, and update the artwork mappings and MDX registrations where appropriate. Personal details are intentionally centralized under `src/content/`; a content test guards against leaking those details into other source files.

See [TEMPLATE.md](TEMPLATE.md) for the full rebranding checklist, shared resume facts, and step-by-step case-study authoring guide. The project is connected to Lovable; commits pushed to the connected branch synchronize there, so keep that branch in a working state and do not rewrite published history.

## Contributing

Follow the repository guidance in `AGENTS.md` and any nested `AGENTS.md` files before changing code. Add or update tests alongside behavior changes, run the focused test plus lint and build checks as appropriate, and use the documentation maintainer skill when a code change affects documented behavior or architecture.
