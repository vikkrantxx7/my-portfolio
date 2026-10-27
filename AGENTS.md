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
- Theme is a `light`/`dark` class on the document root, set pre-paint by an inline script and toggled by the theme-toggle feature (View Transition paper-burn: light radiates from the toggle, dark converges into it; wrinkled edge via burn-noise.png mask, skipped for reduced motion); all colours come from tokens so both themes stay in sync.
- Offline service worker (vite-plugin-pwa generateSW, /sw.js) registers only via src/features/pwa/register-sw.ts, which refuses dev, iframes, Lovable preview hosts and ?sw=off — stale workers must never serve previews.
- Interactive controls must read as clickable: a base-layer cursor rule plus `cursor-pointer` on the shared Button and the theme toggle; the header name link carries `header-name` so its hover glow resolves from `currentColor`, and because text-shadow is inherited the fade is declared on the letter spans too.
- The resume opens in the in-app viewer (src/features/resume-viewer), never as a raw PDF navigation, so installed-PWA users keep a way back; its floating controls use fixed dark hex values (not tokens) because they float over the paper-white PDF, and the Paper/Dark viewing toggle (CSS invert filter) is independent of the site theme. The home route loader resolves synchronously on client navigations — the origin is only needed for SSR head tags.

- Bottom toolbars share `dockBar`/`dockItem` cva styles in `src/shared/ui/dock.ts` (tone `fixed` for the resume over white paper) so sizes stay identical across pages.
- Desktop sections use Radix `SectionNavigation` and one measured capsule. Bounded SVG lightning joins border centres and dissolves into gradients on actual border arcs, never branches; selection is immediate and reduced motion skips flights. Hold click selection until scroll settles/interruption; rAF tracking uses scroll margins and a near-bottom threshold.
- Mobile dock ignition mounts with the menu: a pointer-transparent masked CSS border sweep, removed on completion; no looping, navigation delay or reduced-motion animation.
- Site identity (URL, author, SEO copy) lives in `src/content/site.ts`; a test forbids personal details outside `src/content`, so the repo stays a rebrandable template (see TEMPLATE.md).
- Component-only CSS lives beside its component and is `@import`ed at the top of `src/styles.css` (not imported from the component) so it is part of the SSR stylesheet and paints without a flash; the global file keeps only tokens, themes, base rules and shared utilities.
- `HeaderEnergy` is container-agnostic: targets come from a `resolveTarget` prop (default `data-energy-target`/`data-energy-shape`); site nav supplies its own resolver.
