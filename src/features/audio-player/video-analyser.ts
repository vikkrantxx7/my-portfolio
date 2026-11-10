export interface VideoAnalyser {
  analyser: AnalyserNode;
  bins: Uint8Array<ArrayBuffer>;
}

const graphs = new WeakMap<HTMLMediaElement, VideoAnalyser | null>();

/**
 * Routes a media element through an analyser on the shared AudioContext:
 * source → analyser → destination, so sound is neither muted nor duplicated.
 * A MediaElementSource can exist only once per element, so the result is cached.
 */
export function attachAnalyser(
  media: HTMLMediaElement,
  ctx: AudioContext | null,
): VideoAnalyser | null {
  if (graphs.has(media)) return graphs.get(media) ?? null;
  let result: VideoAnalyser | null = null;
  try {
    if (ctx) {
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.85;
      const src = ctx.createMediaElementSource(media);
      src.connect(analyser);
      analyser.connect(ctx.destination);
      result = { analyser, bins: new Uint8Array(analyser.frequencyBinCount) };
    }
  } catch {
    result = null;
  }
  graphs.set(media, result);
  return result;
}

/** Average energy 0..1 of bass, mids and highs. */
export function bandEnergy(bins: Uint8Array): { bass: number; mid: number; high: number } {
  const n = bins.length;
  const avg = (a: number, b: number) => {
    let sum = 0;
    for (let i = a; i < b; i++) sum += bins[i] ?? 0;
    return b > a ? sum / (b - a) / 255 : 0;
  };
  return {
    bass: avg(0, Math.max(1, Math.floor(n * 0.08))),
    mid: avg(Math.floor(n * 0.08), Math.floor(n * 0.35)),
    high: avg(Math.floor(n * 0.35), Math.floor(n * 0.75)),
  };
}

/** Exponential damping toward a target, so light swells rather than flashes. */
export function damp(current: number, target: number, rate = 0.12) {
  return current + (target - current) * rate;
}
