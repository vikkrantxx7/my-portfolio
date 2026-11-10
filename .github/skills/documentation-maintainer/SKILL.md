---

name: documentation-maintainer
description: Update this repository's README and functional/technical documentation when requested or when code changes make it stale.
---

# Documentation maintainer

Use this skill when the user asks to document the repository, update docs, or when a code change materially changes behavior or architecture described in the documentation.

## Sources of truth

- `README.md` is the concise project introduction, setup guide, command index, and documentation index.
- `docs/functional-guide.md` documents visitor-visible pages and behavior.
- `docs/technical-guide.md` documents architecture, content and build pipelines, invariants, development, and extension workflows.
- `TEMPLATE.md` is the detailed rebranding and resume-maintenance checklist.
- Source code, tests, package scripts, `AGENTS.md`, and nested `AGENTS.md` are authoritative when documentation conflicts with implementation.

## Workflow

1. Identify the user-requested scope and inspect the relevant implementation, tests, package scripts, and existing docs before editing. Search the codebase instead of guessing at behavior.
2. Read the root `AGENTS.md` and any nested `AGENTS.md` applicable to source files being changed. For documentation-only changes, follow the repository-level guidance and do not modify implementation unless explicitly requested.
3. Update the smallest relevant document set. Keep the README concise and link to details; put user journeys in the functional guide and architecture/maintenance detail in the technical guide. Update `TEMPLATE.md` only for template/rebranding workflows.
4. Describe observable, verified behavior. Distinguish current behavior from limitations, optional configuration, and future plans. Do not invent dependencies, environment variables, deployment steps, performance results, or feature availability.
5. Keep commands, paths, route examples, and file names aligned with the repository. Avoid duplicating detailed implementation instructions across files; use links to the canonical section.
6. When behavior or extension paths change, update adjacent docs in the same change. Preserve unrelated user edits and keep the diff focused.
7. Validate documentation links and code fences where practical. Run documentation checks if configured; otherwise skip application tests for documentation-only changes. For code changes, run the smallest relevant test and required lint/build checks.

## Style

- Use clear headings, short explanations, tables for route/command inventories, and examples only when they materially help contributors.
- Prefer repository-relative links for repository files.
- Never copy personal profile facts into general engineering documentation; keep identity and rebrandable content under `src/content/`.
- Do not create planning or changelog documents unless explicitly requested.
