import type { ReactNode } from "react";

/** Shared subpage chrome; page widgets supply navigation and theme controls. */
export function PageHeader({ children, actions, floatingTestId }: {
  children: ReactNode;
  actions: ReactNode;
  floatingTestId?: string;
}) {
  return <>
    <header className="sticky top-0 z-50 hidden border-b border-border bg-background/70 backdrop-blur-xl md:block">
      <div className="mx-auto grid h-16 max-w-6xl grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-6 md:px-16">
        <div className="min-w-0">{children}</div>
        <div className="shrink-0">{actions}</div>
      </div>
    </header>
    <div data-testid={floatingTestId} className="fixed top-3 right-6 z-50 md:hidden">{actions}</div>
  </>;
}