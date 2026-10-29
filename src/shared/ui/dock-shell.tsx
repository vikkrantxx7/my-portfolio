import type { LucideIcon } from "lucide-react";
import { ArrowUp } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { prefersReducedMotion } from "@/shared/lib/use-prefers-reduced-motion";
import { Button } from "./button";
import { dockBar, dockItem } from "./dock";
import { DockProgress } from "./dock-progress";
import { useDockRipple } from "./dock-ripple";

/** Shared safe-area positioning also used by the expandable home menu. */
export function DockPosition({
  label,
  children,
  home = false,
}: {
  label?: string;
  children: ReactNode;
  home?: boolean;
}) {
  return (
    <nav
      aria-label={label}
      data-dock={home ? "" : undefined}
      className={cn(
        "pointer-events-none fixed inset-x-0 bottom-0 flex justify-center px-4 pb-[calc(env(safe-area-inset-bottom)+1rem)] md:hidden",
        home ? "z-50" : "z-40",
      )}
    >
      {children}
    </nav>
  );
}

export function DockShell({
  label,
  size = "full",
  progress = false,
  children,
}: {
  label: string;
  size?: "full" | "compact";
  progress?: boolean;
  children: ReactNode;
}) {
  return (
    <DockPosition label={label}>
      <div className={cn(dockBar({ size }), "relative")}>
        {progress && <DockProgress />}
        {children}
      </div>
    </DockPosition>
  );
}

export function DockIcon({ icon: Icon, label }: { icon: LucideIcon; label: string }) {
  return (
    <>
      <Icon
        className="size-5 shrink-0 text-primary drop-shadow-[0_0_8px_var(--color-primary)]"
        aria-hidden="true"
      />
      <span>{label}</span>
    </>
  );
}

export function DockDisabled({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span aria-disabled="true" className={cn(dockItem(), "opacity-35", className)}>
      {children}
    </span>
  );
}

export function DockTop({ className }: { className?: string }) {
  const ripple = useDockRipple();
  return (
    <Button
      variant="ghost"
      aria-label="Back to top"
      {...ripple}
      onClick={() =>
        window.scrollTo({ top: 0, behavior: prefersReducedMotion() ? "auto" : "smooth" })
      }
      className={cn(dockItem(), "h-auto border-0 bg-transparent text-[10px]", className)}
    >
      <DockIcon icon={ArrowUp} label="Top" />
    </Button>
  );
}
