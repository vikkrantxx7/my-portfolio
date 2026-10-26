import type { Project } from "@/content/types";

export interface ProjectFilters {
  tech?: string | undefined;
  domain?: string | undefined;
}

export function validateProjectSearch(search: Record<string, unknown>): ProjectFilters {
  const { tech, domain } = search;
  return {
    ...(typeof tech === "string" && tech ? { tech } : {}),
    ...(typeof domain === "string" && domain ? { domain } : {}),
  };
}

export function filterProjects(projects: Project[], filters: ProjectFilters): Project[] {
  return projects.filter(
    (project) =>
      project.featured &&
      (!filters.tech || project.tech.includes(filters.tech)) &&
      (!filters.domain || project.domains.includes(filters.domain)),
  );
}
