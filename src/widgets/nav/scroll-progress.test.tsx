import { act, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { progressPath, ScrollProgress } from "./scroll-progress";

function setScrollProgress(p: number) {
  // 1000px document, 100px viewport -> max scroll is 900px.
  Object.defineProperty(window, "scrollY", { value: p * 900, configurable: true });
  Object.defineProperty(window, "innerHeight", { value: 100, configurable: true });
  Object.defineProperty(document.documentElement, "scrollHeight", {
    value: 1000,
    configurable: true,
  });
}

beforeEach(() => {
  document.body.innerHTML = "";
  setScrollProgress(0);
  // jsdom rAF is not synchronous; flush callbacks immediately so act() sees updates.
  window.requestAnimationFrame = ((cb: FrameRequestCallback) => {
    cb(0);
    return 1;
  }) as unknown as typeof window.requestAnimationFrame;
  window.cancelAnimationFrame = () => {};
});

describe("progressPath", () => {
  it("is empty at the top of the page", () => {
    expect(progressPath(0)).toBe("");
  });

  it("keeps a thin, level trail that ends in a rounded head", () => {
    const d = progressPath(0.5);
    // Trail sits low: only 1.8 of 8 units thick...
    expect(d).toMatch(/^M0 6\.2 L38 6\.2 /);
    // ...then swells to a slightly narrower head right at the tip.
    expect(d).toMatch(/50 3 L50 8 L0 8 Z$/);
  });

  it("caps the head ramp so short ribbons stay trail-thin", () => {
    const d = progressPath(0.05);
    expect(d).toMatch(/^M0 6\.2 L0 6\.2 /);
  });
});

describe("ScrollProgress", () => {
  it("starts empty and hides itself at the top of the page", () => {
    render(<ScrollProgress />);
    const bar = screen.getByRole("progressbar", { name: /page scroll progress/i });
    expect(bar).toHaveAttribute("aria-valuenow", "0");
    expect(bar).toHaveClass("opacity-0");
  });

  it("grows and reports progress as the page scrolls", () => {
    render(<ScrollProgress />);
    setScrollProgress(0.5);
    act(() => {
      window.dispatchEvent(new Event("scroll"));
    });
    const bar = screen.getByRole("progressbar", { name: /page scroll progress/i });
    expect(bar).toHaveAttribute("aria-valuenow", "50");
    expect(bar).not.toHaveClass("opacity-0");
    const path = bar.querySelector("path") as SVGPathElement;
    expect(path).toHaveAttribute("d", progressPath(0.5));
    // A bright meteor head rides at the tip of the trail.
    const head = bar.querySelector("[data-head]") as HTMLElement;
    expect(head.style.left).toBe("50%");
    // The head dot stays compact — narrower than the ribbon it rides on.
    expect(head).toHaveClass("size-[6px]");
  });

  it("has no meteor head before the page scrolls", () => {
    const { container } = render(<ScrollProgress />);
    expect(container.querySelector("circle")).toBeNull();
  });

  it("spans cyan to violet across the full page, not just the drawn ribbon", () => {
    const { container } = render(<ScrollProgress />);
    const gradient = container.querySelector("linearGradient");
    expect(gradient).toHaveAttribute("gradientUnits", "userSpaceOnUse");
    const stops = gradient?.querySelectorAll("stop") ?? [];
    expect(stops).toHaveLength(2);
    expect(stops[0]).toHaveAttribute("offset", "0");
    expect(stops[1]).toHaveAttribute("offset", "1");
  });

  it("sits at the bottom edge of its container without intercepting taps", () => {
    const { container } = render(<ScrollProgress />);
    const bar = container.firstElementChild as HTMLElement;
    expect(bar).toHaveClass("absolute", "bottom-0", "pointer-events-none");
  });
});
