import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { content } from "@/content/data";
import { CareerTimeline } from "./timeline";

const role = content.experiences[0];
const achievement = role?.achievements[0];
if (!role || !achievement) throw new Error("Timeline fixtures require a role and achievement");

beforeEach(() => {
  window.matchMedia = ((query: string) => ({
    matches: query.includes("reduce"),
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => true,
    addEventListener: () => {},
    removeEventListener: () => {},
  })) as typeof window.matchMedia;
  Element.prototype.scrollIntoView = vi.fn();
});

afterEach(() => {
  window.location.hash = "";
  vi.restoreAllMocks();
});

describe("Career timeline", () => {
  it("shows roles newest first, dates, and collapsed achievements", () => {
    render(<CareerTimeline />);
    expect(screen.getAllByRole("heading", { level: 3 }).map((h) => h.textContent)).toEqual([
      "adidas",
      "UKG",
      "Infosys",
    ]);
    expect(screen.getByText("Dec 2021").parentElement).toHaveTextContent("Dec 2021 — Present");
    expect(screen.getByText("Jun 2019").parentElement).toHaveTextContent("Jun 2019 — Nov 2021");
    expect(screen.getByText("Sep 2013").parentElement).toHaveTextContent("Sep 2013 — May 2019");
    for (const experience of content.experiences) {
      expect(screen.getByText(experience.role)).toBeInTheDocument();
      for (const item of experience.achievements) {
        expect(screen.getByRole("button", { name: item.summary })).toHaveAttribute(
          "aria-expanded",
          "false",
        );
      }
    }
    expect(screen.queryByRole("region", { name: achievement.summary })).not.toBeInTheDocument();
  });

  it("click reveals every detail and a second click closes it", async () => {
    const user = userEvent.setup();
    render(<CareerTimeline />);
    const trigger = screen.getByRole("button", { name: achievement.summary });
    await user.click(trigger);
    expect(trigger).toHaveAttribute("aria-expanded", "true");
    const details = screen.getByRole("region", { name: achievement.summary });
    expect(trigger).toHaveAttribute("aria-controls", details.id);
    for (const value of [
      achievement.context,
      achievement.contribution,
      achievement.impact,
      ...achievement.decisions,
    ]) {
      expect(within(details).getByText(value)).toBeInTheDocument();
    }
    await user.click(trigger);
    await waitFor(() =>
      expect(screen.queryByRole("region", { name: achievement.summary })).not.toBeInTheDocument(),
    );
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    expect(trigger).toHaveFocus();
  });

  it("Enter and Space toggle while multiple achievements remain open", async () => {
    const user = userEvent.setup();
    render(<CareerTimeline />);
    const triggers = screen.getAllByRole("button");
    const first = triggers[0];
    const second = triggers[1];
    if (!first || !second) throw new Error("Two achievements required");
    first.focus();
    await user.keyboard("{Enter}");
    second.focus();
    await user.keyboard(" ");
    expect(first).toHaveAttribute("aria-expanded", "true");
    expect(second).toHaveAttribute("aria-expanded", "true");
    expect(
      screen.getAllByRole("region").filter((region) => region.id.endsWith("-details")),
    ).toHaveLength(2);
    await user.keyboard(" ");
    expect(second).toHaveAttribute("aria-expanded", "false");
    expect(first).toHaveAttribute("aria-expanded", "true");
  });

  it("resolves related project references without inventing case-study pages", async () => {
    const user = userEvent.setup();
    render(
      <CareerTimeline
        experiences={[{ ...role, achievements: [{ ...achievement, projectSlugs: ["prepforge"] }] }]}
      />,
    );
    await user.click(screen.getByRole("button", { name: achievement.summary }));
    expect(screen.getByRole("link", { name: /PrepForge/ })).toHaveAttribute("href", "#work");
  });
});

describe("Achievement deep links", () => {
  const hash = "#exp-adidas-graphql-bff";

  it("opening a bullet replaces the address without adding a history entry, and closing clears it", async () => {
    const user = userEvent.setup();
    const replaceState = vi.spyOn(window.history, "replaceState");
    const pushState = vi.spyOn(window.history, "pushState");
    render(<CareerTimeline />);

    const trigger = screen.getByRole("button", { name: achievement.summary });
    await user.click(trigger);
    expect(replaceState).toHaveBeenCalledWith(null, "", expect.stringContaining(hash));
    expect(pushState).not.toHaveBeenCalled();

    await user.click(trigger);
    expect(replaceState.mock.lastCall?.[2]).not.toContain("#exp-");
  });

  it("a deep link URL opens and scrolls to that achievement", async () => {
    window.location.hash = hash;
    render(<CareerTimeline />);
    const trigger = screen.getByRole("button", { name: achievement.summary });
    await waitFor(() => expect(trigger).toHaveAttribute("aria-expanded", "true"));
    expect(trigger.scrollIntoView).toHaveBeenCalled();
    expect(window.location.hash).toBe(hash);
  });

  it("copy link copies the shareable URL and shows a confirmation", async () => {
    const user = userEvent.setup();
    render(<CareerTimeline />);
    await user.click(screen.getByRole("button", { name: achievement.summary }));
    await user.click(screen.getByRole("button", { name: "Copy link" }));
    expect(await navigator.clipboard.readText()).toBe(
      `${window.location.origin}${window.location.pathname}${hash}`,
    );
    expect(screen.getByRole("status")).toHaveTextContent("Link copied");
  });

  it("an unknown deep link is ignored", () => {
    window.location.hash = "#exp-nowhere-nothing";
    render(<CareerTimeline />);
    for (const trigger of screen.getAllByRole("button")) {
      expect(trigger).toHaveAttribute("aria-expanded", "false");
    }
    expect(screen.getByRole("button", { name: achievement.summary })).not.toHaveAttribute(
      "aria-expanded",
      "true",
    );
  });
});
