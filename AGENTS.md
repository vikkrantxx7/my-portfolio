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
- Sitemap static URLs follow required route-level `staticData.sitemap` decisions; dynamic case studies use the same public content collection as their pages, with no invented modification dates.
- Public page identity uses the shared SEO URL helper for both leaf canonical and og:url tags, keeping previews from changing search identity and avoiding duplicate root canonicals.
- Social banner media uses a CDN asset pointer and the favicon uses a small local public image, keeping share media lightweight and browser icon discovery reliable.
- Section navigation replaces the hash with automatic scrolling disabled; on mobile, close the menu before measuring the scroll target and restore focus with preventScroll to avoid correction jumps.
- Shared section scrolling treats `top` as document offset zero rather than the hero element, so return-to-top actions also clear scroll progress.
- Document scroll is restored by the SSR inline script; skip only the first client restoration callback to avoid overwriting early user scrolling during hydration, while retaining later navigation and Back/Forward restoration.
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
- Same-page lab achievement links scroll to the collapsed trigger first, then expand, highlight, and replace the hash once scrolling settles; expanding above the source note first causes scroll anchoring jumps. All disclosure hash updates use router navigation with replace, resetScroll:false, and hashScrollIntoView:false to prevent automatic scrolling.
- Fixed bottom bars (site dock, project dock) are `pointer-events-none` on their full-width wrappers with `pointer-events-auto` only on the visible pill, toggle and menu, so taps on page content underneath them are not swallowed.
