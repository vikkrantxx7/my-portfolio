import { renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useTheme } from "./use-theme";

function setThemeClass(theme: "dark" | "light") {
  document.documentElement.classList.toggle("light", theme === "light");
  document.documentElement.classList.toggle("dark", theme === "dark");
}

describe("useTheme", () => {
  it("reads the current document theme", () => {
    setThemeClass("light");
    const { result } = renderHook(() => useTheme());
    expect(result.current).toBe("light");
  });

  it("defaults to dark when no theme class is set (SSR/first paint)", () => {
    document.documentElement.classList.remove("light", "dark");
    const { result } = renderHook(() => useTheme());
    expect(result.current).toBe("dark");
  });

  it("re-renders when the theme class changes on the document root", () => {
    setThemeClass("dark");
    const { result, rerender } = renderHook(() => useTheme());
    expect(result.current).toBe("dark");
    setThemeClass("light");
    rerender();
    expect(result.current).toBe("light");
    setThemeClass("dark");
    rerender();
    expect(result.current).toBe("dark");
  });
});
