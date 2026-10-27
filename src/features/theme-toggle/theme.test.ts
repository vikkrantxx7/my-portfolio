import { afterEach, describe, expect, it, vi } from "vitest";
import { applyTheme, contrastRatio, parseTheme, switchTheme, THEME_SCRIPT } from "./theme";

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

  const barColor = () =>
    [...document.querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]')].map((m) => m.content);

  it("syncs the browser bar colour (theme-color) with the theme via a single fresh tag", () => {
    const meta = document.createElement("meta");
    meta.name = "theme-color";
    meta.content = "#080A0F";
    document.head.appendChild(meta);
    applyTheme("light");
    expect(barColor()).toEqual(["#F6F7FB"]);
    // iOS latches the original element, so it must be replaced, not mutated.
    expect(meta.isConnected).toBe(false);
    applyTheme("dark");
    expect(barColor()).toEqual(["#080A0F"]);
  });

  it("pre-paint script creates the bar tag for the saved theme (head tags render after it)", () => {
    for (const m of document.querySelectorAll('meta[name="theme-color"]')) m.remove();
    localStorage.setItem("theme", "light");
    new Function(THEME_SCRIPT)();
    expect(barColor()).toEqual(["#F6F7FB"]);
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

  it("syncs the browser bar before the burn transition, for Safari builds that ignore mid-transition meta changes", async () => {
    const meta = document.createElement("meta");
    meta.name = "theme-color";
    meta.content = "#F6F7FB";
    document.head.appendChild(meta);
    // A transition whose callback has not run yet: the meta must already be updated.
    let runCallback: () => void = () => {};
    const start = vi.fn(
      (cb: () => void) =>
        ({
          finished: new Promise<void>((resolve) => {
            runCallback = () => {
              cb();
              resolve();
            };
          }),
        }) as unknown,
    );
    // biome-ignore lint/suspicious/noExplicitAny: stub
    (document as any).startViewTransition = start;

    switchTheme("dark", false, { x: 10, y: 10 });
    expect(barColor()).toEqual(["#080A0F"]);
    runCallback();
    await Promise.resolve();
    expect(barColor()).toEqual(["#080A0F"]);
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
