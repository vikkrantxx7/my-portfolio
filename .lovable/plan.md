# Mobile dock ignition

## Story: A brief electric welcome on expansion
When the floating menu opens, a cyan/violet pulse sweeps along its rounded border and fades away. Keep the existing dock layout and desktop lightning unchanged.

### Acceptance criteria
- Each opening triggers one short border sweep; it never loops while the menu remains open.
- The glow follows the actual dock outline without crossing labels or icons.
- Menu links, closing, focus handling and scrolling remain immediate, including during the pulse.
- Reduced-motion users get the existing static border with no pulse or expansion animation.
- Both light and dark themes use their existing accent colours.

## Technical details
- Add a lightweight, pointer-transparent border effect to the existing mobile menu; use CSS masking and token-based colours, with no geometry tracking or desktop lightning calculations.
- Write behaviour tests first for the pulse lifecycle, repeat opening, reduced motion and navigation during ignition.
- Run the relevant navigation tests and check the opening/closing flow at a mobile viewport, including light theme and reduced motion.