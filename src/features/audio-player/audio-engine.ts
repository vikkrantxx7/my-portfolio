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
export class AudioEngine {
  readonly audio: HTMLAudioElement;
  state: AudioState = { isPlaying: false, isLoading: false, ended: false, error: false };
  private ctx: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private bins: Uint8Array<ArrayBuffer> | null = null;
  private graphTried = false;
  private listeners = new Set<() => void>();
  private createContext: () => AudioContext | null;

  constructor(
    private readonly src: string,
    options: Options = {},
  ) {
    this.audio = options.audio ?? new Audio();
    this.audio.preload = "none";
    this.createContext = options.createContext ?? defaultContext;
    const on = (type: string, patch: Partial<AudioState>) =>
      this.audio.addEventListener(type, () => this.set(patch));
    on("playing", { isPlaying: true, isLoading: false, ended: false, error: false });
    on("pause", { isPlaying: false });
    on("waiting", { isLoading: true });
    on("canplay", { isLoading: false });
    on("ended", { isPlaying: false, ended: true });
    on("error", { isPlaying: false, isLoading: false, error: true });
  }

  subscribe(fn: () => void) {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  private set(patch: Partial<AudioState>) {
    this.state = { ...this.state, ...patch };
    for (const fn of this.listeners) fn();
  }

  private ensureGraph() {
    if (this.graphTried) return;
    this.graphTried = true;
    try {
      const ctx = this.createContext();
      if (!ctx) return;
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 64;
      analyser.smoothingTimeConstant = 0.78;
      const source = ctx.createMediaElementSource(this.audio);
      source.connect(analyser);
      analyser.connect(ctx.destination);
      this.ctx = ctx;
      this.analyser = analyser;
      this.bins = new Uint8Array(analyser.frequencyBinCount);
    } catch {
      this.ctx = null;
      this.analyser = null;
    }
  }

  async toggle() {
    if (!this.audio.paused) {
      this.audio.pause();
      return;
    }
    if (!this.audio.getAttribute("src")) this.audio.src = this.src;
    if (this.state.ended || this.audio.ended) this.audio.currentTime = 0;
    this.ensureGraph();
    this.set({ isLoading: true, error: false, ended: false });
    try {
      if (this.ctx && this.ctx.state === "suspended") await this.ctx.resume();
      await this.audio.play();
    } catch {
      this.set({ isLoading: false, isPlaying: false, error: true });
    }
  }

  /** Progress 0..1 from the real playback position. */
  progress(): number {
    if (this.state.ended) return 1;
    const d = this.audio.duration;
    return Number.isFinite(d) && d > 0 ? Math.min(1, this.audio.currentTime / d) : 0;
  }

  readFrequencies(): Uint8Array | null {
    if (!this.analyser || !this.bins) return null;
    this.analyser.getByteFrequencyData(this.bins);
    return this.bins;
  }
}
