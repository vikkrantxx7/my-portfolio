import { act, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { SiteNav } from "./site-nav";

type IOCallback = (entries: Partial<IntersectionObserverEntry>[]) => void;
let scrollPosition = 0;
const ioCallback: IOCallback = (entries) => {
  const hit = entries.find((entry) => entry.isIntersecting);
  const index = ["work", "experience", "about"].indexOf(hit?.target?.id ?? "");
  scrollPosition = index < 0 ? 0 : 500 + index * 1000;
  window.dispatchEvent(new Event("scrollend"));
};

function setReducedMotion(reduce: boolean) {
  window.matchMedia = ((query: string) => ({
    matches: reduce && query.includes("reduce"),
    media: query,
    addEventListener: () => {},
    removeEventListener: () => {},
  })) as unknown as typeof window.matchMedia;
}

beforeEach(() => {
  scrollPosition = 0;
  vi.spyOn(window, "scrollY", "get").mockImplementation(() => scrollPosition);
  vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockImplementation(function (
    this: HTMLElement,
  ) {
    const index = ["work", "experience", "about"].indexOf(this.id);
    return {
      top: index < 0 ? 0 : 500 + index * 1000 - scrollPosition,
      left: 0,
      width: 100,
      height: 30,
    } as DOMRect;
  });
  document.body.innerHTML = "";
  for (const id of ["work", "experience", "about"]) {
    const s = document.createElement("section");
    s.id = id;
    document.body.appendChild(s);
  }
  Element.prototype.scrollIntoView = vi.fn();
  setReducedMotion(false);
});

describe("SiteNav", () => {
  it("shows the profile photo inside the monogram badge", () => {
    const { container } = render(<SiteNav />);
    const img = container.querySelector("img[data-avatar]");
    expect(img).toHaveAttribute("src", "https://avatars.githubusercontent.com/u/37444378?v=4");
  });

  it("AC1: shows name, section links and a resume viewer trigger", () => {
    render(<SiteNav />);
    const nav = screen.getByRole("navigation", { name: /primary/i });
    expect(within(nav).getByRole("link", { name: "Vikrant Sharma" })).toBeInTheDocument();
    for (const l of ["Work", "Experience", "About"]) {
      expect(within(nav).getByRole("link", { name: l })).toBeInTheDocument();
    }
    expect(within(nav).getByRole("button", { name: /resume/i })).toBeInTheDocument();
  });

  it("opens the in-app resume viewer from the header", async () => {
    render(<SiteNav />);
    const nav = screen.getByRole("navigation", { name: /primary/i });
    await userEvent.click(within(nav).getByRole("button", { name: /resume/i }));
    expect(screen.getByRole("dialog", { name: /resume/i })).toBeInTheDocument();
  });

  it("shows the role as a subheading under the name", () => {
    render(<SiteNav />);
    const nav = screen.getByRole("navigation", { name: /primary/i });
    const name = within(nav).getByRole("link", { name: "Vikrant Sharma" });
    expect(within(name).getByText("Lead Fullstack Engineer")).toBeInTheDocument();
  });

  it("marks the name link for the hover glow treatment", () => {
    render(<SiteNav />);
    const nav = screen.getByRole("navigation", { name: /primary/i });
    expect(within(nav).getByRole("link", { name: "Vikrant Sharma" })).toHaveClass("header-name");
  });

  it("keeps the hover glow on the name letters, not the role subheading", () => {
    render(<SiteNav />);
    const nav = screen.getByRole("navigation", { name: /primary/i });
    const name = within(nav).getByRole("link", { name: "Vikrant Sharma" });
    const glow = name.querySelector(".header-glow");
    expect(glow).not.toBeNull();
    expect(glow?.textContent).toContain("Vikrant Sharma");
    expect(glow?.textContent).not.toContain("Lead Fullstack Engineer");
  });

  it("keeps the name on a single line so it never spills onto the progress ribbon", () => {
    render(<SiteNav />);
    const nav = screen.getByRole("navigation", { name: /primary/i });
    const name = within(nav).getByRole("link", { name: "Vikrant Sharma" });
    expect(name).toHaveClass("whitespace-nowrap");
    expect(name).toHaveClass("shrink-0");
  });

  it("shows the role line only where the header has room for it", () => {
    render(<SiteNav />);
    const nav = screen.getByRole("navigation", { name: /primary/i });
    const name = within(nav).getByRole("link", { name: "Vikrant Sharma" });
    const role = within(name).getByText("Lead Fullstack Engineer");
    expect(role).toHaveClass("hidden");
    expect(role).toHaveClass("min-[880px]:block");
  });

  it("shortens the resume label as soon as the word fits", () => {
    render(<SiteNav />);
    const nav = screen.getByRole("navigation", { name: /primary/i });
    const trigger = within(nav).getByRole("button", { name: /resume/i });
    const icon = trigger.querySelector("svg");
    expect(icon).not.toBeNull();
    expect(icon).toHaveClass("min-[830px]:hidden");
    expect(within(trigger).getByText("Resume")).toHaveClass(
      "hidden",
      "min-[830px]:inline",
      "lg:hidden",
    );
    expect(within(trigger).getByText("View Resume")).toHaveClass("hidden", "lg:inline");
  });

  it("tightens the header gaps below the large breakpoint", () => {
    const { container } = render(<SiteNav />);
    const list = container.querySelector('[aria-label="Portfolio sections"] ul');
    expect(list).not.toBeNull();
    expect(list).toHaveClass("gap-5");
    expect(list).toHaveClass("lg:gap-8");
    const group = screen.getByRole("link", { name: "Blog" })?.closest("div");
    expect(group).toHaveClass("gap-5");
    expect(group).toHaveClass("lg:gap-8");
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

  it.each([false, true])("returns to document top with reduced motion %s", async (reduce) => {
    setReducedMotion(reduce);
    const scroll = vi.spyOn(window, "scrollTo").mockImplementation(() => {});
    render(<SiteNav />);
    await userEvent.click(screen.getByRole("link", { name: "Vikrant Sharma" }));
    expect(scroll).toHaveBeenCalledWith({ top: 0, behavior: reduce ? "auto" : "smooth" });
    expect(Element.prototype.scrollIntoView).not.toHaveBeenCalled();
    scroll.mockRestore();
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

  it("selects a clicked destination immediately without intermediate highlights", async () => {
    render(<SiteNav />);
    const nav = screen.getByRole("navigation", { name: /primary/i });
    await userEvent.click(within(nav).getByRole("link", { name: "About" }));
    expect(within(nav).getByRole("link", { name: "About" })).toHaveAttribute(
      "aria-current",
      "true",
    );
    expect(within(nav).getByRole("link", { name: "Work" })).not.toHaveAttribute("aria-current");
  });

  it("clears the selection immediately when the header name is clicked", async () => {
    render(<SiteNav />);
    const nav = screen.getByRole("navigation", { name: /primary/i });
    act(() =>
      ioCallback([{ isIntersecting: true, target: document.getElementById("work") as Element }]),
    );
    expect(within(nav).getByRole("link", { name: "Work" })).toHaveAttribute("aria-current", "true");
    await userEvent.click(within(nav).getByRole("link", { name: "Vikrant Sharma" }));
    for (const label of ["Work", "Experience", "About"]) {
      expect(within(nav).getByRole("link", { name: label })).not.toHaveAttribute("aria-current");
    }
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
    expect(screen.getByTestId("dock-ignition")).toBeInTheDocument();
    const focus = vi.spyOn(HTMLElement.prototype, "focus");
    const scroll = vi.fn(() => {
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
    Element.prototype.scrollIntoView = scroll;
    await user.click(within(screen.getByRole("dialog")).getByRole("link", { name: "Work" }));
    await waitFor(() => expect(scroll).toHaveBeenCalledTimes(1));
    expect(focus).toHaveBeenCalledWith({ preventScroll: true });
  });

  it("opens and closes the mobile menu with no ignition under reduced motion", async () => {
    setReducedMotion(true);
    render(<SiteNav />);
    await userEvent.click(screen.getByRole("button", { name: /open menu/i }));
    expect(screen.getByRole("dialog", { name: /menu/i })).toBeInTheDocument();
    expect(screen.queryByTestId("dock-ignition")).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: /close menu/i }));
    expect(screen.queryByRole("dialog", { name: /menu/i })).not.toBeInTheDocument();
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
    ).toEqual(["About", "Blog"]);
    const cv = within(right).getByRole("button", { name: "CV" });
    await user.click(cv);
    expect(screen.getByRole("dialog", { name: /resume/i })).toBeInTheDocument();
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

  it("removes the tap delay on dock controls", async () => {
    const user = userEvent.setup();
    render(<SiteNav />);
    const toggle = screen.getByRole("button", { name: /open menu/i });
    expect(toggle).toHaveClass("touch-manipulation");
    await user.click(toggle);
    const dialog = screen.getByRole("dialog", { name: /menu/i });
    expect(within(dialog).getByRole("link", { name: "Work" })).toHaveClass("touch-manipulation");
  });

  it("mounts the scroll progress ribbon at the bottom of the sticky header", () => {
    render(<SiteNav />);
    const header = screen.getByRole("banner");
    const bar = within(header).getByRole("progressbar", { name: /page scroll progress/i });
    expect(bar).toHaveClass("absolute", "bottom-0");
  });
});
