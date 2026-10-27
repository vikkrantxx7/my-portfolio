# theme-toggle

- Theme is a `light`/`dark` class on the document root, set pre-paint by an inline script and toggled by this feature (View Transition paper-burn: light radiates from the toggle, dark converges into it; wrinkled edge via burn-noise.png mask, skipped for reduced motion); all colours come from tokens so both themes stay in sync.
- The iOS/Safari top-bar colour (theme-color meta) is updated synchronously in switchTheme before the burn View Transition and again after `finished` — some Safari builds ignore meta changes made mid-transition (Safari 26+ ignores the meta entirely and samples the body background, which is theme-driven).
