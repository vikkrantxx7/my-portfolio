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

/** The pill itself, for docks that need custom positioning (e.g. inside a dialog). */
export function DockBar({
  tone,
  size = "full",
  className,
  children,
  ...props
}: {
  tone?: "theme" | "fixed";
  size?: "full" | "compact";
  className?: string;
  children: ReactNode;
} & Record<string, unknown>) {
  return (
    <div {...props} className={cn(dockBar({ tone, size }), "relative", className)}>
      {children}
    </div>
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
      <DockBar size={size}>
        {progress && <DockProgress />}
        {children}
      </DockBar>
    </DockPosition>
  );
}

export function DockIcon({
  icon: Icon,
  label,
  tone = "theme",
}: {
  icon: LucideIcon;
  label: string;
  tone?: "theme" | "fixed";
}) {
  return (
    <>
      <Icon
        className={cn(
          "size-5 shrink-0 drop-shadow-[0_0_8px_var(--color-primary)]",
          tone === "fixed" ? "text-[#62F4E0]" : "text-primary",
        )}
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
