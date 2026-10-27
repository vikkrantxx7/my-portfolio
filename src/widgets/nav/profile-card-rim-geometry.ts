type Point = { x: number; y: number };

/** Deterministic, shallow charge deviations along a rounded card perimeter. */
export function getFilamentPoints(width: number, height: number, radius: number): Point[] {
  if (width <= 0 || height <= 0) return [];
  const inset = 1.2;
  const r = Math.max(1, Math.min(radius, width / 2 - inset, height / 2 - inset));
  const points: Point[] = [];
  const add = (x: number, y: number, nx: number, ny: number) => {
    const i = points.length;
    const charge = Math.sin(i * 2.39) * 0.48 + Math.sin(i * 0.83) * 0.22;
    points.push({ x: x + nx * charge, y: y + ny * charge });
  };
  const line = (x1: number, y1: number, x2: number, y2: number, nx: number, ny: number) => {
    const steps = Math.ceil(Math.hypot(x2 - x1, y2 - y1) / 4);
    for (let i = 0; i < steps; i++)
      add(x1 + ((x2 - x1) * i) / steps, y1 + ((y2 - y1) * i) / steps, nx, ny);
  };
  const arc = (cx: number, cy: number, start: number) => {
    const steps = Math.ceil((r * Math.PI) / 8);
    for (let i = 0; i < steps; i++) {
      const a = start + ((Math.PI / 2) * i) / steps;
      add(cx + r * Math.cos(a), cy + r * Math.sin(a), Math.cos(a), Math.sin(a));
    }
  };
  const right = width - inset;
  const bottom = height - inset;
  line(inset + r, inset, right - r, inset, 0, -1);
  arc(right - r, inset + r, -Math.PI / 2);
  line(right, inset + r, right, bottom - r, 1, 0);
  arc(right - r, bottom - r, 0);
  line(right - r, bottom, inset + r, bottom, 0, 1);
  arc(inset + r, bottom - r, Math.PI / 2);
  line(inset, bottom - r, inset, inset + r, -1, 0);
  arc(inset + r, inset + r, Math.PI);
  const first = points[0];
  if (first) points.push(first);
  return points;
}

const SPARK_REACH = 36;

/**
 * Two faint spark lines escaping opposite corners (top-left, bottom-right),
 * fading away from the card. Deterministic wobble, none before measurement.
 */
export function getCornerSparks(width: number, height: number): Point[][] {
  if (width <= 0 || height <= 0) return [];
  const inset = 1.2;
  const reach = Math.min(SPARK_REACH, Math.min(width, height) * 0.16);
  const make = (origin: Point, direction: Point, wobbleSeed: number): Point[] => {
    const points: Point[] = [];
    const steps = 9;
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const wobble = Math.sin((i + wobbleSeed) * 1.7) * 1.6 * (1 - t);
      points.push({
        x: origin.x + direction.x * t * reach - direction.y * wobble,
        y: origin.y + direction.y * t * reach + direction.x * wobble,
      });
    }
    return points;
  };
  const near = 1.5;
  const diagonal = Math.SQRT1_2;
  return [
    make({ x: inset + near, y: inset + near }, { x: -diagonal, y: -diagonal }, 0),
    make({ x: width - inset - near, y: height - inset - near }, { x: diagonal, y: diagonal }, 5),
  ];
}
