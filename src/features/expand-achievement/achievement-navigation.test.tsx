import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { EngineeringLab } from "@/widgets/lab/lab";
import { CareerTimeline } from "@/widgets/timeline/timeline";

afterEach(() => {
  window.history.replaceState(null, "", "/");
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe("lab achievement navigation", () => {
  it.each([false, true])("reveals the target with reduced motion = %s", async (reduced) => {
    window.matchMedia = vi.fn().mockReturnValue({
      matches: reduced,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    });
    const scroll = vi.fn();
    Element.prototype.scrollIntoView = scroll;
    const push = vi.spyOn(window.history, "pushState");
    render(
      <>
        <CareerTimeline />
        <EngineeringLab />
      </>,
    );
    const link = screen.getAllByRole("link", { name: "See it in my career timeline" })[0];
    if (!link) throw new Error("Lab link required");
    const target = document.getElementById("exp-adidas-rspack-optimization");
    if (!target) throw new Error("Achievement target required");
    fireEvent.click(link);
    expect(target).toHaveAttribute("aria-expanded", "true");
    await waitFor(() =>
      expect(scroll).toHaveBeenCalledWith({
        behavior: reduced ? "auto" : "smooth",
        block: "start",
      }),
    );
    if (!reduced) fireEvent(window, new Event("scrollend"));
    expect(target).toHaveAttribute("aria-current", "location");
    expect(window.location.hash).toBe("#exp-adidas-rspack-optimization");
    expect(push).not.toHaveBeenCalled();
    vi.useFakeTimers();
    // Repeat clicks work even when the URL already points at this achievement.
    fireEvent.click(link);
    act(() => vi.advanceTimersByTime(1500));
    expect(target).toHaveAttribute("aria-expanded", "true");
    expect(target).toHaveAttribute("aria-current", "location");
    act(() => vi.advanceTimersByTime(2000));
    expect(target).not.toHaveAttribute("aria-current");
  });
});
