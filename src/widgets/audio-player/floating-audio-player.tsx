import { Music2 } from "lucide-react";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { nowPlaying } from "@/content/now-playing";
import { createMusicLighting } from "@/features/audio-player/music-lighting";
import { logarithmicBands, spectrumLevel } from "@/features/audio-player/spectrum";
import { useAudioEngine } from "@/features/audio-player/use-audio-engine";
import { useSecondaryPress } from "@/features/audio-player/use-secondary-press";
import { usePrefersReducedMotion } from "@/shared/lib/use-prefers-reduced-motion";
import { VideoPopup } from "./video-popup";

export const BAR_COUNT = 48;
const RING_R = 34;
const BAR_BASE = 11;
const BAR_LENGTH = 10;
const CIRC = 2 * Math.PI * RING_R;
const REST = Array.from({ length: BAR_COUNT }, () => 0.12);
const BAR_IDS = Array.from({ length: BAR_COUNT }, (_, i) => `bar-${i}`);

const useIsoLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

function paintSongProgress(
  progress: number,
  arc: SVGCircleElement | null,
  dot: SVGGElement | null,
  input: HTMLInputElement | null,
) {
  arc?.setAttribute("stroke-dashoffset", String(CIRC * (1 - progress)));
  dot?.setAttribute("transform", `rotate(${progress * 360} 50 50)`);
  if (!input) return;
  const angle = progress * Math.PI * 2 - Math.PI / 2;
  input.style.left = `${50 + RING_R * Math.cos(angle)}%`;
  input.style.top = `${50 + RING_R * Math.sin(angle)}%`;
  input.value = String(progress * 100);
  input.setAttribute("aria-valuetext", `${Math.round(progress * 100)}%`);
}

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
  const seekRef = useRef<HTMLInputElement>(null);
  const dragRef = useRef<number | null>(null);
  const [canSeek, setCanSeek] = useState(false);
  const barsRef = useRef<(SVGLineElement | null)[]>([]);
  const reduceMotion = usePrefersReducedMotion();
  useDockBesideThemeToggle(rootRef);
  const artRef = useRef<HTMLButtonElement>(null);
  const [videoOpen, setVideoOpen] = useState(false);
  const video = nowPlaying.videoUrl;
  const { shouldHandleClick, ...secondary } = useSecondaryPress(() => {
    if (video) setVideoOpen(true);
  });

  // Visual updates go straight to the DOM so React never re-renders per frame.
  useEffect(() => {
    const e = engine();
    if (!e) return;
    const levels = [...REST];
    const lighting = createMusicLighting();
    let bands: ReturnType<typeof logarithmicBands> = [];
    const paintProgress = () => {
      paintSongProgress(e.progress(), arcRef.current, dotRef.current, seekRef.current);
    };
    const syncDuration = () => {
      setCanSeek(Number.isFinite(e.audio.duration) && e.audio.duration > 0);
      paintProgress();
    };
    syncDuration();
    const paintBars = (target: (i: number) => number) => {
      barsRef.current.forEach((bar, i) => {
        const previous = levels[i] ?? 0;
        const next = target(i);
        const level = previous + (next - previous) * (next > previous ? 0.7 : 0.3);
        levels[i] = level;
        bar?.setAttribute("y2", (BAR_BASE - BAR_LENGTH * level).toFixed(3));
      });
    };
    let frame = 0;
    let previousTime = 0;
    const tick = (time: number) => {
      paintProgress();
      const bins = e.readFrequencies();
      if (bins) lighting.frame(bins, e.frequencyBinWidth, previousTime ? time - previousTime : 16);
      previousTime = time;
      if (bins && e.frequencyBinWidth > 0) {
        if (!bands.length) {
          bands = logarithmicBands(bins.length, e.frequencyBinWidth, BAR_COUNT / 2);
        }
        // Mirror bass-to-treble around the circle to avoid a seam at the top.
        paintBars((i) => {
          const band = bands[Math.min(bands.length - 1, Math.min(i, BAR_COUNT - i))];
          return Math.max((REST[i] ?? 0) * 0.6, band ? spectrumLevel(bins, band) : 0);
        });
      }
      frame = requestAnimationFrame(tick);
    };
    const settle = () => {
      cancelAnimationFrame(frame);
      frame = 0;
      previousTime = 0;
      paintProgress();
      barsRef.current.forEach((bar, i) => {
        levels[i] = REST[i] ?? 0;
        bar?.setAttribute("y2", (BAR_BASE - BAR_LENGTH * levels[i]).toFixed(3));
      });
    };
    const sync = () => {
      const active = e.state.isPlaying && !e.state.isLoading && !e.state.error && !e.state.ended;
      lighting.playback(active, reduceMotion, document.hidden);
      if (active && !document.hidden && !reduceMotion) {
        if (!frame) frame = requestAnimationFrame(tick);
      } else settle();
    };
    sync();
    const unsub = e.subscribe(sync);
    e.audio.addEventListener("timeupdate", paintProgress);
    e.audio.addEventListener("seeking", paintProgress);
    e.audio.addEventListener("durationchange", syncDuration);
    e.audio.addEventListener("loadedmetadata", syncDuration);
    e.audio.addEventListener("emptied", syncDuration);
    document.addEventListener("visibilitychange", sync);
    return () => {
      unsub();
      cancelAnimationFrame(frame);
      lighting.dispose();
      e.audio.removeEventListener("timeupdate", paintProgress);
      e.audio.removeEventListener("seeking", paintProgress);
      e.audio.removeEventListener("durationchange", syncDuration);
      e.audio.removeEventListener("loadedmetadata", syncDuration);
      e.audio.removeEventListener("emptied", syncDuration);
      document.removeEventListener("visibilitychange", sync);
    };
  }, [engine, reduceMotion]);

  const seek = (percent: number) => {
    const e = engine();
    if (!e || !Number.isFinite(e.audio.duration) || e.audio.duration <= 0) return;
    e.audio.currentTime = (Math.max(0, Math.min(100, percent)) / 100) * e.audio.duration;
    // Keep the head responsive before the browser emits its next media event.
    paintSongProgress(
      e.audio.currentTime / e.audio.duration,
      arcRef.current,
      dotRef.current,
      seekRef.current,
    );
  };
  const seekPointer = (event: React.PointerEvent<HTMLInputElement>) => {
    const bounds = artRef.current?.getBoundingClientRect();
    if (!bounds || bounds.width <= 0 || bounds.height <= 0) return;
    const x = (event.clientX - bounds.left) / bounds.width - 0.5;
    const y = (event.clientY - bounds.top) / bounds.height - 0.5;
    const angle = (Math.atan2(y, x) + Math.PI / 2 + Math.PI * 2) % (Math.PI * 2);
    seek((angle / (Math.PI * 2)) * 100);
  };

  const label = state.isPlaying ? `Pause ${nowPlaying.title}` : `Play ${nowPlaying.title}`;
  let status = "Paused";
  if (state.error) {
    status = "Song unavailable — tap to retry";
  } else if (state.isLoading) {
    status = "Loading…";
  } else if (state.isPlaying) {
    status = "Now playing";
  }

  return (
    <div
      ref={rootRef}
      data-testid="audio-player"
      data-playing={state.isPlaying || undefined}
      className="audio-player pointer-events-none fixed z-60 flex w-21 flex-col items-center gap-1 md:w-28 md:gap-1.5"
      style={{ visibility: "hidden", top: 0, left: 0 }}
    >
      <div className="relative size-15 shrink-0">
        <button
          type="button"
          ref={artRef}
          data-art
          aria-label={label}
          aria-pressed={state.isPlaying}
          aria-describedby={video ? "audio-video-hint" : undefined}
          {...(video ? secondary : {})}
          onClick={() => {
            if (shouldHandleClick()) void engine()?.toggle();
          }}
          className="audio-art pointer-events-auto relative size-15 shrink-0 cursor-pointer rounded-full focus-visible:outline-none"
        >
          <span aria-hidden className="audio-rim absolute inset-[20%] rounded-full" />
          <img
            src={nowPlaying.artworkUrl}
            alt={`Cover artwork for ${nowPlaying.title}`}
            width={512}
            height={512}
            decoding="async"
            className="absolute inset-[22%] size-[56%] rounded-full object-cover"
          />
          <svg aria-hidden viewBox="0 0 100 100" className="absolute inset-0 size-full -rotate-90">
            <defs>
              <linearGradient id="audio-ring" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stopColor="var(--color-primary)" />
                <stop offset="1" stopColor="var(--color-secondary)" />
              </linearGradient>
            </defs>
            <g data-testid="audio-wave" className="audio-wave">
              {REST.map((rest, i) => (
                <g key={BAR_IDS[i]} transform={`rotate(${(i / BAR_COUNT) * 360} 50 50)`}>
                  <line
                    ref={(el) => {
                      barsRef.current[i] = el;
                    }}
                    x1="50"
                    y1={BAR_BASE}
                    x2="50"
                    y2={BAR_BASE - BAR_LENGTH * rest}
                    className="audio-bar"
                    style={
                      {
                        "--i": (1 - Math.cos((i / BAR_COUNT) * Math.PI * 2)) / 2,
                      } as React.CSSProperties
                    }
                  />
                </g>
              ))}
            </g>
            <circle
              cx="50"
              cy="50"
              r={RING_R}
              fill="none"
              className="stroke-border"
              strokeWidth="1.5"
            />
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
          {state.isLoading && (
            <span aria-hidden className="audio-loading absolute inset-0 rounded-full" />
          )}
        </button>
        <input
          ref={seekRef}
          type="range"
          aria-label="Song progress"
          aria-valuetext="0%"
          min={0}
          max={100}
          step={0.1}
          defaultValue={0}
          disabled={!canSeek}
          className="audio-seek-head"
          onChange={(event) => seek(Number(event.currentTarget.value))}
          onPointerDown={(event) => {
            if (event.button !== 0 || !canSeek) return;
            event.preventDefault();
            event.currentTarget.focus({ preventScroll: true });
            event.currentTarget.setPointerCapture(event.pointerId);
            dragRef.current = event.pointerId;
          }}
          onPointerMove={(event) => {
            if (dragRef.current === event.pointerId) seekPointer(event);
          }}
          onPointerUp={(event) => {
            if (dragRef.current !== event.pointerId) return;
            seekPointer(event);
            dragRef.current = null;
            event.currentTarget.releasePointerCapture(event.pointerId);
          }}
          onPointerCancel={() => {
            dragRef.current = null;
          }}
          onLostPointerCapture={() => {
            dragRef.current = null;
          }}
        />
      </div>
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
      {video && (
        <>
          <span id="audio-video-hint" className="sr-only">
            Right-click, long-press or press Shift+F10 to watch the music video
          </span>
          <VideoPopup
            open={videoOpen}
            onOpenChange={(o) => {
              setVideoOpen(o);
              if (!o) artRef.current?.focus({ preventScroll: true });
            }}
            anchorRef={artRef}
            engine={engine}
            videoUrl={video}
            posterUrl={nowPlaying.posterUrl ?? nowPlaying.artworkUrl}
            title={nowPlaying.title}
          />
        </>
      )}
      <output className="sr-only" aria-live="polite">
        {status}
      </output>
    </div>
  );
}
