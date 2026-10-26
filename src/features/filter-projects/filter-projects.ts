import type { Project } from "@/content/types";

export interface ProjectFilters {
  tech?: string;
  domain?: string;
}

export function validateProjectSearch(search: Record<string, unknown>): ProjectFilters {
  return {
    ...(typeof search.tech === "string" && search.tech ? { tech: search.tech } : {}),
    ...(typeof search.domain === "string" && search.domain ? { domain: search.domain } : {}),
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
