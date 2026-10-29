# Installable + offline portfolio (PWA)

## What you get

- Visitors can install the portfolio to their phone or desktop; it opens full-screen with your avatar as the app icon and the dark theme colours.
- After one visit to the published site, the home page, case studies, fonts, images and resume PDF open without internet.
- New versions install themselves silently in the background; pages always try the network first, so content never gets stuck on an old version.
- Offline never activates inside the Lovable editor preview, only on vikrantfullstack.in. Add `?sw=off` to any URL to switch it off on a device.

## Acceptance criteria (tests written first)

- AC1: The page links to an app manifest with name "Vikrant Sharma", short name "Vikrant", full-screen display, dark theme colours and 192/512 px plus maskable icons from your avatar. Phone home-screen icon tag is present.
- AC2: The offline helper refuses to start in development, inside an iframe, on Lovable preview addresses, or with `?sw=off`, and removes any old offline worker in those cases.
- AC3: It starts on the real domain in a production build.
- AC4: Page loads use network-first; built files are cached; the sign-in path `/~oauth` is never cached.
- AC5: Existing tests stay green; build is clean.

## Technical details

- Add `vite-plugin-pwa` (generateSW, `/sw.js`, `registerType: "autoUpdate"`, `injectRegister: null`, `devOptions.enabled: false`), passed through `defineConfig({ vite: { plugins } })`. Navigation `NetworkFirst` with offline fallback to cached page; `CacheFirst` only for same-origin hashed assets; `/~oauth` in navigateFallbackDenylist. Precache resume.pdf and project artwork.
- New feature slice `src/features/pwa/`: `register-sw.ts` with a pure `shouldRegister(location, env, inIframe)` guard (preview host regexes per the PWA skill, lovableproject.com, beta.lovable.dev, `?sw=off`) plus unregister-in-refused-context; called once from a `useEffect` in `__root.tsx` via dynamic import.
- `public/manifest.webmanifest`, icons generated from the existing avatar (192, 512, maskable 512, apple-touch 180). Root head: manifest, theme-color, apple-touch-icon links.
- AGENTS.md rule: offline worker registers only through the guarded wrapper; never in preview.
- Verify with a production build locally: manifest served, worker registers, offline reload of `/` and a case study works.
