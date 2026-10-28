import { describe, expect, it } from "vitest";
import { content } from "@/content/data";
import { projectArtwork } from "./project-artwork";

describe("Project artwork theme variants", () => {
  it("gives every project with artwork a distinct dark and light variant", () => {
    const withArtwork = content.projects.filter((p) => projectArtwork[p.slug]);
    expect(withArtwork.length).toBeGreaterThan(0);
    for (const project of withArtwork) {
      const art = projectArtwork[project.slug];
      if (!art) throw new Error(`Artwork missing for ${project.slug}`);
      expect(art.dark).toMatch(/^\/\S+/);
      expect(art.light).toMatch(/^\/\S+/);
      expect(art.light).not.toBe(art.dark);
    }
  });

  it("covers both resume-backed projects", () => {
    for (const slug of ["prepforge", "git-contributor-stats"]) {
      expect(projectArtwork[slug]).toBeDefined();
    }
  });
});
