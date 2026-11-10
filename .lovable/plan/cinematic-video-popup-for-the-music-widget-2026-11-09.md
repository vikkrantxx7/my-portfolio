# Cinematic Video Popup for the Music Widget

Right-click (desktop), long-press (touch) or Shift+F10 / ContextMenu key on the floating artwork opens a glowing video popup. Normal click/tap still toggles the song.

## Findings that shape the plan

- Uploaded MP4: 1080x1080 (square, not 16:9), 2m09s, H.264 + AAC, **146 MB** (~9 Mbps). Too heavy for a portfolio, especially on mobile data.
- Existing media lives on Lovable Assets (Cloudflare R2 CDN, same-origin, verified 206 + immutable caching) — reused, no database, API or signed URLs.
- Avatar popup is a Radix Dialog on the left side of the header; the video popup anchors under the music widget on the right (opposite side).
- `AudioEngine` already owns one AudioContext; it will be shared for the video analyser.

## Stories (tests first)

**V1 — Video asset**

- Re-encode to a web version: 1080x1080 H.264 (CRF ~26, ~1.5–2.5 Mbps), AAC 128k, `+faststart` so playback starts before full download (target ~25–40 MB). Original untouched.
- Extract a poster frame as AVIF.
- Upload both as Lovable Assets; add `videoUrl` / `posterUrl` to `src/content/now-playing.ts` (optional fields, so the template still works without a video).
- AC: curl shows `video/mp4`, 206 on a range request, immutable caching; poster is `image/avif`.

**V2 — Secondary-interaction hook** (`use-secondary-press`)

- `contextmenu` → preventDefault + open.
- Pointer long-press 600 ms, cancel on >10 px movement or pointerup; when it fires, the following click is swallowed so audio does not toggle.
- Shift+F10 / ContextMenu key while focused.
- Artwork button gets `aria-describedby` hint ("Right-click or long-press to watch the video").
- AC tests: each trigger opens; short tap still plays; moved long-press cancels.

**V3 — Playback handoff** (`VideoPopup` widget)

- On open: `audioEngine.pause()` (position kept), video `src` assigned lazily on first open, `preload="metadata"`, `play()` attempted inside the gesture; rejection leaves native controls ready.
- Video `play` event pauses audio; audio play pauses video — never both.
- On close: video paused, position kept, audio stays paused.
- AC tests: open pauses audio; close pauses video; no video request before first open.

**V4 — Popup shell & design**

- Radix Popover (already installed) anchored to the widget, `side="bottom" align="end"`, collision padding with safe-area insets; non-modal (no page blocking), Esc / outside-click / close dismiss; clicks on the widget itself don't double-toggle; focus returns to the artwork.
- Rounded square frame (matches the 1:1 video), near-black translucent backdrop, thin cyan→violet edge, soft outer glow, native `controls playsInline`, `accent-color` cyan.
- Size: `min(420px, 100vw - 32px)` desktop; full-width-minus-margins on mobile, capped so it stays above the bottom dock.
- Small round close button (Lucide X) at the frame's top-right over the video, dark translucent, cyan focus ring, `aria-label="Close video"`.

**V5 — Audio-reactive glow**

- Video element → MediaElementSource (created once) → Analyser → destination on the shared AudioContext; resumed if suspended.
- rAF reads bass/mid/treble energy, damps it (lerp), writes CSS variables (`--glow-cyan`, `--glow-violet`, `--glow-spread`) on the frame — no React state per frame.
- Stops on pause/ended/hidden tab/close; falls back to slow "breathing" glow if analysis unavailable; reduced motion → static glow.

**V6 — Verification**

- Playwright: desktop right-click and mobile long-press open it; audio paused; video request returns 206 and plays; seek issues a new range request; Esc/outside close; screenshots at 1280 / 820 / 360 in dark and light.

## Technical notes

- Same-origin CDN URL → no `crossOrigin` needed for the analyser.
- Service worker must not cache/intercept `.mp4` (same exclusion as the MP3).
- Files: `src/features/audio-player/use-secondary-press.ts`, `src/features/audio-player/video-analyser.ts`, `src/widgets/audio-player/video-popup.tsx` + `.css`, edits to `floating-audio-player.tsx`, `audio-engine.ts` (expose shared context), `now-playing.ts`, `sw` config, AGENTS note.

## Decision for you

The video is square, so I'll keep a square frame rather than crop it to 16:9 (the reference image is wide). Say so if you'd rather crop.
