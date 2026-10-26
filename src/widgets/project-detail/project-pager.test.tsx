import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { Project } from "@/content/types";
import { renderWithRouter } from "@/test/render-with-router";
import { adjacentProjects, ProjectPager } from "./project-pager";

const p = (slug: string) => ({ slug, title: `Title ${slug}` }) as Project;
const list = [p("a"), p("b"), p("c")];

describe("adjacentProjects", () => {
  it("returns previous and next around the current project", () => {
    expect(adjacentProjects(list, "b")).toEqual({ previous: list[0], next: list[2] });
  });
  it("has no previous on the first and no next on the last", () => {
    expect(adjacentProjects(list, "a").previous).toBeNull();
    expect(adjacentProjects(list, "c").next).toBeNull();
  });
  it("returns nothing for an unknown project", () => {
    expect(adjacentProjects(list, "zzz")).toEqual({ previous: null, next: null });
  });
});

describe("ProjectPager", () => {
  it("links to the previous and next case studies", async () => {
    await renderWithRouter(() => <ProjectPager projects={list} slug="b" />);
    expect(await screen.findByRole("link", { name: /previous project.*title a/i })).toHaveAttribute(
      "href",
      "/projects/a",
    );
    expect(screen.getByRole("link", { name: /next project.*title c/i })).toHaveAttribute(
      "href",
      "/projects/c",
    );
  });
  it("omits the missing side at the ends", async () => {
    await renderWithRouter(() => <ProjectPager projects={list} slug="a" />);
    await screen.findByRole("link", { name: /next project/i });
    expect(screen.queryByRole("link", { name: /previous project/i })).toBeNull();
  });
});
