import { describe, expect, it } from "vitest";
import { content } from "./data";
import { validateContent } from "./validate";

const exp = exp!;
const ach = ach!;
const proj = proj!;

describe("content model", () => {
  it("placeholder content passes validation", () => {
    expect(validateContent(content)).toEqual([]);
  });

  it("uses the owner's name", () => {
    expect(content.profile.name).toBe("Vikkrant Sharma");
  });

  it("reports duplicate experience ids", () => {
    const broken = { ...content, experiences: [exp, exp] };
    expect(validateContent(broken)).toContain(`Duplicate experience id: ${exp.id}`);
  });

  it("reports duplicate achievement ids within a role", () => {
    const broken = {
      ...content,
      experiences: [{ ...exp, achievements: [ach, ach] }],
    };
    expect(validateContent(broken)).toContain(
      `Duplicate achievement id: ${exp.id}/${ach.id}`,
    );
  });

  it("reports achievement links to unknown projects", () => {
    const broken = {
      ...content,
      experiences: [
        { ...exp, achievements: [{ ...ach, projectSlugs: ["ghost"] }] },
      ],
    };
    expect(validateContent(broken)).toContain(`Unknown project slug: ghost`);
  });

  it("reports duplicate project slugs", () => {
    const broken = { ...content, projects: [proj, proj] };
    expect(validateContent(broken)).toContain(`Duplicate project slug: ${proj.slug}`);
  });
});
