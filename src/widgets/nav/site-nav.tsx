import { type KeyboardEvent, type MouseEvent, useEffect, useRef, useState } from "react";
import { content } from "@/content/data";
import { cn } from "@/lib/utils";
import { scrollToSection } from "@/shared/lib/use-prefers-reduced-motion";
import { useActiveSection } from "./use-active-section";

export const NAV_SECTIONS = [
  { id: "work", label: "Work" },
  { id: "experience", label: "Experience" },
  { id: "about", label: "About" },
] as const;

const ids = NAV_SECTIONS.map((s) => s.id);

export function SiteNav() {
  const { profile } = content;
  const active = useActiveSection(ids);
  const [open, setOpen] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) menuRef.current?.querySelector<HTMLElement>("a")?.focus();
  }, [open]);

  const close = () => {
    setOpen(false);
    requestAnimationFrame(() => toggleRef.current?.focus());
    toggleRef.current?.focus();
  };

  const go = (id: string) => (e: MouseEvent) => {
    e.preventDefault();
    scrollToSection(id);
    history.replaceState(null, "", `#${id}`);
    if (open) close();
  };

  const onMenuKey = (e: KeyboardEvent) => {
    if (e.key === "Escape") return close();
    if (e.key !== "Tab" || !menuRef.current) return;
    const items = [...menuRef.current.querySelectorAll<HTMLElement>("a,button")];
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

  const linkCls = (id: string) =>
    cn(
      "font-mono text-xs uppercase tracking-[0.18em] transition-colors hover:text-primary focus-visible:outline-none focus-visible:text-primary",
      active === id ? "text-primary" : "text-muted-foreground",
    );

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/70 backdrop-blur-xl">
      <nav
        aria-label="Primary"
        className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6 md:px-16"
      >
        <a href="#top" className="flex items-center gap-3 font-semibold text-foreground">
          <span
            aria-hidden
            className="grid size-8 place-items-center rounded-md border border-primary/50 font-mono text-xs text-primary shadow-glow"
          >
            {profile.monogram}
          </span>
          <span>{profile.name}</span>
        </a>
        <ul className="hidden items-center gap-8 md:flex">
          {NAV_SECTIONS.map((s) => (
            <li key={s.id}>
              <a
                href={`#${s.id}`}
                onClick={go(s.id)}
                aria-current={active === s.id ? "true" : undefined}
                className={linkCls(s.id)}
              >
                {s.label}
              </a>
            </li>
          ))}
          <li>
            <a
              href={profile.resumeUrl}
              download
              className="rounded-md border border-primary/60 px-4 py-2 font-mono text-xs uppercase tracking-[0.18em] text-primary hover:bg-primary/10"
            >
              Resume PDF
            </a>
          </li>
        </ul>
        <button
          ref={toggleRef}
          type="button"
          className="font-mono text-xs uppercase tracking-[0.18em] text-foreground md:hidden"
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => (open ? close() : setOpen(true))}
        >
          {open ? "Close" : "Menu"}
        </button>
      </nav>
      {open && (
        // biome-ignore lint/a11y/useSemanticElements: custom modal menu
        <div
          id="mobile-menu"
          ref={menuRef}
          role="dialog"
          aria-modal="true"
          aria-label="Menu"
          onKeyDown={onMenuKey}
          className="border-t border-border bg-background px-6 py-6 md:hidden"
        >
          <ul className="flex flex-col gap-5">
            {NAV_SECTIONS.map((s) => (
              <li key={s.id}>
                <a href={`#${s.id}`} onClick={go(s.id)} className={linkCls(s.id)}>
                  {s.label}
                </a>
              </li>
            ))}
            <li>
              <a href={profile.resumeUrl} download className={linkCls("resume")}>
                Resume PDF
              </a>
            </li>
          </ul>
        </div>
      )}
    </header>
  );
}
