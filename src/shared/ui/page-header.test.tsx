import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { PageHeader } from "./page-header";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("PageHeader scroll progress", () => {
  it("shows restored document progress inside the desktop header", () => {
    vi.spyOn(window, "scrollY", "get").mockReturnValue(500);
    vi.spyOn(window, "innerHeight", "get").mockReturnValue(1000);
    vi.spyOn(document.documentElement, "scrollHeight", "get").mockReturnValue(2000);

    render(
      <PageHeader actions={<button type="button">Theme</button>}>Article navigation</PageHeader>,
    );

    const bar = screen.getByRole("progressbar", { name: "Page scroll progress" });
    expect(bar).toHaveAttribute("aria-valuenow", "50");
    expect(bar).toHaveClass("opacity-100");
    expect(bar.closest("header")).toHaveClass("hidden", "md:block");
  });

  it("updates the ribbon and head as the document scrolls", async () => {
    const scroll = vi.spyOn(window, "scrollY", "get").mockReturnValue(0);
    vi.spyOn(window, "innerHeight", "get").mockReturnValue(1000);
    vi.spyOn(document.documentElement, "scrollHeight", "get").mockReturnValue(2000);

    render(<PageHeader actions={null}>Project navigation</PageHeader>);
    const bar = screen.getByRole("progressbar", { name: "Page scroll progress" });
    expect(bar).toHaveClass("opacity-0");

    scroll.mockReturnValue(1000);
    fireEvent.scroll(window);

    await waitFor(() => expect(bar).toHaveAttribute("aria-valuenow", "100"));
    expect(bar.querySelector("[data-head]")).toHaveStyle({ left: "100%" });
  });

  it("keeps the ribbon hidden on pages without scrollable content", () => {
    vi.spyOn(window, "scrollY", "get").mockReturnValue(0);
    vi.spyOn(window, "innerHeight", "get").mockReturnValue(1000);
    vi.spyOn(document.documentElement, "scrollHeight", "get").mockReturnValue(1000);

    render(<PageHeader actions={null}>Collection navigation</PageHeader>);

    const bar = screen.getByRole("progressbar", { name: "Page scroll progress" });
    expect(bar).toHaveAttribute("aria-valuenow", "0");
    expect(bar).toHaveClass("opacity-0");
  });
});
