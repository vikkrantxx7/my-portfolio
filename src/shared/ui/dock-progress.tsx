import { useEffect, useId, useRef, useState } from "react";
import { useScrollProgress } from "@/shared/lib/use-scroll-progress";
import { dockProgressGeometry } from "./dock-progress-geometry";

/** A measured, pointer-transparent cyan/violet reading trail on the pill rim. */
export function DockProgress() {
  const progress = useScrollProgress();
  const id = useId().replace(/:/g, "");
  const ref = useRef<SVGSVGElement>(null);
  const [size, setSize] = useState({ width: 384, height: 50, border: 1, radius: 9999 });
  useEffect(() => {
    const parent = ref.current?.parentElement;
    if (!parent) return;
    const measure = () => {
      const { width, height } = parent.getBoundingClientRect();
      const styles = getComputedStyle(parent);
      const border = Number.parseFloat(styles.borderTopWidth) || 0;
      const radius = Number.parseFloat(styles.borderTopLeftRadius) || 0;
      if (width > 0 && height > 0) setSize({ width, height, border, radius });
    };
    measure();
    const observer = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(measure);
    observer?.observe(parent);
    return () => observer?.disconnect();
  }, []);
  const geometry = dockProgressGeometry(size.width, size.height, size.border, size.radius);
  const rim = {
    d: geometry.path,
    pathLength: 1,
    fill: "none",
    stroke: `url(#${id})`,
    strokeWidth: 1.3,
  };
  return (
    <svg
      ref={ref}
      role="progressbar"
      aria-label="Page scroll progress"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(progress * 100)}
      // Absolutely positioned children use the padding box, not the border box.
      // Cropping the viewBox to that same box avoids scaling the rim off its border.
      viewBox={`${size.border} ${size.border} ${size.width - 2 * size.border} ${size.height - 2 * size.border}`}
      className="dock-progress"
    >
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="var(--primary)" />
          <stop offset="1" stopColor="var(--secondary)" />
        </linearGradient>
      </defs>
      <g opacity={progress > 0 ? 1 : 0}>
        <path {...rim} className="dock-progress-trail" strokeDasharray={`${progress} 1`} />
        <path
          {...rim}
          className="dock-progress-head"
          strokeLinecap="round"
          strokeDasharray={`${Math.min(progress, 0.025)} 1`}
          strokeDashoffset={-Math.max(0, progress - 0.025)}
        />
      </g>
    </svg>
  );
}
