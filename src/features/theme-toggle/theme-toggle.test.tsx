import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
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
});
