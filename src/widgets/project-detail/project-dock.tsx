import { Link } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight, LayoutGrid } from "lucide-react";
import type { Project } from "@/content/types";
import { dockItem } from "@/shared/ui/dock";
import { useDockRipple } from "@/shared/ui/dock-ripple";
import {
  DockDisabled as Disabled,
  DockShell,
  DockTop,
  DockIcon as Inner,
} from "@/shared/ui/dock-shell";
import { adjacentProjects } from "./project-pager";

const item = dockItem();
export function ProjectDock({ projects, slug }: { projects: Project[]; slug: string }) {
  const { previous, next } = adjacentProjects(projects, slug);
  const ripple = useDockRipple();
  return (
    <DockShell label="Project controls" progress>
      {previous ? (
        <Link
          to="/projects/$slug"
          params={{ slug: previous.slug }}
          aria-label={`Previous project: ${previous.title}`}
          className={item}
          {...ripple}
        >
          <Inner icon={ChevronLeft} label="Prev" />
        </Link>
      ) : (
        <Disabled>
          <Inner icon={ChevronLeft} label="Prev" />
        </Disabled>
      )}
      <Link to="/" hash="work" aria-label="All work" className={item} {...ripple}>
        <Inner icon={LayoutGrid} label="Work" />
      </Link>
      <DockTop />
      {next ? (
        <Link
          to="/projects/$slug"
          params={{ slug: next.slug }}
          aria-label={`Next project: ${next.title}`}
          className={item}
          {...ripple}
        >
          <Inner icon={ChevronRight} label="Next" />
        </Link>
      ) : (
        <Disabled>
          <Inner icon={ChevronRight} label="Next" />
        </Disabled>
      )}
    </DockShell>
  );
}
