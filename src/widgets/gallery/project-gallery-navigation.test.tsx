import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { renderWithRouter } from "@/test/render-with-router";
import { ProjectGallery } from "./project-gallery";

describe("Gallery case-study navigation", () => {
  it("opens a case study in-app instead of reloading the whole page", async () => {
    const { router } = await renderWithRouter(() => (
      <ProjectGallery filters={{}} onFiltersChange={vi.fn()} />
    ));
    const link = await screen.findByRole("link", { name: "Open case study: PrepForge" });
    expect(link).toHaveAttribute("href", "/projects/prepforge");
    await userEvent.setup().click(link);
    expect(await screen.findByRole("heading", { name: "Case study page" })).toBeInTheDocument();
    expect(router.state.location.pathname).toBe("/projects/prepforge");
  });
});
