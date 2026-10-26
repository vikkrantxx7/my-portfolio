# Fix canonical addresses

- Replace relative canonical addresses with `https://vikrantfullstack.in/` on the homepage and the matching full address on each case study.
- Keep each page’s Open Graph address identical to its canonical address.
- Write regression tests first, then verify the rendered page tags.
- No visual or content changes. The live site receives the correction on the next publish.

## Technical details
Use a shared, browser-safe URL helper in the existing SEO module; canonical tags remain on leaf routes only.