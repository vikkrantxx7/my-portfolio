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
});

describe("progressPath", () => {
  it("is empty at the top of the page", () => {
    expect(progressPath(0)).toBe("");
  });

  it("ends with a broad head at full scroll", () => {
    const d = progressPath(1);
    expect(d).toMatch(/^M0 /);
    expect(d).toContain("100 1"); // head reaches the right edge near the top
    expect(d).toMatch(/100 8 L0 8 Z$/); // head is full ribbon height
  });

  it("keeps a tapered thin tail at the start", () => {
    const d = progressPath(0.25);
    expect(d).toMatch(/^M0 5\.5 /); // tail sits low: only 2.5 units thick of 8
  });

  it("reaches halfway across the ribbon at half scroll", () => {
    const d = progressPath(0.5);
    expect(d).toContain("50 1");
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
