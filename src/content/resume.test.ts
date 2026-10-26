import { describe, expect, it } from "vitest";
import { content } from "./data";

describe("content from resume", () => {
  it("lists roles newest first: adidas, UKG, Infosys", () => {
    expect(content.experiences.map((e) => e.company)).toEqual(["adidas", "UKG", "Infosys"]);
  });

  it("uses real contact details", () => {
    expect(content.profile.email).toBe("sharma.vikkrant@gmail.com");
    expect(content.profile.links.github).toBe("https://github.com/vikkrantxx7");
    expect(content.profile.links.linkedin).toBe("https://www.linkedin.com/in/vikrant-sharma-001");
  });

  it("current role at adidas started Dec 2021 and is ongoing", () => {
    const adidas = content.experiences[0];
    expect(adidas?.start).toBe("2021-12");
    expect(adidas?.end).toBeNull();
  });

  it("career starts Sep 2013 (13 years)", () => {
    expect(content.experiences.at(-1)?.start).toBe("2013-09");
  });

  it("features PrepForge and git-contributor-stats", () => {
    const slugs = content.projects.map((p) => p.slug);
    expect(slugs).toContain("prepforge");
    expect(slugs).toContain("git-contributor-stats");
  });
});
