import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { renderWithRouter } from "@/test/render-with-router";
import { ProjectBackLink } from "./project-back-link";

describe("Project return link", () => {
  it("links back to the selected work section", async () => {
    await renderWithRouter(() => <ProjectBackLink />);
    const link = screen.getByRole("link", { name: /selected work/i });
    expect(link).toHaveAttribute("href", "/#work");
  });

  it("stays hidden until the viewport reaches desktop width", async () => {
    await renderWithRouter(() => <ProjectBackLink />);
    const link = screen.getByRole("link", { name: /selected work/i });
    // The mobile project dock already carries a Work action, so this link must
    // only appear from the md breakpoint up.
    expect(link.className).toContain("hidden");
    expect(link.className).toContain("md:inline-flex");
  });
});
