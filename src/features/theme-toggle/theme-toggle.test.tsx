import { readFileSync } from "node:fs";
import path from "node:path";
import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { THEME_TRANSITION_SECONDS } from "./theme";
import { ThemeToggle } from "./theme-toggle";

afterEach(() => {
  document.documentElement.className = "";
  localStorage.clear();
});

describe("ThemeToggle", () => {
  it("switches between dark and light and updates its label", () => {
    render(<ThemeToggle />);
    const btn = screen.getByRole("button", { name: "Switch to light theme" });
    fireEvent.click(btn);
    expect(document.documentElement.classList.contains("light")).toBe(true);
    expect(screen.getByRole("button", { name: "Switch to dark theme" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });

  it("shows a pointer cursor", () => {
    render(<ThemeToggle />);
    expect(screen.getByRole("button", { name: "Switch to light theme" })).toHaveClass(
      "cursor-pointer",
    );
  });

  it("animates its icon for the same duration as the theme burn transition", () => {
    // The sun/moon arc must read its speed from the same constant the burn CSS uses.
    const css = readFileSync(
      path.resolve(__dirname, "../../../src/styles.css"),
      "utf8",
    );
    expect(css).toContain(`--theme-transition: ${THEME_TRANSITION_SECONDS}s`);
    expect(css).toContain("animation: theme-burn-in var(--theme-transition)");
    expect(css).toContain("animation: theme-burn-out var(--theme-transition)");
  });
});
