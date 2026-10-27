import { describe, expect, it } from "vitest";
import { getCornerSparks, getFilamentPoints } from "./profile-card-rim-geometry";

describe("profile card filament", () => {
  it.each([
    [288, 390],
    [248, 420],
  ])("contains the full perimeter at %sx%s", (width, height) => {
    const points = getFilamentPoints(width, height, 20);
    expect(points.length).toBeGreaterThan(100);
    expect(points[0]).toEqual(points.at(-1));
    for (const { x, y } of points) {
      expect(x).toBeGreaterThanOrEqual(0);
      expect(x).toBeLessThanOrEqual(width);
      expect(y).toBeGreaterThanOrEqual(0);
      expect(y).toBeLessThanOrEqual(height);
      expect(Math.min(x, y, width - x, height - y)).toBeLessThan(8);
    }
    expect(points.some(({ x }) => x < 2)).toBe(true);
    expect(points.some(({ x }) => x > width - 2)).toBe(true);
    expect(points.some(({ y }) => y < 2)).toBe(true);
    expect(points.some(({ y }) => y > height - 2)).toBe(true);
  });

  it("has stable geometry rather than generating random flicker", () => {
    expect(getFilamentPoints(288, 390, 20)).toEqual(getFilamentPoints(288, 390, 20));
  });

  it("ignores dimensions before the card is measured", () => {
    expect(getFilamentPoints(0, 0, 20)).toEqual([]);
  });
});

describe("corner sparks", () => {
  it("emits two fading lines originating near opposite corners", () => {
    const sparks = getCornerSparks(288, 390);
    expect(sparks).toHaveLength(2);
    const [topLeft, bottomRight] = sparks;
    // Each origin hugs its card corner, inside the rim's corner-arc zone.
    expect(Math.hypot(topLeft[0].x, topLeft[0].y)).toBeLessThan(10);
    expect(Math.hypot(bottomRight[0].x - 288, bottomRight[0].y - 390)).toBeLessThan(10);
    // Each line escapes the card and fades away from it.
    expect(topLeft.at(-1)!.x).toBeLessThan(0);
    expect(topLeft.at(-1)!.y).toBeLessThan(0);
    expect(bottomRight.at(-1)!.x).toBeGreaterThan(288);
    expect(bottomRight.at(-1)!.y).toBeGreaterThan(390);
    // The escape is net-outward even with the shimmer wobble.
    expect(Math.hypot(topLeft.at(-1)!.x, topLeft.at(-1)!.y)).toBeGreaterThan(
      Math.hypot(topLeft[0].x, topLeft[0].y) + 16,
    );
  });

  it("keeps spark escapes inside a short, restrained reach", () => {
    for (const points of getCornerSparks(288, 390)) {
      const first = points[0];
      const last = points.at(-1)!;
      expect(Math.hypot(last.x - first.x, last.y - first.y)).toBeLessThan(44);
    }
  });

  it("has stable geometry rather than generating random flicker", () => {
    expect(getCornerSparks(288, 390)).toEqual(getCornerSparks(288, 390));
  });

  it("ignores dimensions before the card is measured", () => {
    expect(getCornerSparks(0, 0)).toEqual([]);
  });
});
