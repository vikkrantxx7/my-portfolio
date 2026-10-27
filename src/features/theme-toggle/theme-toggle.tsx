import { Moon, Sun } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { usePrefersReducedMotion } from "@/shared/lib/use-prefers-reduced-motion";
import { readTheme, switchTheme, THEME_TRANSITION_SECONDS, type Theme } from "./theme";

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("dark");
  // Icons only animate after the stored theme has been synced, so remounts
  // (e.g. returning from a project page) never replay a moon-to-sun arc.
  const [synced, setSynced] = useState(false);
  const reduce = usePrefersReducedMotion();

  useEffect(() => {
    setTheme(readTheme());
    setSynced(true);
  }, []);

  const next: Theme = theme === "dark" ? "light" : "dark";
  const Icon = theme === "light" ? Sun : Moon;
  // Light: rise from lower-left, set lower-right. Dark: mirrored, matching the wave.
  const d = theme === "light" ? 1 : -1;

  return (
    <button
      type="button"
      aria-label={`Switch to ${next} theme`}
      aria-pressed={theme === "light"}
      onClick={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        switchTheme(next, reduce, { x: r.left + r.width / 2, y: r.top + r.height / 2 });
        setTheme(next);
      }}
      className="theme-toggle relative flex size-10 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-full border border-border bg-card/60 text-primary shadow-glow transition hover:border-primary/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <AnimatePresence initial={false} custom={d} mode={synced ? "sync" : "popLayout"}>
        <motion.span
          key={theme}
          data-icon={theme === "light" ? "sun" : "moon"}
          className="absolute inset-0 flex items-center justify-center"
          // Rises from the lower-left, sets toward the lower-right.
          custom={d}
          variants={{
            enter: (dir: number) =>
              reduce ? { opacity: 0 } : { x: -22 * dir, y: 22, rotate: -90 * dir, opacity: 0 },
            leave: (dir: number) =>
              reduce ? { opacity: 0 } : { x: 22 * dir, y: 22, rotate: 90 * dir, opacity: 0 },
          }}
          initial="enter"
          animate={{ x: 0, y: 0, rotate: 0, opacity: 1 }}
          exit="leave"
          transition={
            reduce
              ? { duration: 0.15 }
              : { duration: THEME_TRANSITION_SECONDS, ease: [0.35, 0, 0.35, 1] }
          }
        >
          <Icon aria-hidden className="size-5" />
        </motion.span>
      </AnimatePresence>
    </button>
  );
}
