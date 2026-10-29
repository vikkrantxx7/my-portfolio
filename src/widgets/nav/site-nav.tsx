import { Link, useRouter } from "@tanstack/react-router";
import {
  Briefcase,
  ChevronLeft,
  ChevronRight,
  FileText,
  GitCommitVertical,
  LayoutGrid,
  type LucideIcon,
  PenLine,
  User,
  X,
} from "lucide-react";
import { motion } from "motion/react";
import {
  type AnchorHTMLAttributes,
  type KeyboardEvent,
  type MouseEvent,
  type PointerEvent,
  type ReactNode,
  useEffect,
  useRef,
  useState,
} from "react";
import { content } from "@/content/data";
import { replaceHash } from "@/features/deep-link/deep-link";
import { ResumeViewer } from "@/features/resume-viewer/resume-viewer";
import { ThemeToggle } from "@/features/theme-toggle/theme-toggle";
import { cn } from "@/lib/utils";
import { scrollToSection, usePrefersReducedMotion } from "@/shared/lib/use-prefers-reduced-motion";
import { Button } from "@/shared/ui/button";
import { useDockRipple } from "@/shared/ui/dock-ripple";
import { DockPosition } from "@/shared/ui/dock-shell";
import { SectionNavigation } from "@/shared/ui/section-navigation";
import { AvatarPreview } from "./avatar-preview";
import { DockIgnition } from "./dock-ignition";
import { type EnergyTargetResolver, HeaderEnergy } from "./header-energy";

/** Site nav endpoints: section pills by hash link, the avatar when no section is active. */
const siteNavTargets: EnergyTargetResolver = (id, nav) => {
  const element = nav.querySelector<HTMLElement>(id ? `a[href="#${id}"]` : "[data-avatar-frame]");
  return element ? { element, kind: id ? "pill" : "avatar" } : null;
};

import { ScrollProgress } from "./scroll-progress";
import { useActiveSection } from "./use-active-section";

export const NAV_SECTIONS = [
  { id: "work", label: "Work" },
  { id: "experience", label: "Experience" },
  { id: "about", label: "About" },
] as const;

const LEFT = [
  { id: "work", short: "Work", icon: Briefcase },
  { id: "experience", short: "Experience", icon: GitCommitVertical },
] as const;

const ids = NAV_SECTIONS.map((s) => s.id);

export function SiteNav() {
  const { profile } = content;
  const router = useRouter({ warn: false });
  const { active, select } = useActiveSection(ids);
  const reduce = usePrefersReducedMotion();
  const [open, setOpen] = useState(false);
  const [resumeOpen, setResumeOpen] = useState(false);
  const ripple = useDockRipple();
  const toggleRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (open) menuRef.current?.querySelector<HTMLElement>("a")?.focus({ preventScroll: true });
  }, [open]);

  const close = () => {
    setOpen(false);
    toggleRef.current?.focus({ preventScroll: true });
  };

  const go = (id: string) => (e: MouseEvent) => {
    e.preventDefault();
    select(id);
    replaceHash(`#${id}`, router?.navigate);
    if (open) {
      close();
      // Measure after the menu leaves the document flow, not while it is expanded.
      requestAnimationFrame(() => scrollToSection(id));
    } else {
      scrollToSection(id);
    }
  };

  const onMenuKey = (e: KeyboardEvent) => {
    if (!open) return;
    if (e.key === "Escape") return close();
    if (e.key !== "Tab" || !menuRef.current) return;
    const items = [...menuRef.current.querySelectorAll<HTMLElement>("a,button")];
    if (toggleRef.current) items.push(toggleRef.current);
    const first = items[0];
    const last = items[items.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last?.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first?.focus();
    }
  };

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-border bg-background/70 backdrop-blur-xl">
        <nav
          ref={navRef}
          aria-label="Primary"
          className="relative mx-auto flex h-16 max-w-6xl items-center justify-between px-6 md:px-16"
        >
          <div className="flex items-center gap-3">
            <AvatarPreview />
            <a
              href="#top"
              onClick={go("top")}
              aria-label={profile.name}
              className="header-name flex shrink-0 flex-col gap-1 leading-tight whitespace-nowrap text-foreground"
            >
              <span className="header-glow font-semibold">
                {profile.name.split(" ").map((part, index) => (
                  <span key={`${index}-${part}`}>
                    {index > 0 ? " " : ""}
                    <span className={index === 0 ? "text-primary" : "text-secondary"}>
                      {part.slice(0, 1)}
                    </span>
                    {part.slice(1)}
                  </span>
                ))}
              </span>
              <span className="hidden font-mono text-[10px] font-normal uppercase tracking-[0.16em] text-muted-foreground min-[880px]:block">
                {profile.title}
              </span>
            </a>
          </div>
          <div className="flex items-center gap-5 lg:gap-6">
            <SectionNavigation items={NAV_SECTIONS} active={active} onSelect={go}>
              <div className="flex items-center gap-5 lg:gap-8">
                <BlogLink
                  hasRouter={Boolean(router)}
                  className="block rounded-full px-3 py-1.5 font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  Blog
                </BlogLink>
                <ResumeViewer triggerClassName="inline-flex touch-manipulation items-center justify-center rounded-md border border-primary/60 px-2.5 py-2 font-mono text-xs uppercase tracking-[0.18em] text-primary hover:bg-primary/10 lg:px-4">
                  <FileText aria-hidden className="size-4 min-[830px]:hidden" />
                  <span className="hidden min-[830px]:inline lg:hidden">Resume</span>
                  <span className="hidden lg:inline">View Resume</span>
                </ResumeViewer>
              </div>
            </SectionNavigation>
            <ThemeToggle />
          </div>
          <HeaderEnergy active={active} navRef={navRef} resolveTarget={siteNavTargets} />
        </nav>
        <ScrollProgress />
      </header>
      <DockPosition label="Mobile menu controls" home>
        {open && (
          <button
            type="button"
            aria-hidden
            tabIndex={-1}
            className="pointer-events-auto fixed inset-0 -z-10 bg-background/40 backdrop-blur-[2px]"
            onClick={close}
          />
        )}
        <div
          onKeyDown={onMenuKey}
          className="relative flex h-16 w-full max-w-sm items-center justify-center"
        >
          {open && (
            <motion.div
              id="mobile-menu"
              ref={menuRef}
              role="dialog"
              aria-modal="true"
              aria-label="Menu"
              initial={
                reduce ? false : { clipPath: "inset(0 50% 0 50% round 999px)", opacity: 0.4 }
              }
              animate={{ clipPath: "inset(0 0% 0 0% round 999px)", opacity: 1 }}
              transition={
                reduce ? { duration: 0 } : { type: "spring", stiffness: 300, damping: 30 }
              }
              className="pointer-events-auto absolute inset-0 grid grid-cols-[minmax(0,2fr)_minmax(0,3fr)] items-center rounded-full border border-primary/30 bg-background/85 px-2 shadow-glow backdrop-blur-xl"
            >
              <DockIgnition reducedMotion={reduce} />
              <ul data-testid="dock-left" className="grid min-w-0 grid-cols-2">
                {LEFT.map((s) => (
                  <li key={s.id}>
                    <DockLink
                      href={`#${s.id}`}
                      onClick={go(s.id)}
                      icon={s.icon}
                      label={s.short}
                      active={active === s.id}
                    />
                  </li>
                ))}
              </ul>
              <ul data-testid="dock-right" className="grid min-w-0 grid-cols-3">
                <li>
                  <DockLink
                    href="#about"
                    onClick={go("about")}
                    icon={User}
                    label="About"
                    active={active === "about"}
                  />
                </li>
                <li>
                  <BlogLink
                    hasRouter={Boolean(router)}
                    className={dockLinkCls()}
                    onPointerDown={ripple.onPointerDown}
                  >
                    <DockInner icon={PenLine} label="Blog" />
                  </BlogLink>
                </li>
                <li>
                  <Button
                    variant="ghost"
                    aria-label="CV"
                    {...ripple}
                    onClick={() => {
                      setOpen(false);
                      setResumeOpen(true);
                    }}
                    className={cn(
                      dockLinkCls(),
                      "h-auto gap-1 border-0 bg-transparent text-[10px] tracking-normal",
                    )}
                  >
                    <DockInner icon={FileText} label="CV" />
                  </Button>
                </li>
              </ul>
            </motion.div>
          )}
          <motion.div
            className="pointer-events-none relative z-10"
            initial={false}
            animate={{ y: open ? -64 : 0 }}
            transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 340, damping: 30 }}
          >
            <Button
              variant="ghost"
              ref={toggleRef}
              type="button"
              aria-expanded={open}
              aria-controls="mobile-menu"
              aria-label={open ? "Close menu" : "Open menu"}
              onClick={() => (open ? close() : setOpen(true))}
              {...ripple}
              className={cn(
                "pointer-events-auto relative flex h-12 touch-manipulation items-center justify-center gap-1 overflow-hidden rounded-full border border-primary/40 bg-background/85 text-primary shadow-glow backdrop-blur-xl transition active:scale-95",
                open ? "w-12 px-0" : "px-3",
              )}
            >
              {open ? (
                <X className="size-5 drop-shadow-[0_0_6px_var(--color-primary)]" />
              ) : (
                <>
                  <ChevronLeft className="dock-hint-left size-4" />
                  <LayoutGrid className="size-5 drop-shadow-[0_0_6px_var(--color-primary)]" />
                  <ChevronRight className="dock-hint-right size-4" />
                </>
              )}
            </Button>
          </motion.div>
        </div>
      </DockPosition>
      {/* Lives outside the menu so it survives the menu closing on open. */}
      <ResumeViewer open={resumeOpen} onOpenChange={setResumeOpen} />
    </>
  );
}

const dockLinkCls = (active?: boolean) =>
  cn(
    "relative flex min-h-12 min-w-0 w-full touch-manipulation flex-col items-center justify-center gap-1 overflow-hidden rounded-xl px-0.5 transition active:scale-95 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary",
    active ? "text-primary" : "text-muted-foreground",
  );

function DockInner({
  icon: Icon,
  label,
  active,
}: {
  icon: LucideIcon;
  label: string;
  active?: boolean | undefined;
}) {
  return (
    <>
      <Icon
        aria-hidden
        className={cn(
          "size-5 text-primary",
          active
            ? "drop-shadow-[0_0_10px_var(--color-primary)]"
            : "opacity-80 drop-shadow-[0_0_4px_var(--color-primary)]",
        )}
      />
      <span className="font-mono text-[10px] uppercase tracking-normal">{label}</span>
    </>
  );
}

/** In-app link to the blog; isolated widget renders (no router) degrade to a plain link. */
function BlogLink({
  hasRouter,
  className,
  children,
  onPointerDown,
}: {
  hasRouter: boolean;
  className: string;
  children: ReactNode;
  onPointerDown?: (event: PointerEvent<HTMLElement>) => void;
}) {
  if (!hasRouter)
    return (
      <a href="/blog" className={className} onPointerDown={onPointerDown}>
        {children}
      </a>
    );
  return (
    <Link to="/blog" className={className} onPointerDown={onPointerDown}>
      {children}
    </Link>
  );
}

function DockLink({
  icon,
  label,
  active,
  ...props
}: AnchorHTMLAttributes<HTMLAnchorElement> & {
  icon: LucideIcon;
  label: string;
  active?: boolean;
}) {
  const ripple = useDockRipple();
  return (
    <a
      {...props}
      {...ripple}
      aria-current={active ? "true" : undefined}
      className={dockLinkCls(active)}
    >
      <DockInner icon={icon} label={label} active={active} />
    </a>
  );
}
