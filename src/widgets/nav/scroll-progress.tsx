import { useScrollProgress } from "@/shared/lib/use-scroll-progress";

// Ribbon geometry in a 100x8 viewBox stretched across the header width.
// Both ribbon edges swell symmetrically around the meteor's centreline.
// The trail is 1.8/8 tall and the compact head is 5/8 tall.
const RIBBON_HEIGHT = 8;
const HEAD_CENTER_Y = RIBBON_HEIGHT / 2;
const TRAIL_TOP = HEAD_CENTER_Y - 0.9;
const TRAIL_BOTTOM = HEAD_CENTER_Y + 0.9;
const HEAD_TOP = HEAD_CENTER_Y - 2.5;
const HEAD_BOTTOM = HEAD_CENTER_Y + 2.5;
const HEAD_RAMP = 12;

/** Meteor-trail path: thin level trail ending in a rounded, broader head. */
export function progressPath(progress: number): string {
  if (progress <= 0) return "";
  const p = Math.min(progress, 1) * 100;
  const rampStart = Math.max(p - HEAD_RAMP, 0);
  const controlStart = rampStart + (p - rampStart) * 0.55;
  const controlEnd = p - (p - rampStart) * 0.3;
  return `M0 ${TRAIL_TOP} L${rampStart} ${TRAIL_TOP} C ${controlStart} ${TRAIL_TOP}, ${controlEnd} ${HEAD_TOP + 0.4}, ${p} ${HEAD_TOP} L${p} ${HEAD_BOTTOM} C ${controlEnd} ${HEAD_BOTTOM - 0.4}, ${controlStart} ${TRAIL_BOTTOM}, ${rampStart} ${TRAIL_BOTTOM} L0 ${TRAIL_BOTTOM} Z`;
}

export function ScrollProgress() {
  const progress = useScrollProgress();

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
