import { describe, expect, it } from "vitest";
import { dockProgressGeometry } from "./dock-progress-geometry";

describe("dock rim geometry", () => {
  it("starts at the top centre and closes there after following the border", () => {
    const { path, start } = dockProgressGeometry(384, 50, 1, 9999);
    expect(start).toEqual({ x: 192, y: 0.5 });
    expect(path.startsWith("M 192 0.5 ")).toBe(true);
    expect(path.endsWith("L 192 0.5 Z")).toBe(true);
  });

  it("matches the centreline of a one-pixel capsule border", () => {
    const { radius, bounds, perimeter } = dockProgressGeometry(384, 50, 1, 9999);
    expect(radius).toBe(24.5);
    expect(bounds).toEqual({ left: 0.5, top: 0.5, right: 383.5, bottom: 49.5 });
    expect(perimeter).toBeCloseTo(2 * 334 + Math.PI * 49);
  });

  it("uses the measured border thickness and corner radius rather than assuming a capsule", () => {
    const { radius, bounds } = dockProgressGeometry(288, 52, 2, 16);
    expect(radius).toBe(15);
    expect(bounds).toEqual({ left: 1, top: 1, right: 287, bottom: 51 });
  });
});