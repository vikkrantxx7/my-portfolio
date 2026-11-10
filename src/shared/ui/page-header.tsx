import type { ReactNode } from "react";
import { MusicAmbient } from "./music-ambient";
import { ScrollProgress } from "./scroll-progress";

/** Shared subpage chrome; page widgets supply navigation and theme controls. */
export function PageHeader({
  children,
  actions,
  floatingTestId,
}: {
  readonly children: ReactNode;
  readonly actions: ReactNode;
  readonly floatingTestId?: string;
}) {
  return (
    <>
      <header className="sticky top-0 z-50 isolate hidden border-b border-border bg-background/70 backdrop-blur-xl md:block">
        <MusicAmbient kind="header" />
        <div className="relative z-10 mx-auto grid h-16 max-w-6xl grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-6 md:px-16">
          <div className="min-w-0">{children}</div>
          <div className="shrink-0">{actions}</div>
        </div>
        <ScrollProgress />
      </header>
      <div data-testid={floatingTestId} className="fixed top-3 right-6 z-50 md:hidden">
        {actions}
      </div>
    </>
  );
}
