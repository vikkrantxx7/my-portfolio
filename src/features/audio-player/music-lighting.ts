const PROPERTIES = [
  "--music-energy",
  "--music-cyan-intensity",
  "--music-violet-intensity",
  "--music-header-cyan-opacity",
  "--music-header-violet-opacity",
  "--music-divider-opacity",
  "--music-shimmer-opacity",
  "--music-dock-cyan-opacity",
  "--music-dock-violet-opacity",
] as const;

/** Consumes the waveform's existing spectrum read; owns no media graph or animation loop. */
export function createMusicLighting() {
  const root = document.documentElement;
  let playing = false;
  let reduced = false;
  let hidden = false;
  let energy = [0, 0, 0];
  let releaseTimer: ReturnType<typeof setTimeout> | null = null;
  const write = () => {
    const [overall = 0, bass = 0, treble = 0] = energy;
    const values = [
      overall,
      bass,
      treble,
      Math.min(0.34, 0.025 + overall * 0.2 + bass * 0.15),
      Math.min(0.34, 0.025 + overall * 0.2 + treble * 0.15),
      Math.min(0.75, 0.1 + overall * 0.55),
      Math.min(0.8, 0.08 + overall * 0.72),
      Math.min(0.28, 0.025 + overall * 0.16 + bass * 0.12),
      Math.min(0.28, 0.025 + overall * 0.16 + treble * 0.12),
    ];
    PROPERTIES.forEach((property, i) => root.style.setProperty(property, String(values[i] ?? 0)));
  };
  const reset = () => {
    energy = [0, 0, 0];
    write();
  };
  return {
    playback(next: boolean, reduce: boolean, invisible: boolean) {
      const started = next && !playing;
      playing = next;
      reduced = reduce;
      hidden = invisible;
      root.toggleAttribute("data-music-active", playing);
      root.toggleAttribute("data-music-visible", playing && !hidden);
      root.toggleAttribute("data-music-reduced", reduced);
      if (releaseTimer) clearTimeout(releaseTimer);
      releaseTimer = null;
      if (hidden) reset();
      else if (!playing) {
        releaseTimer = setTimeout(() => {
          releaseTimer = null;
          if (!playing) reset();
        }, 700);
      } else if (reduced) {
        reset();
        energy = [0.2, 0.2, 0.2];
        write();
      }
      if (started && !reduced && !hidden) {
        const desktop = window.matchMedia("(min-width: 768px)").matches;
        if (!desktop) {
          for (const target of document.querySelectorAll<HTMLElement>(
            '[data-music-light="dock"]',
          )) {
            target.setAttribute("data-music-start", "");
          }
        }
      }
      if (!playing || hidden || reduced) {
        for (const target of document.querySelectorAll("[data-music-start]")) {
          target.removeAttribute("data-music-start");
        }
      }
    },
    frame(bins: Uint8Array, binWidth: number, elapsed: number) {
      if (!playing || reduced || hidden || binWidth <= 0) return;
      const average = (low: number, high: number) => {
        const start = Math.max(1, Math.floor(low / binWidth));
        const end = Math.min(bins.length, Math.ceil(high / binWidth));
        let total = 0;
        for (let i = start; i < end; i++) total += bins[i] ?? 0;
        return end > start ? total / ((end - start) * 255) : 0;
      };
      const bass = average(60, 250);
      const mid = average(250, 4000);
      const high = average(4000, 12000);
      const targets = [
        Math.min(1, (bass * 0.35 + mid * 0.5 + high * 0.15) * 1.5),
        Math.min(1, bass * 1.5),
        Math.min(1, (high * 0.6 + mid * 0.4) * 1.5),
      ];
      energy = targets.map((target, i) => {
        const previous = energy[i] ?? 0;
        const rate = 1 - Math.exp(-Math.min(elapsed, 100) / (target > previous ? 90 : 300));
        return Math.max(0, Math.min(1, previous + (target - previous) * rate));
      });
      write();
    },
    dispose() {
      if (releaseTimer) clearTimeout(releaseTimer);
      for (const property of PROPERTIES) root.style.removeProperty(property);
      for (const attribute of ["data-music-active", "data-music-visible", "data-music-reduced"]) {
        root.removeAttribute(attribute);
      }
      for (const target of document.querySelectorAll<HTMLElement>("[data-music-light]")) {
        target.removeAttribute("data-music-start");
      }
    },
  };
}
