import PrepforgeBody, { frontmatter as prepforgeFrontmatter } from "./case-studies/prepforge.mdx";
import type { MdxCaseStudy } from "./mdx-case-study";

/** Case studies authored in MDX, keyed by project slug. Others use typed sections. */
export const caseStudyBodies: Partial<Record<string, MdxCaseStudy>> = {
  prepforge: {
    Body: PrepforgeBody,
    frontmatter: prepforgeFrontmatter as unknown as MdxCaseStudy["frontmatter"],
  },
};
