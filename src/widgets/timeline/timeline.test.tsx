import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";
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
