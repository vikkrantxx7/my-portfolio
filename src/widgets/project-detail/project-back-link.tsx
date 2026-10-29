import { Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/shared/ui/button";

/**
 * Quick return to the work list. Phones get this from the bottom project dock,
 * so the link only shows from the md breakpoint up.
 */
export function ProjectBackLink() {
  return (
    <Link
      to="/"
      hash="work"
      className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "hidden md:inline-flex")}
    >
      <ArrowLeft className="size-4" aria-hidden="true" />
      Selected work
    </Link>
  );
}
