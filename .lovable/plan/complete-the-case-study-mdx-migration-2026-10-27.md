# Complete the case-study MDX migration

## Story 1 — git-contributor-stats in MDX

Move the remaining case study into `src/content/case-studies/git-contributor-stats.mdx`, using the same approach as PrepForge.

**Acceptance criteria**
- Preserve the existing overview, system design, decisions, implementation, results and source citations without inventing outcomes.
- Keep the current project page layout, architecture diagram, theme support, navigation and download-free reading experience.
- Keep the existing project address and SEO metadata unchanged.
- Register and validate the new MDX body; write and run tests before implementation.

## Story 2 — Future case studies follow the same pattern

Document MDX as the default authoring format for upcoming case studies.

**Acceptance criteria**
- The template guide explains where to add an MDX file, its required frontmatter, how to register it and how to include the existing diagram.
- Project summaries and typed architecture diagrams remain in the existing content layer.
- Existing typed-section fallback remains supported; no blog section or unrelated redesign is included.

## Technical details

- Reuse the existing MDX compiler, `caseStudyBodies` registry, frontmatter validator and shared `Prose` components.
- Update the architecture rule to make MDX the default while retaining the typed fallback.
- Test registration, valid metadata and coverage of every current project with a case study; run the existing rendering and content tests.
- Verify the git-contributor-stats page in the browser, including the diagram, citations and both themes.
