import { describe, expect, it } from "vitest";
import { content } from "./data";
import { validateContent } from "./validate";

describe("content model", () => {
  it("placeholder content passes validation", () => {
    expect(validateContent(content)).toEqual([]);
  });

  it("uses the owner's name", () => {
    expect(content.profile.name).toBe("Vikkrant Sharma");
  });

  it("reports duplicate experience ids", () => {
    const broken = { ...content, experiences: [content.experiences[0], content.experiences[0]] };
    expect(validateContent(broken)).toContain(`Duplicate experience id: ${content.experiences[0].id}`);
  });

  it("reports duplicate achievement ids within a role", () => {
    const exp = content.experiences[0];
    const broken = {
      ...content,
      experiences: [{ ...exp, achievements: [exp.achievements[0], exp.achievements[0]] }],
    };
    expect(validateContent(broken)).toContain(
      `Duplicate achievement id: ${exp.id}/${exp.achievements[0].id}`,
    );
  });

  it("reports achievement links to unknown projects", () => {
    const exp = content.experiences[0];
    const broken = {
      ...content,
      experiences: [
        { ...exp, achievements: [{ ...exp.achievements[0], projectSlugs: ["ghost"] }] },
      ],
    };
    expect(validateContent(broken)).toContain(`Unknown project slug: ghost`);
  });

  it("reports duplicate project slugs", () => {
    const broken = { ...content, projects: [content.projects[0], content.projects[0]] };
    expect(validateContent(broken)).toContain(`Duplicate project slug: ${content.projects[0].slug}`);
  });
});
