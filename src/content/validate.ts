import type { Content, Diagram } from "./types";

/** Every connection must point at boxes that exist in the diagram. */
export function validateDiagram(d: Diagram): string[] {
  const ids = new Set(d.layers.flatMap((l) => l.nodes.map((n) => n.id)));
  const errors: string[] = [];
  for (const e of d.edges)
    for (const id of [e.from, e.to]) if (!ids.has(id)) errors.push(`Unknown diagram box: ${id}`);
  return errors;
}

/** Returns a list of human-readable problems; empty means valid. */
export function validateContent(c: Content): string[] {
  const errors: string[] = [];
  const slugs = new Set<string>();
  for (const p of c.projects) {
    if (slugs.has(p.slug)) errors.push(`Duplicate project slug: ${p.slug}`);
    slugs.add(p.slug);
    if (!p.caseStudy.repository) errors.push(`Missing project repository: ${p.slug}`);
    errors.push(...validateDiagram(p.caseStudy.diagram));
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
