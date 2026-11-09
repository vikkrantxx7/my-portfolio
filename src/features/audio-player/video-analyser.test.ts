import { describe, expect, it, vi } from "vitest";
import { attachAnalyser, damp } from "./video-analyser";

describe("attachAnalyser", () => {
  it("creates the media source only once per element", () => {
    const analyser = { fftSize: 0, frequencyBinCount: 8, connect: vi.fn() };
    const ctx = {
      createAnalyser: vi.fn(() => analyser),
      createMediaElementSource: vi.fn(() => ({ connect: vi.fn() })),
      destination: {},
    } as unknown as AudioContext;
    const media = document.createElement("video");
    attachAnalyser(media, ctx);
    attachAnalyser(media, ctx);
    expect(ctx.createMediaElementSource).toHaveBeenCalledTimes(1);
  });

  it("damping moves gradually, never jumping to the target", () => {
    expect(damp(0, 1)).toBeCloseTo(0.12);
  });
});
