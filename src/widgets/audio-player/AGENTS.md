# audio-player

- The floating audio player is mounted once in the root layout so playback survives navigation; `createAudioEngine` owns one native `<audio preload="none">` (src set on first tap, CDN byte-range streaming) and its single analyser graph, and visuals paint via rAF refs, never per-frame React state. It positions itself right of the visible `.theme-toggle`, which reserves the gap through `--audio-gutter`.
