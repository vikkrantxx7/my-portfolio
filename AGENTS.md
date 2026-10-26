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
