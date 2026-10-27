import { Link } from "@tanstack/react-router";
import { ArrowUpRight, RotateCcw } from "lucide-react";
import { content } from "@/content/data";
import { projectArtwork } from "@/content/project-artwork";
import { filterProjects, type ProjectFilters } from "@/features/filter-projects/filter-projects";
import { Button, buttonVariants } from "@/shared/ui/button";
import { FilterSelect } from "@/shared/ui/filter-select";
import { SectionHeading } from "@/shared/ui/section-heading";
import { Tag } from "@/shared/ui/tag";

export function ProjectGallery({
  filters,
  onFiltersChange,
}: {
  filters: ProjectFilters;
  onFiltersChange: (filters: ProjectFilters) => void;
}) {
  const featured = content.projects.filter((project) => project.featured);
  const projects = filterProjects(content.projects, filters);
  const technologies = [...new Set(featured.flatMap((project) => project.tech))].sort();
  const domains = [...new Set(featured.flatMap((project) => project.domains))].sort();
  const filtered = Boolean(filters.tech || filters.domain);
  return (
    <section id="work" className="scroll-mt-24 space-y-8" aria-labelledby="work-heading">
      <SectionHeading
        index="03"
        label="Selected work"
        title={
          <span id="work-heading">
            Things I've <span className="text-gradient-accent">built</span>.
          </span>
        }
      />
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-border pb-6">
        <div className="grid w-full gap-4 sm:w-auto sm:grid-cols-2">
          <FilterSelect
            label="Technology"
            value={filters.tech ?? ""}
            options={technologies}
            onChange={(tech) => onFiltersChange({ ...filters, tech: tech || undefined })}
          />
          <FilterSelect
            label="Domain"
            value={filters.domain ?? ""}
            options={domains}
            onChange={(domain) => onFiltersChange({ ...filters, domain: domain || undefined })}
          />
        </div>
        <div className="flex items-center gap-4">
          <span className="font-mono text-xs text-muted-foreground" aria-live="polite">
            {projects.length} / {featured.length} projects
          </span>
          {filtered && (
            <Button variant="ghost" size="sm" onClick={() => onFiltersChange({})}>
              <RotateCcw className="size-3.5" aria-hidden="true" />
              Clear filters
            </Button>
          )}
        </div>
      </div>
      {projects.length ? (
        <div className="grid gap-5 md:grid-cols-2 lg:gap-6">
          {projects.map((project) => (
            <article
              key={project.slug}
              className="group flex min-w-0 flex-col overflow-hidden rounded-lg border border-border bg-card transition-all duration-300 hover:border-primary/50 hover:shadow-glow focus-within:border-primary/50 motion-safe:hover:-translate-y-1"
            >
              <div className="aspect-[8/5] overflow-hidden border-b border-border bg-background">
                {projectArtwork[project.slug] && (
                  <img
                    src={projectArtwork[project.slug]}
                    alt=""
                    loading="lazy"
                    width={1024}
                    height={640}
                    className="h-full w-full object-cover transition-transform duration-500 motion-safe:group-hover:scale-[1.025]"
                  />
                )}
              </div>
              <div className="flex flex-1 flex-col gap-4 p-5 md:p-6 lg:p-8">
                <p className="font-mono text-xs text-secondary">{project.category}</p>
                <h3 className="break-words text-2xl font-semibold">{project.title}</h3>
                <p className="leading-relaxed text-muted-foreground">{project.problem}</p>
                <dl className="flex flex-wrap gap-x-3 text-sm">
                  <dt className="text-muted-foreground">My role</dt>
                  <dd>{project.role}</dd>
                </dl>
                <div className="flex flex-wrap gap-2">
                  {project.tech.map((tech) => (
                    <Tag key={tech}>{tech}</Tag>
                  ))}
                </div>
                <div className="mt-auto border-t border-border pt-4 md:pt-6">
                  <Link
                    to="/projects/$slug"
                    params={{ slug: project.slug }}
                    aria-label={`Open case study: ${project.title}`}
                    className={buttonVariants({ variant: "ghost", size: "sm" })}
                  >
                    Open case study
                    <ArrowUpRight className="size-4 shrink-0" aria-hidden="true" />
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <p role="status" className="py-16 text-center text-muted-foreground">
          No projects match these filters.
        </p>
      )}
    </section>
  );
}
