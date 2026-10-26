import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import type { Project } from "@/content/types";
import { renderWithRouter } from "@/test/render-with-router";
import { ProjectDock } from "./project-dock";

const p = (slug: string) => ({ slug, title: `Title ${slug}` }) as Project;
const list = [p("a"), p("b"), p("c")];

describe("ProjectDock", () => {
  it("stays open at the bottom with Prev, Work, Top and Next", async () => {
    await renderWithRouter(() => <ProjectDock projects={list} slug="b" />);
    const dock = await screen.findByRole("navigation", { name: /project controls/i });
    expect(dock).toHaveClass("fixed", "md:hidden");
    expect(screen.getByRole("link", { name: /previous project: title a/i })).toHaveAttribute(
      "href",
      "/projects/a",
    );
    expect(screen.getByRole("link", { name: /next project: title c/i })).toHaveAttribute(
      "href",
      "/projects/c",
    );
    expect(screen.getByRole("link", { name: /all work/i })).toHaveAttribute("href", "/#work");
  });

  it("disables Prev on the first project and Next on the last", async () => {
    await renderWithRouter(() => <ProjectDock projects={list} slug="a" />);
    await screen.findByRole("navigation", { name: /project controls/i });
    expect(screen.queryByRole("link", { name: /previous project/i })).toBeNull();
    expect(screen.getByText("Prev").closest("[aria-disabled]")).toHaveAttribute(
      "aria-disabled",
      "true",
    );
  });

  it("Top scrolls smoothly to the top", async () => {
    const spy = vi.spyOn(window, "scrollTo");
    await renderWithRouter(() => <ProjectDock projects={list} slug="b" />);
    await userEvent.click(await screen.findByRole("button", { name: /back to top/i }));
    expect(spy).toHaveBeenCalledWith({ top: 0, behavior: "smooth" });
  });
});
