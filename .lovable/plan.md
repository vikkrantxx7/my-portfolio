# Floating Audio Widget — "From URL to Pixels"

## Storage decision (verified before planning)
- The site already uses **Lovable Assets** (Cloudflare R2 + CDN) for the banner and project artwork, served same-origin under `/__l5e/assets-v1/...`.
- A live range probe against an existing asset on `vikrantfullstack.in` returned **HTTP/2 206**, `Accept-Ranges: bytes`, a valid `Content-Range`, `Cache-Control: public, max-age=31536000, immutable`, an ETag, and HTTPS via Cloudflare.
- So: no Lovable Cloud, database, bucket, API or signed URLs are needed. Both files become separate public CDN objects, same-origin (no CORS / `crossOrigin` complications for the Web Audio analyser).
- Still to verify after upload: the MP3 itself returns `206` with `Content-Type: audio/mpeg`, and the AVIF returns `image/avif` (use `--content-type` if detection is wrong). If the MP3 range check fails, stop and report before building UI.

## Stories (TDD, tests first)

**A1 — Media objects**
- Upload `from-url-to-pixels.mp3` (5.2 MB) and `from-url-to-pixels.avif` (254 KB) as asset pointers; register them in a typed `src/content/now-playing.ts` (title, artwork, audio URL) so the template stays rebrandable.
- AC: curl confirms 206 + correct MIME + immutable caching for both; validateContent covers the new entry.

**A2 — Audio engine (no UI)** — `src/features/audio-player/`
- `useAudioPlayback`: one native `<audio preload="none">`, `src` assigned only on first play; play/pause/replay-after-end; states `isPlaying`, `isLoading`, `duration`, `audioError`.
- `createAnalyser`: AudioContext + single MediaElementSource → Analyser → destination, created on first gesture, resumed if suspended.
- AC tests: no src before interaction; one source node across plays; ended→click restarts at 0; error state surfaces.

**A3 — Visuals** — `FloatingAudioPlayer` widget
- Circular AVIF artwork as the (only) button, 80px desktop / ~64px tablet / ~56px mobile; dynamic "Play/Pause From URL to Pixels" label; visible focus ring.
- Thin vinyl rim rotating only while playing (CSS, paused via `animation-play-state`).
- SVG progress ring, cyan→violet, with luminous dot; driven by `currentTime/duration` written to the DOM via rAF refs (no per-frame React renders).
- Seamless fading title marquee (duplicated track, mask edges); static under reduced motion.
- 17 canvas/SVG bars from `getByteFrequencyData`, bass→treble mapped, smoothed; calm static bars when paused/unavailable; rAF stops when paused, ended or tab hidden.
- Radix: `@radix-ui/react-tooltip` (already in style of the project) for a small "Now playing" hint; no media-player libraries.

**A4 — Placement & integration**
- Fixed top-right, **immediately to the right of the theme toggle** on desktop and mobile (toggle shifts left by the widget's width; both share one top-right cluster), mounted once in the root layout so playback continues across pages.
- Visual follows the reference: artwork inside a cyan→violet ring with a bright end dot, title in a slim glass pill with a music-note icon (no arrows, per the brief), dotted/bar waveform underneath brightest at the centre.
- Must not overlap header nav, mobile dock or theme toggle; reserved size so no layout shift.
- Playwright: no audio request on load; request after click returns 206 and playback starts before full download; desktop/tablet/mobile screenshots; light theme check.

## Final report will include
Storage provider, the two public URLs, range-request verification result, progressive-playback test result, and any CDN limitations.

## Technical notes
- Same-origin CDN URL means no `crossOrigin` attribute needed; analyser output isn't muted (source → analyser → destination).
- Offline service worker must not precache or intercept the MP3 (exclude `/__l5e/assets-v1/*.mp3` from runtime caching) so range requests aren't broken.
- Out of scope: video, lyrics, playlists, autoplay.
