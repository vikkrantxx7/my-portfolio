import { describe, expect, it } from "vitest";
import { content } from "./data";
import { validateContent } from "./validate";

describe("Repository-backed project content", () => {
  it("includes the supplied repository links and complete case studies", () => {
    expect(content.projects.map((project) => project.caseStudy.repository)).toEqual([
      "https://github.com/vikkrantxx7/prepforge",
      "https://github.com/vikkrantxx7/git-contributor-stats",
    ]);
    for (const project of content.projects) {
      expect(project.caseStudy.architecture.length).toBeGreaterThanOrEqual(3);
      expect(project.caseStudy.decisions.length).toBeGreaterThanOrEqual(3);
      expect(project.caseStudy.implementation.length).toBeGreaterThanOrEqual(3);
      expect(project.caseStudy.sources.length).toBeGreaterThanOrEqual(3);
    }
    expect(validateContent(content)).toEqual([]);
  });
  it("rejects a case study with a missing repository", () => {
    const project = content.projects[0];
    if (!project) throw new Error("Project fixture required");
    expect(validateContent({ ...content, projects: [{ ...project, caseStudy: { ...project.caseStudy, repository: "" } }] })).toContain("Missing project repository: prepforge");
  });
});