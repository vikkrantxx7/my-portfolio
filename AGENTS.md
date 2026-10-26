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
