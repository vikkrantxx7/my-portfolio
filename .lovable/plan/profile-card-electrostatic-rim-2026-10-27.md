# Profile card electrostatic rim

## Story: Contained electric border

Add a fine irregular lightning filament around the entire expanded profile card, using cyan and violet with a restrained bright core and soft bloom. Keep its existing placement, photo, GitHub button, and opening transition.

### Acceptance criteria

- The filament hugs all four edges and rounded corners without detached forks or large flares.
- A very faint, slow shimmer changes brightness only; the border does not race or flicker.
- The photo, text, and GitHub control remain unobscured and clickable.
- Reduced motion shows the same static border without shimmer.
- The rim works in both site themes and fits narrow screens.

## Technical approach

- Add a decorative, pointer-transparent SVG rim composed beside the avatar preview; use stable perimeter geometry and unique gradient IDs.
- Keep effect CSS beside the navigation components, imported through the global stylesheet; colours and glow use semantic tokens.
- Write focused tests first for geometry bounds and reduced-motion behaviour, retain existing dialog interaction tests, and visually verify the opened card.
