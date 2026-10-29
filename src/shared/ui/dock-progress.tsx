import { useEffect, useId, useRef, useState } from "react";
import { useScrollProgress } from "@/shared/lib/use-scroll-progress";

/** A measured, pointer-transparent cyan/violet reading trail on the pill rim. */
export function DockProgress() {
  const progress = useScrollProgress();
  const id = useId().replace(/:/g, "");
  const ref = useRef<SVGSVGElement>(null);
  const [size, setSize] = useState({ width: 384, height: 50 });
  useEffect(() => {
    const parent = ref.current?.parentElement;
    if (!parent) return;
    const measure = () => {
      const { width, height } = parent.getBoundingClientRect();
      if (width > 0 && height > 0) setSize({ width, height });
    };
    measure();
    const observer = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(measure);
    observer?.observe(parent);
    return () => observer?.disconnect();
  }, []);
  const rect = { x: 0.75, y: 0.75, width: size.width - 1.5, height: size.height - 1.5, rx: (size.height - 1.5) / 2, pathLength: 1, fill: "none", stroke: `url(#${id})`, strokeWidth: 1.3 };
  return <svg ref={ref} role="progressbar" aria-label="Page scroll progress" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(progress * 100)} viewBox={`0 0 ${size.width} ${size.height}`} className="dock-progress">
    <defs><linearGradient id={id} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="var(--primary)" /><stop offset="1" stopColor="var(--secondary)" /></linearGradient></defs>
    <g opacity={progress > 0 ? 1 : 0} aria-hidden="true">
      <rect {...rect} className="dock-progress-trail" strokeDasharray={`${progress} 1`} />
      <rect {...rect} className="dock-progress-head" strokeLinecap="round" strokeDasharray={`${Math.min(progress, 0.025)} 1`} strokeDashoffset={-Math.max(0, progress - 0.025)} />
    </g>
  </svg>;
}