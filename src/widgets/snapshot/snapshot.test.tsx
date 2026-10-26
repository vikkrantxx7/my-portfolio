import { act, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { content } from "@/content/data";
import { Snapshot } from "./snapshot";

let trigger: () => void = () => {};

function setReducedMotion(reduce: boolean) {
  window.matchMedia = ((query: string) => ({
    matches: reduce && query.includes("reduce"),
    media: query,
    addEventListener: () => {},
    removeEventListener: () => {},
  })) as unknown as typeof window.matchMedia;
}

beforeEach(() => {
  setReducedMotion(false);
  // biome-ignore lint/suspicious/noExplicitAny: test stub
  (window as any).IntersectionObserver = class {
    cb: (e: Partial<IntersectionObserverEntry>[]) => void;
    constructor(cb: (e: Partial<IntersectionObserverEntry>[]) => void) {
      this.cb = cb;
      trigger = () => this.cb([{ isIntersecting: true }]);
    }
    observe() {}
    disconnect() {}
  };
});

describe("Snapshot data", () => {
  it("has strengths, numeric stats and problem areas", () => {
    const s = content.snapshot;
    expect(s.strengths.length).toBeGreaterThan(0);
    expect(s.problemAreas.length).toBeGreaterThan(0);
    expect(s.stats.find((x) => x.label.match(/years/i))?.value).toBe(13);
  });
});

describe("Snapshot", () => {
  it("AC1: renders strengths, stats and problem areas from content", () => {
    setReducedMotion(true);
    render(<Snapshot />);
    for (const s of content.snapshot.strengths) expect(screen.getByText(s.title)).toBeInTheDocument();
    for (const p of content.snapshot.problemAreas) expect(screen.getByText(p)).toBeInTheDocument();
  });

  it("AC2: reduced motion shows final values immediately", () => {
    setReducedMotion(true);
    render(<Snapshot />);
    expect(screen.getByTestId("stat-years")).toHaveTextContent("13+");
  });

  it("AC2: counts up after scrolling into view", async () => {
    render(<Snapshot />);
    expect(screen.getByTestId("stat-years")).toHaveTextContent("0+");
    act(() => trigger());
    await waitFor(() => expect(screen.getByTestId("stat-years")).toHaveTextContent("13+"), {
      timeout: 2500,
    });
  });
});
