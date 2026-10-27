import { describe, expect, it } from "vitest";
import { caseStudyBodies } from "./case-study-bodies";
import { validateMdxCaseStudy } from "./mdx-case-study";

const valid = {
  repository: "https://github.com/vikkrantxx7/prepforge",
  status: "In development",
  sources: [{ label: "Project README", path: "README.md" }],
};

describe("MDX case study frontmatter", () => {
  it("accepts a complete frontmatter", () => {
    expect(validateMdxCaseStudy(valid)).toEqual([]);
  });
  it("rejects a missing repository", () => {
    expect(validateMdxCaseStudy({ ...valid, repository: "" })).toContain("Missing repository");
  });
  it("rejects empty sources", () => {
    expect(validateMdxCaseStudy({ ...valid, sources: [] })).toContain("No source evidence");
  });
  it("rejects source paths that are not repository-relative", () => {
    expect(
      validateMdxCaseStudy({ ...valid, sources: [{ label: "x", path: "https://evil.dev/a" }] }),
    ).toContain("Source path must be repository-relative: https://evil.dev/a");
  });
  it("ships a valid PrepForge MDX case study", () => {
    const prepforge = caseStudyBodies["prepforge"];
    expect(prepforge).toBeDefined();
    expect(validateMdxCaseStudy(prepforge?.frontmatter)).toEqual([]);
  });
});
