# audio-player

- The floating audio player is mounted once in the root layout so playback survives navigation; `AudioEngine` owns one native `<audio preload="none">` (src set on first tap, CDN byte-range streaming) and its single analyser graph, and visuals paint via rAF refs, never per-frame React state. It positions itself right of the visible `.theme-toggle`, which reserves the gap through `--audio-gutter`.
- The music video popup (`video-popup.tsx`) is a non-modal Radix Popover anchored to the artwork, opened by right-click / 600 ms long-press / Shift+F10 (`use-secondary-press`); it stays mounted after first open so the video keeps its position and its one MediaElementSource on the engine's shared AudioContext. Song and video pause each other so they never play together.
