import type { ComponentType } from "react";

export interface MdxCaseStudyFrontmatter {
  repository: string;
  status: string;
  sources: { label: string; path: string }[];
}

/** An MDX case study body with its validated frontmatter. */
export interface MdxCaseStudy {
  frontmatter: MdxCaseStudyFrontmatter;
  Body: ComponentType<{ components?: Record<string, ComponentType<never>> }>;
}

/** Returns human-readable problems with MDX frontmatter; empty means valid. */
export function validateMdxCaseStudy(fm: unknown): string[] {
  const f = (fm ?? {}) as Partial<MdxCaseStudyFrontmatter>;
  const errors: string[] = [];
  if (typeof f.repository !== "string" || !f.repository.startsWith("https://"))
    errors.push("Missing repository");
  if (typeof f.status !== "string" || !f.status) errors.push("Missing status");
  if (!Array.isArray(f.sources) || f.sources.length === 0) errors.push("No source evidence");
  for (const s of f.sources ?? []) {
    if (!s.label) errors.push("Source label required");
    if (!s.path || /^[a-z]+:|^\/|\.\./i.test(s.path))
      errors.push(`Source path must be repository-relative: ${s.path}`);
  }
  return errors;
}
