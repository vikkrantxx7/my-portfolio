export interface AudioState {
  isPlaying: boolean;
  isLoading: boolean;
  ended: boolean;
  error: boolean;
}

interface Options {
  audio?: HTMLAudioElement;
  /** Returns null when Web Audio is unavailable; playback still works. */
  createContext?: () => AudioContext | null;
}

function defaultContext(): AudioContext | null {
  const Ctor =
    typeof window === "undefined"
      ? undefined
      : (window.AudioContext ??
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext);
  return Ctor ? new Ctor() : null;
}

/**
 * Owns one native <audio> element and its Web Audio graph. The source is assigned
 * only on the first explicit play so nothing downloads on page load; the browser
 * then streams the MP3 progressively with byte-range requests.
 */
export function createAudioEngine(src: string, options: Options = {}) {
  const audio = options.audio ?? new Audio();
  audio.preload = "none";
  const createContext = options.createContext ?? defaultContext;
  let state: AudioState = { isPlaying: false, isLoading: false, ended: false, error: false };
  let ctx: AudioContext | null = null;
  let analyser: AnalyserNode | null = null;
  let bins: Uint8Array<ArrayBuffer> | null = null;
  let graphTried = false;
  const listeners = new Set<() => void>();

  function set(patch: Partial<AudioState>) {
    state = { ...state, ...patch };
    for (const fn of listeners) fn();
  }

  const on = (type: string, patch: Partial<AudioState>) =>
    audio.addEventListener(type, () => set(patch));
  on("playing", { isPlaying: true, isLoading: false, ended: false, error: false });
  on("pause", { isPlaying: false });
  on("waiting", { isLoading: true });
  on("canplay", { isLoading: false });
  on("ended", { isPlaying: false, ended: true });
  on("seeking", { ended: false });
  on("error", { isPlaying: false, isLoading: false, error: true });

  function ensureGraph() {
    if (graphTried) return;
    graphTried = true;
    try {
      const context = createContext();
      if (!context) return;
      const node = context.createAnalyser();
      node.fftSize = 2048;
      node.smoothingTimeConstant = 0.45;
      const source = context.createMediaElementSource(audio);
      source.connect(node);
      node.connect(context.destination);
      ctx = context;
      analyser = node;
      bins = new Uint8Array(node.frequencyBinCount);
    } catch {
      ctx = null;
      analyser = null;
    }
  }

  async function toggle() {
    if (!audio.paused && !state.ended && !audio.ended) {
      audio.pause();
      return;
    }
    if (!audio.getAttribute("src")) audio.src = src;
    if (state.ended || audio.ended) audio.currentTime = 0;
    ensureGraph();
    set({ isLoading: true, error: false, ended: false });
    try {
      if (ctx?.state === "suspended") await ctx.resume();
      await audio.play();
    } catch {
      set({ isLoading: false, isPlaying: false, error: true });
    }
  }

  return {
    audio,
    get state() {
      return state;
    },
    subscribe(fn: () => void) {
      listeners.add(fn);
      return () => listeners.delete(fn);
    },
    toggle,
    pause() {
      if (!audio.paused) audio.pause();
    },
    /** Shared AudioContext, created on demand for other media. */
    context(): AudioContext | null {
      ensureGraph();
      return ctx;
    },
    /** Progress 0..1 from the real playback position. */
    progress(): number {
      if (state.ended) return 1;
      const duration = audio.duration;
      return Number.isFinite(duration) && duration > 0
        ? Math.min(1, audio.currentTime / duration)
        : 0;
    },
    readFrequencies(): Uint8Array | null {
      if (!analyser || !bins) return null;
      analyser.getByteFrequencyData(bins);
      return bins;
    },
    get frequencyBinWidth(): number {
      return ctx && analyser ? ctx.sampleRate / analyser.fftSize : 0;
    },
  };
}

export type AudioEngine = ReturnType<typeof createAudioEngine>;
