import { describe, expect, it } from "vitest";
import { getFilamentPoints } from "./profile-card-rim-geometry";

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
