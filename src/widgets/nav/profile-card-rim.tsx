import { useEffect, useId, useRef, useState } from "react";
import { getCornerSparks, getFilamentPoints } from "./profile-card-rim-geometry";

const toPointList = (points: { x: number; y: number }[]) =>
  points.map(({ x, y }) => `${x.toFixed(2)},${y.toFixed(2)}`).join(" ");

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

  const points = toPointList(getFilamentPoints(size.width, size.height, 20));
  const sparks = getCornerSparks(size.width, size.height);

  return (
    <svg
      ref={ref}
      aria-hidden="true"
      focusable="false"
      className="profile-card-rim"
      data-shimmer={!reducedMotion}
      viewBox={`0 0 ${size.width || 1} ${size.height || 1}`}
    >
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
      {sparks.map((spark, index) => {
        const sparkId = `${gradientId}-spark-${index}`;
        const start = spark[0];
        const end = spark.at(-1)!;
        const color = index === 0 ? "var(--primary)" : "var(--secondary)";
        return (
          <g key={sparkId}>
            <linearGradient
              id={sparkId}
              gradientUnits="userSpaceOnUse"
              x1={start.x}
              y1={start.y}
              x2={end.x}
              y2={end.y}
            >
              <stop offset="0" stopColor={color} stopOpacity="0.85" />
              <stop offset="0.55" stopColor={color} stopOpacity="0.35" />
              <stop offset="1" stopColor={color} stopOpacity="0" />
            </linearGradient>
            <polyline
              className="profile-card-rim-spark"
              data-spark={index === 0 ? "a" : "b"}
              points={toPointList(spark)}
              stroke={`url(#${sparkId})`}
            />
          </g>
        );
      })}
    </svg>
  );
}
