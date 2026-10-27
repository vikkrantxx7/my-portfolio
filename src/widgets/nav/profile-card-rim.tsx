import { useEffect, useId, useRef, useState } from "react";
import { getFilamentPoints } from "./profile-card-rim-geometry";

export function ProfileCardRim({ reducedMotion }: { reducedMotion: boolean }) {
  const ref = useRef<SVGSVGElement>(null);
  const gradientId = useId();
  const [size, setSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const card = ref.current?.parentElement;
    if (!card) return;
    const measure = () => setSize({ width: card.clientWidth, height: card.clientHeight });
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(card);
    return () => observer.disconnect();
  }, []);

  const points = getFilamentPoints(size.width, size.height, 20)
    .map(({ x, y }) => `${x.toFixed(2)},${y.toFixed(2)}`).join(" ");

  return (
    <svg ref={ref} aria-hidden="true" focusable="false" className="profile-card-rim" data-shimmer={!reducedMotion}
      viewBox={`0 0 ${size.width || 1} ${size.height || 1}`}>
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="var(--primary)" />
          <stop offset="0.42" stopColor="var(--secondary)" />
          <stop offset="0.74" stopColor="var(--primary)" />
          <stop offset="1" stopColor="var(--secondary)" />
        </linearGradient>
      </defs>
      <g stroke={`url(#${gradientId})`}>
        <polyline className="profile-card-rim-bloom" points={points} />
        <polyline className="profile-card-rim-filament" points={points} />
        <polyline className="profile-card-rim-core" points={points} />
      </g>
    </svg>
  );
}