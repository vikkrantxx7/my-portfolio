import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { DockShell } from "./dock-shell";

describe("DockShell reading progress", () => {
  it("reports the restored reading position when enabled", () => {
    vi.spyOn(window, "scrollY", "get").mockReturnValue(500);
    vi.spyOn(window, "innerHeight", "get").mockReturnValue(1000);
    vi.spyOn(document.documentElement, "scrollHeight", "get").mockReturnValue(2000);
    render(
      <DockShell label="Article controls" progress>
        <a href="#top">Top</a>
      </DockShell>,
    );
    expect(screen.getByRole("progressbar", { name: "Page scroll progress" })).toHaveAttribute(
      "aria-valuenow",
      "50",
    );
    vi.restoreAllMocks();
  });

  it("does not add reading progress to collection controls", () => {
    render(
      <DockShell label="Blog controls" size="compact">
        <a href="#top">Top</a>
      </DockShell>,
    );
    expect(screen.queryByRole("progressbar")).toBeNull();
  });
});
