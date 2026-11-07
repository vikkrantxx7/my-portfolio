import { Music2 } from "lucide-react";
import { useEffect, useLayoutEffect, useRef } from "react";
import { nowPlaying } from "@/content/now-playing";
import { useAudioEngine } from "@/features/audio-player/use-audio-engine";

export const BAR_COUNT = 17;
const RING_R = 46;
const CIRC = 2 * Math.PI * RING_R;
/** Calm resting silhouette, tallest in the centre like the reference. */
const REST = Array.from({ length: BAR_COUNT }, (_, i) => {
  const t = 1 - Math.abs(i - (BAR_COUNT - 1) / 2) / ((BAR_COUNT - 1) / 2);
  return 0.12 + 0.28 * t * t;
});

const useIsoLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

/** Places the player just right of the visible theme toggle, which reserves room for it. */
function useDockBesideThemeToggle(ref: React.RefObject<HTMLDivElement | null>) {
  useIsoLayoutEffect(() => {
    const root = document.documentElement;
    root.setAttribute("data-audio-player", "");
    let frame = 0;
    const place = () => {
      frame = 0;
      const el = ref.current;
      if (!el) return;
      root.style.setProperty("--audio-gutter", `${el.offsetWidth + 4}px`);
      const toggle = [...document.querySelectorAll<HTMLElement>(".theme-toggle")].find(
        (t) => t.getClientRects().length > 0,
      );
      const art = el.querySelector<HTMLElement>("[data-art]");
      if (!toggle || !art) {
        el.style.visibility = "hidden";
        return;
      }
      const r = toggle.getBoundingClientRect();
      const artOffset = art.offsetTop + art.offsetHeight / 2;
      el.style.left = `${r.right + 4}px`;
      el.style.top = `${Math.max(4, r.top + r.height / 2 - artOffset)}px`;
      el.style.visibility = "visible";
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(place);
    };
    place();
    const ro = new ResizeObserver(schedule);
    ro.observe(document.body);
    const mo = new MutationObserver(schedule);
    mo.observe(document.body, { childList: true, subtree: true });
    window.addEventListener("resize", schedule);
    window.addEventListener("scroll", schedule, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      ro.disconnect();
      mo.disconnect();
      window.removeEventListener("resize", schedule);
      window.removeEventListener("scroll", schedule);
      root.removeAttribute("data-audio-player");
    };
  }, [ref]);
}

export function FloatingAudioPlayer() {
  const { engine, state } = useAudioEngine(nowPlaying.audioUrl);
  const rootRef = useRef<HTMLDivElement>(null);
  const arcRef = useRef<SVGCircleElement>(null);
  const dotRef = useRef<SVGGElement>(null);
  const barsRef = useRef<(HTMLSpanElement | null)[]>([]);
  useDockBesideThemeToggle(rootRef);

  // Visual updates go straight to the DOM so React never re-renders per frame.
  useEffect(() => {
    const e = engine();
    if (!e) return;
    const levels = [...REST];
    const paintProgress = () => {
      const p = e.progress();
      arcRef.current?.setAttribute("stroke-dashoffset", String(CIRC * (1 - p)));
      dotRef.current?.setAttribute("transform", `rotate(${p * 360} 50 50)`);
    };
    const paintBars = (target: (i: number) => number) => {
      barsRef.current.forEach((bar, i) => {
        levels[i] += (target(i) - levels[i]) * 0.35;
        if (bar) bar.style.transform = `scaleY(${levels[i].toFixed(3)})`;
      });
    };
    let frame = 0;
    const tick = () => {
      paintProgress();
      const bins = e.readFrequencies();
      if (bins) {
        // Bars low→high across the first ~3/4 of the spectrum (bass left, treble right).
        const usable = Math.floor(bins.length * 0.75);
        paintBars((i) => {
          const v = bins[Math.floor((i / BAR_COUNT) * usable)] / 255;
          return Math.max(REST[i] * 0.6, Math.min(1, v * (0.8 + i * 0.03)));
        });
      }
      frame = requestAnimationFrame(tick);
    };
    const settle = () => {
      cancelAnimationFrame(frame);
      frame = 0;
      paintProgress();
      paintBars((i) => REST[i]);
      for (let k = 0; k < 12; k++) paintBars((i) => REST[i]);
    };
    const sync = () => {
      if (e.state.isPlaying && !document.hidden) {
        if (!frame) frame = requestAnimationFrame(tick);
      } else settle();
    };
    settle();
    const unsub = e.subscribe(sync);
    e.audio.addEventListener("timeupdate", paintProgress);
    document.addEventListener("visibilitychange", sync);
    return () => {
      unsub();
      cancelAnimationFrame(frame);
      e.audio.removeEventListener("timeupdate", paintProgress);
      document.removeEventListener("visibilitychange", sync);
    };
  }, [engine]);

  const label = state.isPlaying ? `Pause ${nowPlaying.title}` : `Play ${nowPlaying.title}`;
  const status = state.error
    ? "Song unavailable — tap to retry"
    : state.isLoading
      ? "Loading…"
      : state.isPlaying
        ? "Now playing"
        : "Paused";

  return (
    <div
      ref={rootRef}
      data-testid="audio-player"
      data-playing={state.isPlaying || undefined}
      className="audio-player pointer-events-none fixed z-[60] flex w-[5.25rem] flex-col items-center gap-1 md:w-28 md:gap-1.5"
      style={{ visibility: "hidden", top: 0, left: 0 }}
    >
      <button
        type="button"
        data-art
        aria-label={label}
        aria-pressed={state.isPlaying}
        onClick={() => void engine()?.toggle()}
        className="audio-art pointer-events-auto relative size-16 shrink-0 cursor-pointer rounded-full focus-visible:outline-none md:size-24"
      >
        <span aria-hidden className="audio-rim absolute inset-[6%] rounded-full" />
        <img
          src={nowPlaying.artworkUrl}
          alt=""
          width={512}
          height={512}
          decoding="async"
          className="absolute inset-[10%] size-[80%] rounded-full object-cover"
        />
        <svg aria-hidden viewBox="0 0 100 100" className="absolute inset-0 size-full -rotate-90">
          <defs>
            <linearGradient id="audio-ring" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="var(--color-primary)" />
              <stop offset="1" stopColor="var(--color-secondary)" />
            </linearGradient>
          </defs>
          <circle cx="50" cy="50" r={RING_R} fill="none" className="stroke-border" strokeWidth="1.5" />
          <circle
            ref={arcRef}
            data-testid="audio-progress"
            cx="50"
            cy="50"
            r={RING_R}
            fill="none"
            stroke="url(#audio-ring)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeDasharray={CIRC}
            strokeDashoffset={CIRC}
          />
          <g ref={dotRef}>
            <circle cx={50 + RING_R} cy="50" r="2.6" className="audio-dot fill-foreground" />
          </g>
        </svg>
        {state.isLoading && <span aria-hidden className="audio-loading absolute inset-0 rounded-full" />}
      </button>
      <div className="audio-title pointer-events-auto flex w-full items-center gap-1 rounded-full border border-border bg-card/60 px-1.5 py-0.5 backdrop-blur-md md:px-2 md:py-1">
        <Music2 aria-hidden className="size-3 shrink-0 text-primary" />
        <div className="audio-marquee min-w-0 flex-1 overflow-hidden">
          <div className="audio-marquee-track flex w-max">
            <span className="audio-marquee-text pr-6">{nowPlaying.title}</span>
            <span aria-hidden className="audio-marquee-text pr-6">
              {nowPlaying.title}
            </span>
          </div>
        </div>
      </div>
      <div aria-hidden data-testid="audio-wave" className="flex h-3 items-center gap-[2px] md:h-4">
        {REST.map((rest, i) => (
          <span
            // biome-ignore lint/suspicious/noArrayIndexKey: fixed-length bar list
            key={i}
            ref={(el) => {
              barsRef.current[i] = el;
            }}
            className="audio-bar h-full w-[2px] rounded-full"
            style={{ transform: `scaleY(${rest})`, "--i": i / (BAR_COUNT - 1) } as React.CSSProperties}
          />
        ))}
      </div>
      <span role="status" className="sr-only">
        {status}
      </span>
    </div>
  );
}
