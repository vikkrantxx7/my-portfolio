import type { CaseStudy } from "./types";

export const prepforgeCaseStudy: CaseStudy = {
  repository: "https://github.com/vikkrantxx7/prepforge",
  status: "In development",
  overview: "An interview-preparation platform that organizes questions by technology and topic. Guests can browse the question bank; backend progress APIs support studying and completed states for signed-in users. A shared schema package keeps the web and API contracts aligned.",
  architecture: [
    { title: "Web · Next.js App Router", detail: "A React 19 frontend composes category and question sections into the landing page. Tailwind CSS 4 and reusable widgets structure the interface." },
    { title: "API · Fastify + GraphQL", detail: "Fastify registers REST modules for auth, categories, topics, questions and progress under /api/v1. Mercurius exposes schema-first GraphQL queries and a progress mutation." },
    { title: "Storage · PostgreSQL + Drizzle", detail: "Categories, topics, questions, users and user progress are modeled with Drizzle. Progress is keyed by user and question; structured answer tiers, hints and tags live alongside question content." },
    { title: "Contracts · Shared Zod schemas", detail: "A pnpm/Turborepo workspace contains apps/api, apps/web and packages/shared. Both applications consume shared validation schemas for questions, topics, users and progress." },
  ],
  decisions: [
    { title: "A flat learning hierarchy", detail: "Category → topic → tags avoids a separate subtopic layer. Studying and completed are explicit progress states; no progress record means unseen." },
    { title: "REST and schema-first GraphQL", detail: "REST endpoints expose resource operations while GraphQL lets the frontend request related topic, question and progress data through an explicit SDL contract." },
    { title: "Batch per-question progress", detail: "A GraphQL DataLoader batches progress lookups rather than resolving every question's progress in isolation." },
    { title: "Share validation across workspaces", detail: "Zod schemas are packaged separately from the applications, reducing duplicated definitions between the browser and API." },
  ],
  implementation: [
    "Modular Fastify registration, a health endpoint and centralized error handling for database and authentication failures.",
    "Drizzle schema and migrations for the content hierarchy, user records and question-level progress, with cascading progress foreign keys.",
    "GraphQL topic/question queries, user progress reads and a progress mutation backed by service modules and DataLoader.",
    "A Next.js landing page assembled from hero, category, recent-question and mobile-navigation widgets.",
    "Local PostgreSQL setup with Docker Compose and workspace scripts coordinated through Turborepo.",
  ],
  results: [
    "The repository contains backend REST and GraphQL layers, database migrations, shared schemas and frontend landing-page widgets.",
    "The handover records frontend authentication integration as unfinished. Backend auth code does not by itself establish a completed signed-in browser flow.",
    "Spaced repetition, offline/PWA support and deployment/observability goals are not presented here as shipped features.",
    "No production usage, performance or coverage measurements were verified. The main engineering takeaway is keeping shared contracts and per-question progress explicit as the product evolves.",
  ],
  sources: [
    { label: "Project README", path: "README.md" },
    { label: "Development handover", path: "HANDOVER.md" },
    { label: "API assembly", path: "apps/api/src/app.ts" },
    { label: "Database schema", path: "apps/api/src/db/schema.ts" },
    { label: "GraphQL resolvers", path: "apps/api/src/graphql/resolvers.ts" },
    { label: "Web landing page", path: "apps/web/src/app/page.tsx" },
  ],
};

export const gitStatsCaseStudy: CaseStudy = {
  repository: "https://github.com/vikkrantxx7/git-contributor-stats",
  status: "Package v2.2.0 · MIT",
  overview: "A Node.js CLI and importable TypeScript library that turns local Git history into contributor and activity analytics. It supports identity grouping, targeted repository filters, report output and charts without requiring a hosted analytics service.",
  architecture: [
    { title: "Input · Git history", detail: "The stats entry point resolves a repository, translates date/branch/author/path options into Git log arguments and parses the resulting commit records." },
    { title: "Analysis · Contributor aggregation", detail: "Dedicated analyzer and aggregator modules compute contributor totals, line changes, file activity, frequency summaries and a weekday-by-hour heatmap." },
    { title: "Output · Reports and charts", detail: "Separate output, report and chart modules format results. Chart generation includes contributor commits, net lines and activity heatmaps, with SVG and PNG options." },
    { title: "Interfaces · CLI and ESM library", detail: "Commander orchestrates command-line use. Package subpath exports expose stats, charts, reports, output and workflow functions to programmatic consumers." },
  ],
  decisions: [
    { title: "One analysis pipeline, two interfaces", detail: "The CLI calls the stats API before producing reports or charts. ESM subpath exports let consumers compose the same capabilities in their own tooling." },
    { title: "Normalize contributor identities", detail: "Grouping by email or name, aliases and similarity handling account for contributors whose commit identities differ across time or machines." },
    { title: "Make expensive work optional", detail: "Line counting can be disabled when commit-level analysis is sufficient. This is a configurable performance tradeoff, not a claimed benchmark." },
    { title: "Separate analysis from presentation", detail: "Git parsing, analytics, reports and charts are independent modules, so output formats do not dictate the core aggregation model." },
  ],
  implementation: [
    "Repository validation and configurable branch, date, author, merge and path filtering before analysis.",
    "Contributor grouping, alias handling, sorting and top-N limiting, plus additions/deletions and contributor file data.",
    "Monthly and weekly commit frequency maps and a 7 × 24 activity heatmap.",
    "Console output, report generation including HTML, and contributor/activity charts using Chart.js and chartjs-node-canvas.",
    "Optional GitHub Actions workflow generation, module-level tests and an end-to-end test suite in the repository.",
  ],
  results: [
    "The package manifest identifies version 2.2.0, MIT licensing, a CLI binary and modular ESM exports; its declared runtime is Node.js ≥20.19.5.",
    "The implemented pipeline supports reusable contributor analytics, reports and charts. Repository test files are evidence of testing infrastructure, not a verified coverage percentage.",
    "Single-owner file detection is implemented, but the numeric bus-factor score and candidate list remain placeholders in the analyzer. They are not claimed as calculated risk metrics.",
    "No adoption or runtime benchmark figures were verified. A useful engineering lesson is distinguishing measured analytics from unfinished derived metrics.",
  ],
  sources: [
    { label: "Project README", path: "README.md" },
    { label: "Package manifest", path: "package.json" },
    { label: "CLI orchestration", path: "src/cli/index.ts" },
    { label: "Stats API", path: "src/features/stats.ts" },
    { label: "Analytics implementation", path: "src/analytics/analyzer.ts" },
    { label: "Chart generation", path: "src/features/charts.ts" },
  ],
};