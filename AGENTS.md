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

## Instruction scope

Read applicable nested `AGENTS.md` files before editing files in their scope. Root rules apply throughout the repository; nested files add specialized guidance. For changes spanning directories, read the guidance for each affected area, including when changing its callers or shared configuration and helpers.

| Area                 | Guidance                                                                     |
| -------------------- | ---------------------------------------------------------------------------- |
| Automation           | [.github/AGENTS.md](.github/AGENTS.md)                                       |
| Content and MDX      | [src/content/AGENTS.md](src/content/AGENTS.md)                               |
| Routes, SEO and SSR  | [src/routes/AGENTS.md](src/routes/AGENTS.md)                                 |
| Navigation           | [src/widgets/nav/AGENTS.md](src/widgets/nav/AGENTS.md)                       |
| Audio/video playback | [src/widgets/audio-player/AGENTS.md](src/widgets/audio-player/AGENTS.md)     |
| Resume viewer        | [src/features/resume-viewer/AGENTS.md](src/features/resume-viewer/AGENTS.md) |
| Theme                | [src/features/theme-toggle/AGENTS.md](src/features/theme-toggle/AGENTS.md)   |
| Shared UI            | [src/shared/ui/AGENTS.md](src/shared/ui/AGENTS.md)                           |

## Repository-wide rules

- Reusable UI primitives live in `src/shared/ui` with `cva` variants; features/widgets follow simplified Feature-Sliced Design.
- Every story ships with Vitest + Testing Library tests written first.
- Lint/format with Biome only (one fast tool).
- Use the shared reduced-motion hook to bypass Motion springs when requested.
- Form state uses TanStack Form with reusable context-bound fields and submit controls in shared UI; no React Hook Form or resolver wrappers, to keep form contracts aligned with the TanStack stack.
- Internal navigation uses TanStack `Link` (never plain `<a href>`) so pages switch in-app without a full reload; tests render such widgets with `src/test/render-with-router.tsx`.
- Offline service worker (vite-plugin-pwa generateSW, /sw.js) registers only via src/features/pwa/register-sw.ts, which refuses dev, iframes, Lovable preview hosts and ?sw=off — stale workers must never serve previews.
- Controls use pointer cursors.
- Subpage headers share `PageHeader`; all docks share the primitives in `src/shared/ui/dock-shell.tsx`. Read the shared UI guidance when composing docks, not only when editing their primitives.
- Site identity (URL, author, SEO copy) lives in `src/content/site.ts`; a test forbids personal details outside `src/content`, so the repo stays a rebrandable template (see TEMPLATE.md).
- Component CSS lives beside its component, imported atop `src/styles.css` for flash-free SSR; global CSS keeps tokens, themes, base rules and shared utilities.
- Latin variable fonts live in `public/fonts` with licenses; `src/fonts.css` URLs match root-head anonymous preloads to avoid CSS-dependent discovery and duplicate downloads.

## Cross-feature contracts

- Career roles are composed in the timeline widget; achievement disclosure state lives in the expand-achievement feature so multiple achievements can open independently.
- Achievement deep links use `#exp-<experienceId>-<achievementId>`, replacing history (never pushing) via the deep-link feature. The disclosure trigger carries the hash id so native/router scrolling works; unknown hashes resolve to null and are ignored. Disclosure hash updates use router navigation with replace, resetScroll:false, and hashScrollIntoView:false.
- Project filters are validated TanStack search parameters with pure matching in the filter-projects feature. Query-only navigation preserves achievement hashes and scroll, disabling both resetScroll and hashScrollIntoView so filtering does not retrigger achievement scrolling.
- Same-page lab achievement links scroll to the collapsed trigger first, then expand, highlight, and replace the hash once scrolling settles; expanding above the source note first causes scroll anchoring jumps.
