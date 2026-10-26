import { ArrowUpRight, ChevronDown } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { content } from "@/content/data";
import type { Achievement } from "@/content/types";
import { usePrefersReducedMotion } from "@/shared/lib/use-prefers-reduced-motion";
import { Button } from "@/shared/ui/button";

export function AchievementDisclosure({
  achievement,
  experienceId,
}: {
  achievement: Achievement;
  experienceId: string;
}) {
  const [open, setOpen] = useState(false);
  const reducedMotion = usePrefersReducedMotion();
  const id = `achievement-${experienceId}-${achievement.id}`;
  const relatedProjects = content.projects.filter((project) =>
    achievement.projectSlugs.includes(project.slug),
  );

  const details = (
    <div className="px-4 pb-6 pt-1 md:px-5">
      <dl className="grid gap-x-8 gap-y-6 border-l border-primary/30 pl-4 text-sm leading-relaxed md:grid-cols-2 md:pl-5">
        <div>
          <dt className="mb-2 font-mono text-xs uppercase tracking-wider text-muted-foreground">
            Context
          </dt>
          <dd>{achievement.context}</dd>
        </div>
        <div>
          <dt className="mb-2 font-mono text-xs uppercase tracking-wider text-muted-foreground">
            Contribution
          </dt>
          <dd>{achievement.contribution}</dd>
        </div>
        <div>
          <dt className="mb-2 font-mono text-xs uppercase tracking-wider text-muted-foreground">
            Decisions
          </dt>
          <dd>
            <ul className="list-disc space-y-1 pl-4 marker:text-secondary">
              {achievement.decisions.map((decision) => (
                <li key={decision}>{decision}</li>
              ))}
            </ul>
          </dd>
        </div>
        <div>
          <dt className="mb-2 font-mono text-xs uppercase tracking-wider text-primary">Impact</dt>
          <dd className="text-primary">{achievement.impact}</dd>
        </div>
      </dl>
      {relatedProjects.length > 0 && (
        <div className="mt-6 flex flex-wrap items-center gap-4 pl-4 md:pl-5">
          <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
            Related work
          </span>
          {relatedProjects.map((project) => (
            <a
              key={project.slug}
              href="#work"
              className="inline-flex items-center gap-1 text-sm text-primary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {project.title}
              <ArrowUpRight aria-hidden="true" className="size-4" />
            </a>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <li className="border-b border-border last:border-b-0">
      <Button
        id={`${id}-trigger`}
        variant="ghost"
        aria-expanded={open}
        aria-controls={`${id}-details`}
        onClick={() => setOpen((value) => !value)}
        className="h-auto min-h-16 w-full justify-between gap-4 rounded-none border-0 px-4 py-5 text-left font-sans text-sm normal-case tracking-normal hover:bg-primary/5 md:px-5 md:text-base"
      >
        <span className={open ? "text-primary" : "text-foreground"}>{achievement.summary}</span>
        <ChevronDown
          aria-hidden="true"
          className={`size-4 shrink-0 text-primary transition-transform motion-reduce:transition-none ${open ? "rotate-180" : ""}`}
        />
      </Button>
      {reducedMotion ? (
        open && (
          <div id={`${id}-details`} role="region" aria-labelledby={`${id}-trigger`}>
            {details}
          </div>
        )
      ) : (
        <AnimatePresence initial={false}>
          {open && (
            <motion.div
              key="details"
              id={`${id}-details`}
              role="region"
              aria-labelledby={`${id}-trigger`}
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ type: "spring", stiffness: 260, damping: 32 }}
              className="overflow-hidden"
            >
              {details}
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </li>
  );
}
