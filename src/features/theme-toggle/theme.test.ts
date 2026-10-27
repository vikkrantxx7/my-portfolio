import { afterEach, describe, expect, it, vi } from "vitest";
import { applyTheme, contrastRatio, parseTheme, switchTheme } from "./theme";

afterEach(() => {
  document.documentElement.className = "";
  localStorage.clear();
  // biome-ignore lint/suspicious/noExplicitAny: test cleanup
  delete (document as any).startViewTransition;
});

describe("theme", () => {
  it("defaults to dark and ignores invalid saved values", () => {
    expect(parseTheme(null)).toBe("dark");
    expect(parseTheme("purple")).toBe("dark");
    expect(parseTheme("light")).toBe("light");
  });

  it("applies the class and persists the choice", () => {
    applyTheme("light");
    expect(document.documentElement.classList.contains("light")).toBe(true);
    expect(localStorage.getItem("theme")).toBe("light");
    applyTheme("dark");
    expect(document.documentElement.classList.contains("light")).toBe(false);
    expect(document.documentElement.classList.contains("dark")).toBe(true);
  });

  it("burns from the toggle origin when view transitions are supported", () => {
    const start = vi.fn((cb: () => void) => cb());
    // biome-ignore lint/suspicious/noExplicitAny: stub
    (document as any).startViewTransition = start;
    switchTheme("light", false, { x: 1024, y: 40 });
    expect(start).toHaveBeenCalledOnce();
    expect(document.documentElement.dataset["themeBurn"]).toBe("light");
    expect(document.documentElement.style.getPropertyValue("--burn-x")).toBe("1024px");
    expect(document.documentElement.style.getPropertyValue("--burn-y")).toBe("40px");
    switchTheme("dark", false, { x: 1024, y: 40 });
    expect(document.documentElement.dataset["themeBurn"]).toBe("dark");
    switchTheme("light", false);
    expect(document.documentElement.classList.contains("light")).toBe(true);
  });

  it("falls back to a default origin near the top-right toggle", () => {
    const start = vi.fn((cb: () => void) => cb());
    // biome-ignore lint/suspicious/noExplicitAny: stub
    (document as any).startViewTransition = start;
    switchTheme("light", false);
    expect(document.documentElement.style.getPropertyValue("--burn-x")).toMatch(/px$/);
    expect(document.documentElement.style.getPropertyValue("--burn-y")).toMatch(/px$/);
  });

  it("switches instantly when reduced motion is requested", () => {
    const start = vi.fn();
    // biome-ignore lint/suspicious/noExplicitAny: stub
    (document as any).startViewTransition = start;
    switchTheme("light", true);
    expect(start).not.toHaveBeenCalled();
    expect(document.documentElement.classList.contains("light")).toBe(true);
  });
});

describe("light palette contrast", () => {
  const bg = "#F6F7FB";
  it.each([
    ["text", "#0E1220", 7],
    ["muted", "#4A5266", 7],
    ["accent", "#0A7C72", 4.5],
    ["violet", "#5B45D6", 4.5],
  ])("%s meets its ratio", (_n, fg, min) => {
    expect(contrastRatio(fg as string, bg)).toBeGreaterThanOrEqual(min as number);
  });
});
