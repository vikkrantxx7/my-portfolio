import { Link } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight } from "lucide-react";
import type { Project } from "@/content/types";

export function adjacentProjects(projects: Project[], slug: string) {
  const index = projects.findIndex((project) => project.slug === slug);
  if (index === -1) return { previous: null, next: null };
  return {
    previous: projects[index - 1] ?? null,
    next: projects[index + 1] ?? null,
  };
}

const cardCls =
  "group flex flex-col gap-1 rounded-lg border border-border bg-card p-5 transition-colors hover:border-primary/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

export function ProjectPager({ projects, slug }: { projects: Project[]; slug: string }) {
  const { previous, next } = adjacentProjects(projects, slug);
  if (!previous && !next) return null;
  return (
    <nav
      aria-label="More projects"
      className="grid gap-4 border-t border-border pt-10 sm:grid-cols-2"
    >
      {previous ? (
        <Link to="/projects/$slug" params={{ slug: previous.slug }} className={cardCls}>
          <span className="inline-flex items-center gap-2 font-mono text-xs text-muted-foreground">
            <ArrowLeft className="size-3" aria-hidden="true" />
            Previous project
          </span>
          <span className="font-medium text-foreground group-hover:text-primary">
            {previous.title}
          </span>
        </Link>
      ) : (
        <span />
      )}
      {next && (
        <Link
          to="/projects/$slug"
          params={{ slug: next.slug }}
          className={`${cardCls} sm:items-end sm:text-right`}
        >
          <span className="inline-flex items-center gap-2 font-mono text-xs text-muted-foreground">
            Next project
            <ArrowRight className="size-3" aria-hidden="true" />
          </span>
          <span className="font-medium text-foreground group-hover:text-primary">{next.title}</span>
        </Link>
      )}
    </nav>
  );
}
