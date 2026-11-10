import { describe, expect, it } from "vitest";
import { logarithmicBands, spectrumLevel } from "./spectrum";

describe("radial spectrum", () => {
  it("uses narrow bass bands and wider treble bands within the available spectrum", () => {
    const bands = logarithmicBands(1024, 48000 / 2048, 24);
    expect(bands).toHaveLength(24);
    expect(bands[0]?.start).toBeGreaterThan(0);
    expect(bands[23]?.end).toBeLessThanOrEqual(1024);
    expect((bands[23]?.end ?? 0) - (bands[23]?.start ?? 0)).toBeGreaterThan(
      (bands[0]?.end ?? 0) - (bands[0]?.start ?? 0),
    );
  });

  it("preserves differences between strong bands without clipping them to full height", () => {
    const bins = new Uint8Array([0, 100, 160, 200, 230, 255]);
    const levels = Array.from(bins, (_, i) => spectrumLevel(bins, { start: i, end: i + 1 }));
    expect(new Set(levels).size).toBe(bins.length);
    expect(levels[0]).toBe(0);
    expect(levels[4]).toBeLessThan(0.9);
    expect(levels[5]).toBe(1);
  });

  it("responds only to the selected frequency band", () => {
    const bins = new Uint8Array(1024);
    const bands = logarithmicBands(bins.length, 48000 / 2048, 24);
    const bass = bands[0];
    const treble = bands[23];
    expect(bass).toBeDefined();
    expect(treble).toBeDefined();
    if (!bass || !treble) throw new Error("Missing spectrum bands");
    bins.fill(220, bass.start, bass.end);
    expect(spectrumLevel(bins, bass)).toBeGreaterThan(0.7);
    expect(spectrumLevel(bins, treble)).toBe(0);
  });
});
