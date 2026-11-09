import * as PopoverPrimitive from "@radix-ui/react-popover";
import { X } from "lucide-react";
import { useEffect, useRef } from "react";
import type { AudioEngine } from "@/features/audio-player/audio-engine";
import { attachAnalyser, bandEnergy, damp } from "@/features/audio-player/video-analyser";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  anchorRef: React.RefObject<HTMLElement | null>;
  engine: () => AudioEngine | null;
  videoUrl: string;
  posterUrl: string;
  title: string;
}

/**
 * Cinematic music-video popover anchored under the audio widget. It stays mounted
 * after first open so the video keeps its position and its single analyser node.
 */
export function VideoPopup({
  open,
  onOpenChange,
  anchorRef,
  engine,
  videoUrl,
  posterUrl,
  title,
}: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const mounted = useRef(false);
  if (open) mounted.current = true;

  // Handoff: opening pauses the song and starts the video inside the gesture.
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    if (!open) {
      v.pause();
      return;
    }
    const e = engine();
    e?.pause();
    if (!v.getAttribute("src")) v.src = videoUrl;
    const ctx = e?.context() ?? null;
    attachAnalyser(v, ctx);
    void (async () => {
      try {
        if (ctx && ctx.state === "suspended") await ctx.resume();
        await v.play();
      } catch {
        // Autoplay refused: native controls stay ready for a manual start.
      }
    })();
  }, [open, engine, videoUrl]);

  // Never both: the song starting pauses the video, the video starting pauses the song.
  useEffect(() => {
    const e = engine();
    const v = videoRef.current;
    if (!e || !v) return;
    const onSong = () => v.pause();
    const onVideo = () => e.pause();
    e.audio.addEventListener("play", onSong);
    v.addEventListener("play", onVideo);
    return () => {
      e.audio.removeEventListener("play", onSong);
      v.removeEventListener("play", onVideo);
    };
  }, [engine]);

  // Audio-reactive glow, written to CSS variables (no per-frame React renders).
  useEffect(() => {
    const v = videoRef.current;
    const el = frameRef.current;
    if (!v || !el) return;
    let frame = 0;
    let bass = 0;
    let mid = 0;
    let high = 0;
    const write = () => {
      el.style.setProperty("--vg-bass", bass.toFixed(3));
      el.style.setProperty("--vg-mid", mid.toFixed(3));
      el.style.setProperty("--vg-high", high.toFixed(3));
    };
    const tick = () => {
      const graph = attachAnalyser(v, null);
      if (graph) {
        graph.analyser.getByteFrequencyData(graph.bins);
        const b = bandEnergy(graph.bins);
        bass = damp(bass, b.bass);
        mid = damp(mid, b.mid);
        high = damp(high, b.high);
        el.dataset.reactive = "";
      } else delete el.dataset.reactive;
      write();
      frame = requestAnimationFrame(tick);
    };
    const settle = () => {
      cancelAnimationFrame(frame);
      frame = 0;
      bass = mid = high = 0;
      write();
      delete el.dataset.reactive;
    };
    const sync = () => {
      if (!v.paused && !v.ended && !document.hidden) {
        if (!frame) frame = requestAnimationFrame(tick);
      } else settle();
    };
    const events = ["play", "playing", "pause", "ended"];
    for (const t of events) v.addEventListener(t, sync);
    document.addEventListener("visibilitychange", sync);
    return () => {
      cancelAnimationFrame(frame);
      for (const t of events) v.removeEventListener(t, sync);
      document.removeEventListener("visibilitychange", sync);
    };
  }, []);

  return (
    <PopoverPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <PopoverPrimitive.Anchor virtualRef={anchorRef as React.RefObject<HTMLElement>} />
      <PopoverPrimitive.Portal forceMount>
        <PopoverPrimitive.Content
          forceMount
          side="bottom"
          align="end"
          sideOffset={12}
          collisionPadding={{ top: 12, right: 12, bottom: 96, left: 12 }}
          aria-label={`${title} music video`}
          onOpenAutoFocus={(e) => e.preventDefault()}
          onInteractOutside={(e) => {
            const t = e.target as Element | null;
            if (t?.closest?.("[data-testid='audio-player']")) e.preventDefault();
          }}
          className="video-popup z-[70] data-[state=closed]:pointer-events-none data-[state=closed]:invisible data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95"
          style={mounted.current ? undefined : { display: "none" }}
        >
          <div ref={frameRef} data-testid="video-frame" className="video-frame relative">
            <video
              ref={videoRef}
              data-testid="music-video"
              poster={posterUrl}
              controls
              playsInline
              preload="metadata"
              className="video-el block aspect-square w-full rounded-[1.25rem] bg-background"
            >
              <track kind="captions" />
            </video>
            <PopoverPrimitive.Close
              aria-label="Close video"
              className="video-close absolute top-3 right-3 grid size-9 cursor-pointer place-items-center rounded-full"
            >
              <X className="size-4" aria-hidden />
            </PopoverPrimitive.Close>
          </div>
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  );
}
