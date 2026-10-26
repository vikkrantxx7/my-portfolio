import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { content } from "@/content/data";
import { validateContent } from "@/content/validate";
import { Contact } from "@/widgets/contact/contact";
import { EngineeringLab } from "./lab";

describe("Engineering lab", () => {
  it("renders one card per lab entry from the content data", () => {
    render(<EngineeringLab />);
    const section = screen.getByRole("region", { name: /engineering lab/i });
    expect(within(section).getAllByRole("article")).toHaveLength(content.lab.length);
    for (const entry of content.lab) expect(screen.getByText(entry.title)).toBeInTheDocument();
  });

  it("rejects lab links to achievements that do not exist", () => {
    const bad = { ...content, lab: [{ ...content.lab[0], achievementRef: "adidas/nope" }] };
    expect(validateContent(bad as typeof content)).toContain("Unknown lab achievement: adidas/nope");
  });
});

describe("Contact", () => {
  it("offers email, LinkedIn and GitHub with accessible labels", () => {
    render(<Contact />);
    expect(screen.getByRole("link", { name: /email vikrant/i })).toHaveAttribute(
      "href",
      `mailto:${content.profile.email}`,
    );
    expect(screen.getByRole("link", { name: /linkedin profile/i })).toHaveAttribute(
      "href",
      content.profile.links.linkedin,
    );
    expect(screen.getByRole("link", { name: /github profile/i })).toHaveAttribute(
      "href",
      content.profile.links.github,
    );
  });

  it("copies the email address and confirms it", async () => {
    const user = userEvent.setup();
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText } });
    render(<Contact />);
    await user.click(screen.getByRole("button", { name: /copy email address/i }));
    expect(writeText).toHaveBeenCalledWith(content.profile.email);
    expect(await screen.findByRole("status")).toHaveTextContent("Email copied");
  });
});
