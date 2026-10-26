<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Rules
- Portfolio content is typed static data in `src/content` and must pass `validateContent` (no database in v1).
- Reusable UI primitives live in `src/shared/ui` with `cva` variants; features/widgets follow simplified Feature-Sliced Design.
- Every story ships with Vitest + Testing Library tests written first.
- Linting and formatting use Biome (`bun run lint` / `bun run format`); ESLint and Prettier were removed to keep one fast tool.
- Career roles are composed in the timeline widget; achievement disclosure state lives in the expand-achievement feature so multiple achievements can open independently. Use the shared reduced-motion hook to bypass Motion springs when requested.
- Achievement deep links use `#exp-<experienceId>-<achievementId>`, updated with `history.replaceState` (never push) via the deep-link feature; the disclosure trigger carries the hash id so native/router scrolling works, and unknown hashes resolve to null and are ignored.
- Project filters are validated TanStack search parameters with pure matching in the filter-projects feature; navigation preserves achievement hashes and scroll to keep both sharing flows compatible.
- Project artwork is a separate typed mapping of bundled concept illustrations, not product screenshots; case studies use typed repository-backed content, cite source files and distinguish implemented features from plans or unverified outcomes.
- Form state uses TanStack Form with reusable context-bound fields and submit controls in shared UI; no React Hook Form or resolver wrappers, to keep form contracts aligned with the TanStack stack.
- Query-only filter navigation disables both resetScroll and hashScrollIntoView; preserving a hash must not retrigger achievement scrolling.
- Internal navigation uses TanStack `Link` (never plain `<a href>`) so pages switch in-app without a full reload; tests render such widgets with `src/test/render-with-router.tsx`.
- Architecture diagrams are typed layer/box/connection data on each case study (checked by validateDiagram) and always list connections as text, so they read without hover or animation.
- Lab entries are typed content that may reference a timeline achievement as "experienceId/achievementId" (checked by validateContent) and link to it via the deep-link hash.
- Same-page lab achievement links dispatch an explicit reveal action and defer replaceState until scrolling settles; this avoids router hash scrolling cancelling smooth motion and supports repeated links to the same hash.
