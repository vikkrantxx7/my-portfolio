import { cleanup, fireEvent, render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { spawnDockRipple, useDockRipple } from "./dock-ripple";

function RippledButton() {
  const ripple = useDockRipple();
  return (
    <button type="button" {...ripple}>
      Tap
    </button>
  );
}

describe("dock ripple", () => {
  afterEach(cleanup);

  it("spawns a ripple centred on the pointer and removes it after the animation", () => {
    const { getByRole } = render(<RippledButton />);
    const button = getByRole("button");
    vi.spyOn(button, "getBoundingClientRect").mockReturnValue({
      x: 100,
      y: 200,
      left: 100,
      top: 200,
      right: 156,
      bottom: 248,
      width: 56,
      height: 48,
      toJSON: () => ({}),
    });

    fireEvent.pointerDown(button, { clientX: 128, clientY: 224 });

    const ripple = button.querySelector(".dock-ripple");
    expect(ripple).not.toBeNull();
    const size = Math.max(56, 48) * 2.4;
    expect((ripple as HTMLElement).style.width).toBe(`${size}px`);
    expect((ripple as HTMLElement).style.left).toBe(`${128 - 100 - size / 2}px`);
    expect((ripple as HTMLElement).style.top).toBe(`${224 - 200 - size / 2}px`);

    fireEvent.animationEnd(ripple as Element);
    expect(button.querySelector(".dock-ripple")).toBeNull();
  });

  it("removes the ripple even if the animation never finishes", () => {
    vi.useFakeTimers();
    const { getByRole } = render(<RippledButton />);
    const button = getByRole("button");
    fireEvent.pointerDown(button, { clientX: 10, clientY: 10 });
    expect(button.querySelector(".dock-ripple")).not.toBeNull();
    vi.advanceTimersByTime(800);
    expect(button.querySelector(".dock-ripple")).toBeNull();
    vi.useRealTimers();
  });

  it("skips the ripple when reduced motion is requested", () => {
    const original = window.matchMedia;
    window.matchMedia = vi.fn().mockReturnValue({
      matches: true,
      media: "(prefers-reduced-motion: reduce)",
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }) as unknown as typeof window.matchMedia;
    const { getByRole } = render(<RippledButton />);
    const button = getByRole("button");
    fireEvent.pointerDown(button, { clientX: 10, clientY: 10 });
    expect(button.querySelector(".dock-ripple")).toBeNull();
    window.matchMedia = original;
  });

  it("exposes spawnDockRipple as a plain handler", () => {
    expect(typeof spawnDockRipple).toBe("function");
  });
});
