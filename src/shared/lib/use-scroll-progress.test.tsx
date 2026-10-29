import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useScrollProgress } from "./use-scroll-progress";

afterEach(() => vi.restoreAllMocks());

function scroll(y: number, height = 2000) {
  vi.spyOn(window, "scrollY", "get").mockReturnValue(y);
  vi.spyOn(window, "innerHeight", "get").mockReturnValue(1000);
  vi.spyOn(document.documentElement, "scrollHeight", "get").mockReturnValue(height);
}

describe("useScrollProgress", () => {
  it("reports zero at the top, half midway, and one at the bottom", async () => {
    scroll(0);
    const { result } = renderHook(() => useScrollProgress());
    expect(result.current).toBe(0);
    scroll(500);
    act(() => window.dispatchEvent(new Event("scroll")));
    await waitFor(() => expect(result.current).toBe(0.5));
    scroll(1000);
    act(() => window.dispatchEvent(new Event("scroll")));
    await waitFor(() => expect(result.current).toBe(1));
  });

  it("clamps overscroll and reports zero for a page that cannot scroll", async () => {
    scroll(-100);
    const { result } = renderHook(() => useScrollProgress());
    expect(result.current).toBe(0);
    scroll(1200);
    act(() => window.dispatchEvent(new Event("scroll")));
    await waitFor(() => expect(result.current).toBe(1));
    scroll(0, 900);
    act(() => window.dispatchEvent(new Event("resize")));
    await waitFor(() => expect(result.current).toBe(0));
  });

  it("reads restored scroll on mount and updates when content grows", async () => {
    scroll(500);
    let resize: ResizeObserverCallback | undefined;
    vi.stubGlobal("ResizeObserver", class {
      constructor(callback: ResizeObserverCallback) { resize = callback; }
      observe() {}
      disconnect() {}
    });
    const { result, unmount } = renderHook(() => useScrollProgress());
    expect(result.current).toBe(0.5);
    scroll(500, 3000);
    act(() => resize?.([], {} as ResizeObserver));
    await waitFor(() => expect(result.current).toBe(0.25));
    unmount();
    vi.unstubAllGlobals();
  });
});