import * as NavigationMenu from "@radix-ui/react-navigation-menu";
import { cva } from "class-variance-authority";
import { AnimatePresence, motion } from "motion/react";
import { type MouseEvent, type ReactNode, useLayoutEffect, useRef, useState } from "react";
import { usePrefersReducedMotion } from "@/shared/lib/use-prefers-reduced-motion";

const sectionLink = cva(
  "relative block rounded-full px-2.5 py-1.5 font-mono text-xs uppercase tracking-[0.18em] transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring lg:px-3",
  {
    variants: { active: { true: "text-primary", false: "text-muted-foreground" } },
    defaultVariants: { active: false },
  },
);

interface SectionNavigationProps {
  items: readonly { id: string; label: string }[];
  active: string | null;
  onSelect: (id: string) => (event: MouseEvent) => void;
  children?: ReactNode;
}

/** Section links are navigation, not ARIA tabs: all sections remain in the document. */
export function SectionNavigation({ items, active, onSelect, children }: SectionNavigationProps) {
  const reduce = usePrefersReducedMotion();
  const listRef = useRef<HTMLUListElement>(null);
  const [pill, setPill] = useState({ x: 0, y: 0, width: 0, height: 0 });
  useLayoutEffect(() => {
    const measure = () => {
      const list = listRef.current;
      const link = active ? list?.querySelector<HTMLElement>(`a[href="#${active}"]`) : null;
      if (!list || !link) return;
      const parent = list.getBoundingClientRect();
      const rect = link.getBoundingClientRect();
      setPill({
        x: rect.left - parent.left,
        y: rect.top - parent.top,
        width: rect.width,
        height: rect.height,
      });
    };
    measure();
    const observer = new ResizeObserver(measure);
    if (listRef.current) observer.observe(listRef.current);
    return () => observer.disconnect();
  }, [active]);

  return (
    <NavigationMenu.Root aria-label="Portfolio sections" className="hidden md:block">
      <NavigationMenu.List ref={listRef} className="relative flex items-center gap-5 lg:gap-8">
        <AnimatePresence>
          {active && pill.width > 0 && (
            <motion.li
              key="active-nav-pill"
              data-nav-pill
              aria-hidden
              initial={reduce ? false : { ...pill, x: pill.x - 14, opacity: 0 }}
              animate={{ ...pill, opacity: 1 }}
              {...(reduce ? {} : { exit: { x: pill.x - 14, opacity: 0 } })}
              transition={{
                type: "tween",
                duration: reduce ? 0 : 0.28,
                ease: [0.25, 0.1, 0.25, 1],
              }}
              className="pointer-events-none absolute left-0 top-0 rounded-full border border-primary/25 bg-primary/10 shadow-xs"
            />
          )}
        </AnimatePresence>
        {items.map((item) => (
          <NavigationMenu.Item key={item.id}>
            <NavigationMenu.Link asChild active={active === item.id}>
              <a
                href={`#${item.id}`}
                onClick={onSelect(item.id)}
                aria-current={active === item.id ? "true" : undefined}
                className={sectionLink({ active: active === item.id })}
              >
                <span className="relative">{item.label}</span>
              </a>
            </NavigationMenu.Link>
          </NavigationMenu.Item>
        ))}
        {children && <NavigationMenu.Item>{children}</NavigationMenu.Item>}
      </NavigationMenu.List>
    </NavigationMenu.Root>
  );
}
