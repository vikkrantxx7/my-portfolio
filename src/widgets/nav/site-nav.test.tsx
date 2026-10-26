import { act, render, screen, waitFor, within } from "@testing-library/react";
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
  it("shows the profile photo inside the monogram badge", () => {
    const { container } = render(<SiteNav />);
    const img = container.querySelector("img[data-avatar]");
    expect(img).toHaveAttribute("src", "https://avatars.githubusercontent.com/u/37444378?v=4");
  });

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

  it("closes the mobile menu before measuring the section and restores focus without scrolling", async () => {
    const user = userEvent.setup();
    render(<SiteNav />);
    await user.click(screen.getByRole("button", { name: /open menu/i }));
    const focus = vi.spyOn(HTMLElement.prototype, "focus");
    const scroll = vi.fn(() => {
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
    Element.prototype.scrollIntoView = scroll;
    await user.click(within(screen.getByRole("dialog")).getByRole("link", { name: "Work" }));
    await waitFor(() => expect(scroll).toHaveBeenCalledTimes(1));
    expect(focus).toHaveBeenCalledWith({ preventScroll: true });
  });

  it("mobile dock sits at the bottom and opens symmetric wings with icon items", async () => {
    const user = userEvent.setup();
    render(<SiteNav />);
    const toggle = screen.getByRole("button", { name: /open menu/i });
    expect(toggle.closest("[data-dock]")).toHaveClass("fixed", "bottom-0");
    await user.click(toggle);
    const dialog = screen.getByRole("dialog", { name: /menu/i });
    const left = within(dialog).getByTestId("dock-left");
    const right = within(dialog).getByTestId("dock-right");
    expect(
      within(left)
        .getAllByRole("link")
        .map((l) => l.textContent),
    ).toEqual(["Work", "Experience"]);
    expect(
      within(right)
        .getAllByRole("link")
        .map((l) => l.textContent),
    ).toEqual(["About", "CV"]);
    expect(within(right).getByRole("link", { name: "CV" })).toHaveAttribute("href", "/resume.pdf");
    expect(dialog.querySelectorAll("svg").length).toBeGreaterThanOrEqual(4);
  });

  it("mobile dock marks the active section", async () => {
    const user = userEvent.setup();
    render(<SiteNav />);
    act(() => {
      ioCallback([{ isIntersecting: true, target: document.getElementById("about") as Element }]);
    });
    await user.click(screen.getByRole("button", { name: /open menu/i }));
    const dialog = screen.getByRole("dialog");
    expect(within(dialog).getByRole("link", { name: "About" })).toHaveAttribute(
      "aria-current",
      "true",
    );
  });

  it("leaves page content under the dock tappable", async () => {
    const user = userEvent.setup();
    render(<SiteNav />);
    const toggle = screen.getByRole("button", { name: /open menu/i });
    const dock = toggle.closest("[data-dock]") as HTMLElement;
    // The full-width fixed wrapper must not swallow taps aimed at the page beneath it.
    expect(dock).toHaveClass("pointer-events-none");
    expect(toggle).toHaveClass("pointer-events-auto");
    await user.click(toggle);
    const dialog = screen.getByRole("dialog", { name: /menu/i });
    expect(dialog).toHaveClass("pointer-events-auto");
    expect(within(dialog).getByRole("link", { name: "Work" })).toBeInTheDocument();
  });

  it("mounts the scroll progress ribbon at the bottom of the sticky header", () => {
    render(<SiteNav />);
    const header = screen.getByRole("banner");
    const bar = within(header).getByRole("progressbar", { name: /page scroll progress/i });
    expect(bar).toHaveClass("absolute", "bottom-0");
  });
});
