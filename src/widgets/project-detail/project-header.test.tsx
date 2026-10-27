import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { renderWithRouter } from "@/test/render-with-router";
import { ProjectHeader } from "./project-header";

describe("ProjectHeader", () => {
  it("offers a back link and a theme toggle", async () => {
    await renderWithRouter(<ProjectHeader />);
    expect(await screen.findByRole("link", { name: /selected work/i })).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: /switch to/i }).length).toBeGreaterThan(0);
  });
});
