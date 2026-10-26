import type { ProjectFilters } from "./filter-projects";

export function projectFilterNavigation(search: ProjectFilters, hash: string) {
  return { search, hash: hash.replace(/^#/, ""), resetScroll: false, hashScrollIntoView: false };
}
