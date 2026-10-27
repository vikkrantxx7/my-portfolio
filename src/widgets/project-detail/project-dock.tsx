import { Link } from "@tanstack/react-router";
import { ArrowUp, ChevronLeft, ChevronRight, LayoutGrid, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import type { Project } from "@/content/types";
import { prefersReducedMotion } from "@/shared/lib/use-prefers-reduced-motion";
import { dockBar, dockItem } from "@/shared/ui/dock";
import { adjacentProjects } from "./project-pager";

const item = dockItem();
const glow = "size-5 text-primary drop-shadow-[0_0_8px_var(--color-primary)]";

function Inner({ icon: Icon, label }: { icon: LucideIcon; label: string }) {
  return (
    <>
      <Icon className={glow} aria-hidden="true" />
      <span>{label}</span>
    </>
  );
}

function Disabled({ children }: { children: ReactNode }) {
  return (
    <span aria-disabled="true" className={`${item} opacity-35`}>
      {children}
    </span>
  );
}

export function ProjectDock({ projects, slug }: { projects: Project[]; slug: string }) {
  const { previous, next } = adjacentProjects(projects, slug);
  const toTop = () =>
    window.scrollTo({ top: 0, behavior: prefersReducedMotion() ? "auto" : "smooth" });
  return (
    <nav
      aria-label="Project controls"
      className="pointer-events-none fixed inset-x-0 bottom-0 z-40 flex justify-center px-4 pb-[calc(env(safe-area-inset-bottom)+1rem)] md:hidden"
    >
      <div className={dockBar()}>
        {previous ? (
          <Link
            to="/projects/$slug"
            params={{ slug: previous.slug }}
            aria-label={`Previous project: ${previous.title}`}
            className={item}
          >
            <Inner icon={ChevronLeft} label="Prev" />
          </Link>
        ) : (
          <Disabled>
            <Inner icon={ChevronLeft} label="Prev" />
          </Disabled>
        )}
        <Link to="/" hash="work" aria-label="All work" className={item}>
          <Inner icon={LayoutGrid} label="Work" />
        </Link>
        <button type="button" onClick={toTop} aria-label="Back to top" className={item}>
          <Inner icon={ArrowUp} label="Top" />
        </button>
        {next ? (
          <Link
            to="/projects/$slug"
            params={{ slug: next.slug }}
            aria-label={`Next project: ${next.title}`}
            className={item}
          >
            <Inner icon={ChevronRight} label="Next" />
          </Link>
        ) : (
          <Disabled>
            <Inner icon={ChevronRight} label="Next" />
          </Disabled>
        )}
      </div>
    </nav>
  );
}
