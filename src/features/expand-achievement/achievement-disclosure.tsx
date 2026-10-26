import { useRouter } from "@tanstack/react-router";
import { ArrowUpRight, ChevronDown, Link2 } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { content } from "@/content/data";
import type { Achievement } from "@/content/types";
import {
  achievementHash,
  achievementNavigationEvent,
  achievementShareUrl,
  replaceHash,
  resolveDeepLink,
} from "@/features/deep-link/deep-link";
import { scrollToSection, usePrefersReducedMotion } from "@/shared/lib/use-prefers-reduced-motion";
import { Button } from "@/shared/ui/button";

function CopyLinkButton({ hash }: { hash: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => {
          navigator.clipboard?.writeText(achievementShareUrl(hash)).then(() => {
            setCopied(true);
            window.setTimeout(() => setCopied(false), 2000);
          });
        }}
        className="h-8 px-3"
      >
        <Link2 aria-hidden="true" className="size-3.5" />
        Copy link
      </Button>
      {copied && <span role="status">Link copied</span>}
    </>
  );
}

export function AchievementDisclosure({
  achievement,
  experienceId,
}: {
  achievement: Achievement;
  experienceId: string;
}) {
  const [open, setOpen] = useState(false);
  const router = useRouter({ warn: false });
  const navigate = router?.navigate;
  const [highlighted, setHighlighted] = useState(false);
  const reducedMotion = usePrefersReducedMotion();
  const id = `achievement-${experienceId}-${achievement.id}`;
  const hash = achievementHash(experienceId, achievement.id);
  // The trigger carries the deep-link id, so the browser and the router scroll
  // to it natively when a shared link is opened.
  const triggerId = hash.slice(1);

  useEffect(() => {
    let startTimer: number | undefined;
    let settleTimer: number | undefined;
    let highlightTimer: number | undefined;
    let onSettled: (() => void) | undefined;
    const cancel = () => {
      window.clearTimeout(startTimer);
      window.clearTimeout(settleTimer);
      window.clearTimeout(highlightTimer);
      if (onSettled) window.removeEventListener("scrollend", onSettled);
    };
    const reveal = (event: Event) => {
      if (!(event instanceof CustomEvent) || event.detail !== hash) return;
      cancel();
      setHighlighted(false);
      // Scroll to the stable trigger first; expanding above the note shifts the viewport.
      startTimer = window.setTimeout(() => {
        let settled = false;
        onSettled = () => {
          if (settled) return;
          settled = true;
          window.clearTimeout(settleTimer);
          if (onSettled) window.removeEventListener("scrollend", onSettled);
          setOpen(true);
          replaceHash(hash, navigate);
          setHighlighted(true);
          highlightTimer = window.setTimeout(() => setHighlighted(false), 2000);
        };
        if (!reducedMotion) window.addEventListener("scrollend", onSettled);
        scrollToSection(triggerId);
        if (reducedMotion) onSettled();
        else settleTimer = window.setTimeout(onSettled, 1400);
      }, 0);
    };
    window.addEventListener(achievementNavigationEvent, reveal);
    return () => {
      cancel();
      window.removeEventListener(achievementNavigationEvent, reveal);
    };
  }, [hash, triggerId, reducedMotion, navigate]);

  useEffect(() => {
    const link = resolveDeepLink(content.experiences, window.location.hash);
    if (link?.experienceId !== experienceId || link.achievementId !== achievement.id) return;
    setOpen(true);
    setHighlighted(true);
    const highlightTimer = window.setTimeout(() => setHighlighted(false), 2000);
    const scrollToTrigger = () => scrollToSection(triggerId);
    scrollToTrigger();
    // The router's scroll restoration can settle after hydration and reset the
    // scroll; re-check once and re-scroll if the trigger is still off screen.
    const retry = window.setTimeout(() => {
      const trigger = document.getElementById(triggerId);
      if (trigger && trigger.getBoundingClientRect().top > window.innerHeight * 0.75) {
        scrollToTrigger();
      }
    }, 250);
    return () => {
      window.clearTimeout(retry);
      window.clearTimeout(highlightTimer);
    };
  }, [experienceId, achievement.id, triggerId]);

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
      <div className="mt-6 flex flex-wrap items-center gap-3 pl-4 md:pl-5">
        <CopyLinkButton hash={hash} />
      </div>
    </div>
  );

  return (
    <li
      className={`border-b border-border last:border-b-0 ${highlighted ? "achievement-highlight" : ""}`}
    >
      <Button
        id={triggerId}
        variant="ghost"
        aria-expanded={open}
        aria-current={highlighted ? "location" : undefined}
        aria-controls={`${id}-details`}
        onClick={() => {
          const next = !open;
          setOpen(next);
          replaceHash(next ? hash : null, navigate);
        }}
        className="h-auto min-h-16 w-full scroll-mt-24 justify-between gap-4 rounded-none border-0 px-4 py-5 text-left font-sans text-sm normal-case tracking-normal hover:bg-primary/5 md:px-5 md:text-base"
      >
        <span className={open ? "text-primary" : "text-foreground"}>{achievement.summary}</span>
        <ChevronDown
          aria-hidden="true"
          className={`size-4 shrink-0 text-primary transition-transform motion-reduce:transition-none ${open ? "rotate-180" : ""}`}
        />
      </Button>
      {reducedMotion ? (
        open && (
          <section id={`${id}-details`} aria-labelledby={triggerId}>
            {details}
          </section>
        )
      ) : (
        <AnimatePresence initial={false}>
          {open && (
            <motion.section
              key="details"
              id={`${id}-details`}
              aria-labelledby={triggerId}
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ type: "spring", stiffness: 260, damping: 32 }}
              className="overflow-hidden"
            >
              {details}
            </motion.section>
          )}
        </AnimatePresence>
      )}
    </li>
  );
}
