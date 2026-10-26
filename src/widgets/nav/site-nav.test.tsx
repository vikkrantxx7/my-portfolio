import { act, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { SiteNav } from "./site-nav";

type IOCallback = (entries: Partial<IntersectionObserverEntry>[]) => void;
let ioCallback: IOCallback = () => {};

function setReducedMotion(reduce: boolean) {
  window.matchMedia = ((query: string) => ({
    matches: reduce && query.includes("reduce"),
    media: query,
    addEventListener: () => {},
    removeEventListener: () => {},
  })) as unknown as typeof window.matchMedia;
}

beforeEach(() => {
  document.body.innerHTML = "";
  for (const id of ["work", "experience", "about"]) {
    const s = document.createElement("section");
    s.id = id;
    document.body.appendChild(s);
  }
  Element.prototype.scrollIntoView = vi.fn();
  setReducedMotion(false);
  // biome-ignore lint/suspicious/noExplicitAny: test stub
  (window as any).IntersectionObserver = class {
    constructor(cb: IOCallback) {
      ioCallback = cb;
    }
    observe() {}
    disconnect() {}
  };
});

describe("SiteNav", () => {
  it("AC1: shows name, section links and resume PDF", () => {
    render(<SiteNav />);
    const nav = screen.getByRole("navigation", { name: /primary/i });
    expect(within(nav).getByText("Vikrant Sharma")).toBeInTheDocument();
    for (const l of ["Work", "Experience", "About"]) {
      expect(within(nav).getByRole("link", { name: l })).toBeInTheDocument();
    }
    expect(within(nav).getByRole("link", { name: /resume/i })).toHaveAttribute(
      "href",
      "/resume.pdf",
    );
  });

  it("AC2: smooth-scrolls to the section", async () => {
    render(<SiteNav />);
    const nav = screen.getByRole("navigation", { name: /primary/i });
    await userEvent.click(within(nav).getByRole("link", { name: "Work" }));
    expect(Element.prototype.scrollIntoView).toHaveBeenCalledWith({
      behavior: "smooth",
      block: "start",
    });
  });

  it("AC2: scrolls instantly with reduced motion", async () => {
    setReducedMotion(true);
    render(<SiteNav />);
    const nav = screen.getByRole("navigation", { name: /primary/i });
    await userEvent.click(within(nav).getByRole("link", { name: "Experience" }));
    expect(Element.prototype.scrollIntoView).toHaveBeenCalledWith({
      behavior: "auto",
      block: "start",
    });
  });

  it("AC3: highlights the section on screen", () => {
    render(<SiteNav />);
    act(() => {
      ioCallback([
        { isIntersecting: true, target: document.getElementById("experience") as Element },
      ]);
    });
    const nav = screen.getByRole("navigation", { name: /primary/i });
    expect(within(nav).getByRole("link", { name: "Experience" })).toHaveAttribute(
      "aria-current",
      "true",
    );
    expect(within(nav).getByRole("link", { name: "Work" })).not.toHaveAttribute("aria-current");
  });

  it("AC4: mobile menu opens, traps focus and closes on Esc", async () => {
    const user = userEvent.setup();
    render(<SiteNav />);
    const toggle = screen.getByRole("button", { name: /open menu/i });
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    await user.click(toggle);
    const dialog = screen.getByRole("dialog", { name: /menu/i });
    const links = within(dialog).getAllByRole("link");
    expect(links[0]).toHaveFocus();
    // Shift+Tab from first wraps to last focusable
    await user.tab({ shift: true });
    expect(dialog.contains(document.activeElement)).toBe(true);
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: /open menu/i })).toHaveFocus();
  });
});
