import { describe, expect, it } from "vitest";
import { content } from "@/content/data";
import { filterProjects, validateProjectSearch } from "./filter-projects";

describe("Project filtering", () => {
  it("includes only featured projects by default", () => {
    const first = content.projects[0];
    if (!first) throw new Error("A project fixture is required");
    expect(
      filterProjects([...content.projects, { ...first, slug: "hidden", featured: false }], {}).map(
        (p) => p.slug,
      ),
    ).toEqual(["prepforge", "git-contributor-stats"]);
  });
  it("filters by exact technology and intersects domain", () => {
    expect(filterProjects(content.projects, { tech: "Fastify" }).map((p) => p.slug)).toEqual([
      "prepforge",
    ]);
    expect(
      filterProjects(content.projects, { domain: "Developer Tools" }).map((p) => p.slug),
    ).toEqual(["git-contributor-stats"]);
    expect(
      filterProjects(content.projects, { tech: "Fastify", domain: "Developer Tools" }),
    ).toEqual([]);
    expect(filterProjects(content.projects, { tech: "TypeScript" })).toHaveLength(2);
  });
  it("keeps unknown filters for the empty state and rejects non-string URL values", () => {
    expect(validateProjectSearch({ tech: "Rust", domain: "Open Source", other: 1 })).toEqual({
      tech: "Rust",
      domain: "Open Source",
    });
    expect(validateProjectSearch({ tech: ["Fastify"], domain: 3 })).toEqual({});
    expect(filterProjects(content.projects, { tech: "Rust" })).toEqual([]);
  });
});
