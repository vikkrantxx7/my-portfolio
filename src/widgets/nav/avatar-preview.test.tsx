import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { AvatarPreview } from "./avatar-preview";

describe("AvatarPreview", () => {
  it("opens a profile card with the enlarged photo, handle, role and GitHub link", async () => {
    const user = userEvent.setup();
    render(<AvatarPreview />);
    await user.click(screen.getByRole("button", { name: /view profile photo/i }));
    const dialog = screen.getByRole("dialog", { name: "Vikrant Sharma" });
    expect(dialog.querySelector("img")).toHaveAttribute(
      "src",
      "https://avatars.githubusercontent.com/u/37444378?v=4",
    );
    expect(dialog).toHaveTextContent("@vikkrantxx7");
    expect(dialog).toHaveTextContent("Lead Fullstack Engineer");
    const links = screen.getAllByRole("link", { name: /github profile/i });
    for (const l of links) {
      expect(l).toHaveAttribute("href", "https://github.com/vikkrantxx7");
      expect(l).toHaveAttribute("target", "_blank");
      expect(l).toHaveAttribute("rel", expect.stringContaining("noopener"));
    }
    expect(links.length).toBe(2);
  });

  it("closes on Escape", async () => {
    const user = userEvent.setup();
    render(<AvatarPreview />);
    await user.click(screen.getByRole("button", { name: /view profile photo/i }));
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});
