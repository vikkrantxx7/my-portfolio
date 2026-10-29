import { Link } from "@tanstack/react-router";
import { ArrowLeft, House } from "lucide-react";
import { ThemeToggle } from "@/features/theme-toggle/theme-toggle";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/shared/ui/button";
import { PageHeader } from "@/shared/ui/page-header";

/**
 * Blog chrome: desktop keeps the home page's glass top bar with a back link and
 * theme toggle; phones get a floating toggle (back lives in the bottom dock).
 */
export function BlogHeader({ back }: { back: "home" | "blog" }) {
  return (
    <PageHeader actions={<ThemeToggle />} floatingTestId="blog-theme-float">
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
    </PageHeader>
  );
}
