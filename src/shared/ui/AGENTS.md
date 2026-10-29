# Shared UI rules

- MDX fences use the shared Prose CodeBlock; clipboard text is reconstructed from highlighted code lines to preserve line breaks without copying controls or captions.
- Docks share `DockPosition` (safe-area fixed wrapper), `DockBar` (the pill), `DockIcon`, and `DockShell` (reading pages add the `useScrollProgress` rim trail). Page widgets own destinations; shared shells own safe-area spacing and presentation to prevent drift. The resume viewer uses the same primitives with the fixed tone so its dock stays dark over the white paper.
- Fixed bottom bars (site dock, project dock) are `pointer-events-none` on their full-width wrappers with `pointer-events-auto` only on the visible pill, toggle and menu, so taps on page content underneath them are not swallowed.
- Dock rim paths use measured border-box geometry and a padding-box SVG viewBox to prevent curvature and scaling drift.
- Dock taps spawn a clipped cyan→violet ripple via `useDockRipple` (`dock-ripple.ts`/`dock-ripple.css`); it is pure DOM, works on links and buttons, and is skipped for reduced motion.
