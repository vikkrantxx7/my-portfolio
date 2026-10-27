import PrepforgeBody, { frontmatter as prepforgeFrontmatter } from "./case-studies/prepforge.mdx";
import GitStatsBody, {
  frontmatter as gitStatsFrontmatter,
} from "./case-studies/git-contributor-stats.mdx";
import type { MdxCaseStudy } from "./mdx-case-study";

/** MDX is the default for new case studies; unregistered projects use typed sections. */
export const caseStudyBodies: Partial<Record<string, MdxCaseStudy>> = {
  prepforge: {
    Body: PrepforgeBody,
    frontmatter: prepforgeFrontmatter as unknown as MdxCaseStudy["frontmatter"],
  },
  "git-contributor-stats": {
    Body: GitStatsBody,
    frontmatter: gitStatsFrontmatter as unknown as MdxCaseStudy["frontmatter"],
  },
};
