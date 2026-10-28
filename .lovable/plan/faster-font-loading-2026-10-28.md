# Faster font loading

## Story: Remove the font discovery delay
Keep the existing Geist typography and appearance while letting browsers start downloading the two primary fonts directly from the page head.

### Acceptance criteria
- Geist and Geist Mono Latin variable fonts are preloaded with matching URLs and anonymous cross-origin mode.
- Font definitions use those same local files, retain weights 100–900, and use `font-display: swap`.
- Unused language subsets are no longer included in the main stylesheet.
- Both fonts load successfully without duplicate downloads; the homepage retains its appearance.

### Technical approach
- Write regression tests first for font availability and matching preload/stylesheet sources.
- Copy the installed Latin WOFF2 files into `public/fonts/` and replace broad package CSS imports with focused local font definitions.
- Add sitewide font preloads in the root head and document the matching-URL convention.
- Run focused tests and check font loading in the browser. Do not publish automatically.

### Verification limits
This removes the dependency on CSS discovery, but a score of 100 or a specific time saving is not guaranteed. Re-run Lighthouse on the published site after publishing to measure the actual improvement.