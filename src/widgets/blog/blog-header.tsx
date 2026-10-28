import { Link } from "@tanstack/react-router";
import { ArrowLeft, House } from "lucide-react";
import { ThemeToggle } from "@/features/theme-toggle/theme-toggle";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/shared/ui/button";

/**
 * Blog chrome: desktop keeps the home page's glass top bar with a back link and
 * theme toggle; phones get a floating toggle (back lives in the bottom dock).
 */
export function BlogHeader({ back }: { back: "home" | "blog" }) {
  return (
    <>
      <header className="sticky top-0 z-50 hidden border-b border-border bg-background/70 backdrop-blur-xl md:block">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6 md:px-16">
          {back === "home" ? (
            <Link to="/" className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "-ml-3")}>
              <ArrowLeft className="size-4" aria-hidden="true" />
              Home
            </Link>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/blog"
                className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "-ml-3")}
              >
                <ArrowLeft className="size-4" aria-hidden="true" />
                All articles
              </Link>
              <Link
                to="/"
                aria-label="Home"
                title="Home"
                className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "size-9 px-0")}
              >
                <House className="size-4" aria-hidden="true" />
              </Link>
            </div>
          )}
          <ThemeToggle />
        </div>
      </header>
      <div data-testid="blog-theme-float" className="fixed top-3 right-6 z-50 md:hidden">
        <ThemeToggle />
      </div>
    </>
  );
}
