import { ThemeToggle } from "@/features/theme-toggle/theme-toggle";
import { ProjectBackLink } from "./project-back-link";

/**
 * Case-study chrome: desktop keeps the home page's glass top bar with a back
 * link and theme toggle; phones get a floating toggle (back lives in the dock).
 */
export function ProjectHeader() {
  return (
    <>
      <header className="sticky top-0 z-50 hidden border-b border-border bg-background/70 backdrop-blur-xl md:block">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6 md:px-16">
          <ProjectBackLink />
          <ThemeToggle />
        </div>
      </header>
      <div className="fixed top-3 right-6 z-50 md:hidden">
        <ThemeToggle />
      </div>
    </>
  );
}
