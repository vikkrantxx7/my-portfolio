import { Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { ThemeToggle } from "@/features/theme-toggle/theme-toggle";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/shared/ui/button";

/** Blog chrome: same glass bar as case studies, back link + theme toggle on every size. */
export function BlogHeader({ back }: { back: "home" | "blog" }) {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/70 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6 md:px-16">
        {back === "home" ? (
          <Link to="/" className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "-ml-3")}>
            <ArrowLeft className="size-4" aria-hidden="true" />
            Home
          </Link>
        ) : (
          <Link to="/blog" className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "-ml-3")}>
            <ArrowLeft className="size-4" aria-hidden="true" />
            All articles
          </Link>
        )}
        <ThemeToggle />
      </div>
    </header>
  );
}
