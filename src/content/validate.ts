import type { Content } from "./types";

/** Returns a list of human-readable problems; empty means valid. */
export function validateContent(c: Content): string[] {
  const errors: string[] = [];
  const slugs = new Set<string>();
  for (const p of c.projects) {
    if (slugs.has(p.slug)) errors.push(`Duplicate project slug: ${p.slug}`);
    slugs.add(p.slug);
  }
  const expIds = new Set<string>();
  for (const e of c.experiences) {
    if (expIds.has(e.id)) errors.push(`Duplicate experience id: ${e.id}`);
    expIds.add(e.id);
    const achIds = new Set<string>();
    for (const a of e.achievements) {
      if (achIds.has(a.id)) errors.push(`Duplicate achievement id: ${e.id}/${a.id}`);
      achIds.add(a.id);
      for (const s of a.projectSlugs) if (!slugs.has(s)) errors.push(`Unknown project slug: ${s}`);
    }
  }
  return errors;
}
