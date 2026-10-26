import { useEffect, useState } from "react";

// Ribbon geometry in a 100x8 viewBox stretched across the header width.
// Meteor trail: a thin level trail (1.8/8 tall) that swells into a rounded,
// slightly narrower head (5/8 tall) over the last 12% of the drawn length.
const RIBBON_HEIGHT = 8;
const TRAIL_TOP = 6.2;
const HEAD_TOP = 3;
const HEAD_RAMP = 12;
const HEAD_CENTER_Y = 5.5;

/** Meteor-trail path: thin level trail ending in a rounded, broader head. */
export function progressPath(progress: number): string {
  if (progress <= 0) return "";
  const p = Math.min(progress, 1) * 100;
  const rampStart = Math.max(p - HEAD_RAMP, 0);
  return `M0 ${TRAIL_TOP} L${rampStart} ${TRAIL_TOP} C ${rampStart + (p - rampStart) * 0.55} ${TRAIL_TOP}, ${p - (p - rampStart) * 0.3} ${HEAD_TOP + 0.4}, ${p} ${HEAD_TOP} L${p} ${RIBBON_HEIGHT} L0 ${RIBBON_HEIGHT} Z`;
}

function readScrollProgress(): number {
  if (typeof window === "undefined") return 0;
  const max = document.documentElement.scrollHeight - window.innerHeight;
  if (max <= 0) return 0;
  return Math.min(Math.max(window.scrollY / max, 0), 1);
}

export function ScrollProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      setProgress(readScrollProgress());
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule, { passive: true });
    update();
    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  const pct = Math.round(progress * 100);

  return (
    <div
      role="progressbar"
      aria-label="Page scroll progress"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={pct}
      className={`absolute inset-x-0 bottom-0 h-2 overflow-hidden pointer-events-none transition-opacity duration-300 ${
        progress > 0 ? "opacity-100" : "opacity-0"
      }`}
    >
      <svg
        viewBox={`0 0 100 ${RIBBON_HEIGHT}`}
        preserveAspectRatio="none"
        className="h-full w-full"
        aria-hidden
      >
        <defs>
          {/* Gradient is anchored to the full page width (userSpaceOnUse), so the
              head drifts from cyan to violet as the page scrolls. */}
          <linearGradient
            id="scroll-progress-gradient"
            gradientUnits="userSpaceOnUse"
            x1="0"
            y1="0"
            x2="100"
            y2="0"
          >
            <stop offset="0" stopColor="var(--color-primary)" />
            <stop offset="1" stopColor="var(--color-secondary)" />
          </linearGradient>
        </defs>
        <path
          d={progressPath(progress)}
          fill="url(#scroll-progress-gradient)"
          style={{
            filter:
              "drop-shadow(0 -1px 4px color-mix(in oklab, var(--color-primary) 55%, transparent))",
          }}
        />
      </svg>
      {progress > 0 && (
        <span
          data-head
          aria-hidden
          className="absolute size-[6px] -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{
            left: `${progress * 100}%`,
            top: `${(HEAD_CENTER_Y / RIBBON_HEIGHT) * 100}%`,
            background: `radial-gradient(circle, rgba(255,255,255,0.95) 0%, color-mix(in oklab, var(--color-primary) ${(1 - progress) * 100}%, var(--color-secondary)) 52%, transparent 74%)`,
            filter: `drop-shadow(0 0 6px color-mix(in oklab, var(--color-primary) ${(1 - progress) * 100}%, var(--color-secondary)))`,
          }}
        />
      )}
    </div>
  );
}
