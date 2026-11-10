import { afterEach, describe, expect, it, vi } from "vitest";
import { createMusicLighting } from "./music-lighting";

describe("music lighting", () => {
  afterEach(() => {
    document.documentElement.removeAttribute("data-music-active");
    document.documentElement.removeAttribute("data-music-visible");
    document.documentElement.removeAttribute("data-music-reduced");
    document.documentElement.style.cssText = "";
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("activates only on playback transitions and clears stale energy on pause", () => {
    vi.useFakeTimers();
    const lighting = createMusicLighting();
    const target = document.createElement("div");
    target.setAttribute("data-music-light", "dock");
    document.body.append(target);
    lighting.playback(true, false, false);
    expect(document.documentElement).toHaveAttribute("data-music-active");
    expect(target).toHaveAttribute("data-music-start");
    target.removeAttribute("data-music-start");
    lighting.playback(true, false, false);
    expect(target).not.toHaveAttribute("data-music-start");
    lighting.frame(new Uint8Array(1024).fill(200), 48000 / 2048, 16);
    const root = document.documentElement;
    const initialEnergy = Number(root.style.getPropertyValue("--music-energy"));
    expect(initialEnergy).toBeGreaterThan(0);
    expect(Number(root.style.getPropertyValue("--music-dock-cyan-opacity"))).toBeGreaterThan(0);
    lighting.frame(new Uint8Array(1024).fill(0), 48000 / 2048, 100);
    expect(Number(root.style.getPropertyValue("--music-energy"))).toBeLessThan(initialEnergy);
    lighting.playback(false, false, false);
    expect(document.documentElement).not.toHaveAttribute("data-music-active");
    expect(
      Number(document.documentElement.style.getPropertyValue("--music-energy")),
    ).toBeGreaterThan(0);
    vi.advanceTimersByTime(700);
    expect(document.documentElement.style.getPropertyValue("--music-energy")).toBe("0");
    lighting.playback(true, false, false);
    expect(target).toHaveAttribute("data-music-start");
    lighting.dispose();
    target.remove();
  });

  it("uses a static restrained glow for reduced motion and hides in background tabs", () => {
    const lighting = createMusicLighting();
    lighting.playback(true, true, false);
    expect(document.documentElement).toHaveAttribute("data-music-reduced");
    expect(Number(document.documentElement.style.getPropertyValue("--music-energy"))).toBe(0.2);
    lighting.playback(true, true, true);
    expect(document.documentElement).not.toHaveAttribute("data-music-visible");
    lighting.dispose();
    expect(document.documentElement).not.toHaveAttribute("data-music-active");
    expect(document.documentElement.style.getPropertyValue("--music-energy")).toBe("");
  });

  it("separates bass and treble energy with restrained, time-based smoothing", () => {
    const lighting = createMusicLighting();
    lighting.playback(true, false, false);
    const bins = new Uint8Array(1024);
    bins.fill(255, 2, 11);
    lighting.frame(bins, 48000 / 2048, 1000);
    const root = document.documentElement;
    expect(Number(root.style.getPropertyValue("--music-cyan-intensity"))).toBeGreaterThan(
      Number(root.style.getPropertyValue("--music-violet-intensity")),
    );
    expect(Number(root.style.getPropertyValue("--music-energy"))).toBeLessThanOrEqual(1);
    expect(Number(root.style.getPropertyValue("--music-header-cyan-opacity"))).toBeLessThan(0.35);
    expect(Number(root.style.getPropertyValue("--music-shimmer-opacity"))).toBeGreaterThan(0.08);
    expect(Number(root.style.getPropertyValue("--music-shimmer-opacity"))).toBeLessThan(0.81);
    expect(Number(root.style.getPropertyValue("--music-divider-opacity"))).toBeLessThan(0.76);
    expect(Number(root.style.getPropertyValue("--music-dock-violet-opacity"))).toBeLessThan(0.29);
    lighting.dispose();
  });
});
