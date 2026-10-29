import { render, screen } from "@testing-library/react";
import { FileText } from "lucide-react";
import { describe, expect, it, vi } from "vitest";
import { DockBar, DockIcon, DockShell } from "./dock-shell";

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

describe("DockBar", () => {
  it("renders the shared pill with the requested tone", () => {
    render(
      <DockBar tone="fixed" data-testid="pill">
        <span>item</span>
      </DockBar>,
    );
    const pill = screen.getByTestId("pill");
    expect(pill.className).toContain("rounded-full");
    expect(pill.className).toContain("bg-[#080A0F]/90");
  });
});

describe("DockIcon", () => {
  it("uses the fixed cyan icon tone for docks floating over the resume paper", () => {
    render(<DockIcon icon={FileText} label="Save" tone="fixed" />);
    expect(screen.getByText("Save")).toBeInTheDocument();
    const icon = document.querySelector("svg");
    expect(icon?.className.baseVal ?? icon?.getAttribute("class")).toContain("text-[#62F4E0]");
  });

  it("defaults to the theme primary tone", () => {
    render(<DockIcon icon={FileText} label="Top" />);
    const icon = document.querySelector("svg");
    expect(icon?.className.baseVal ?? icon?.getAttribute("class")).toContain("text-primary");
  });
});
