import { Link } from "@tanstack/react-router";
import { ArrowUp, BookOpen, ChevronLeft, ChevronRight, House, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import type { BlogPost } from "@/content/blog";
import { prefersReducedMotion } from "@/shared/lib/use-prefers-reduced-motion";
import { dockBar, dockItem } from "@/shared/ui/dock";

/** Mobile bottom dock for the blog, mirroring the case-study dock. */

const item = dockItem();
const glow = "size-5 text-primary drop-shadow-[0_0_8px_var(--color-primary)]";

function Inner({ icon: Icon, label }: { icon: LucideIcon; label: string }) {
  return (
    <>
      <Icon className={glow} aria-hidden="true" />
      <span>{label}</span>
    </>
  );
}

function Disabled({ children }: { children: ReactNode }) {
  return (
    <span aria-disabled="true" className={`${item} opacity-35`}>
      {children}
    </span>
  );
}

function DockShell({ label, children }: { label: string; children: ReactNode }) {
  return (
    <nav
      aria-label={label}
      className="pointer-events-none fixed inset-x-0 bottom-0 z-40 flex justify-center px-4 pb-[calc(env(safe-area-inset-bottom)+1rem)] md:hidden"
    >
      <div className={dockBar()}>{children}</div>
    </nav>
  );
}

const toTop = () =>
  window.scrollTo({ top: 0, behavior: prefersReducedMotion() ? "auto" : "smooth" });

/** Newest-first, so index - 1 is the newer post and index + 1 the older one. */
export function adjacentPosts(posts: BlogPost[], slug: string) {
  const index = posts.findIndex((post) => post.slug === slug);
  if (index === -1) return { newer: null, older: null };
  return {
    newer: posts[index - 1] ?? null,
    older: posts[index + 1] ?? null,
  };
}

export function BlogArticleDock({ posts, slug }: { posts: BlogPost[]; slug: string }) {
  const { newer, older } = adjacentPosts(posts, slug);
  return (
    <DockShell label="Article controls">
      {newer ? (
        <Link
          to="/blog/$slug"
          params={{ slug: newer.slug }}
          aria-label={`Newer article: ${newer.frontmatter.title}`}
          className={item}
        >
          <Inner icon={ChevronLeft} label="Newer" />
        </Link>
      ) : (
        <Disabled>
          <Inner icon={ChevronLeft} label="Newer" />
        </Disabled>
      )}
      <Link to="/blog" aria-label="All articles" className={item}>
        <Inner icon={BookOpen} label="Blog" />
      </Link>
      <button type="button" onClick={toTop} aria-label="Back to top" className={item}>
        <Inner icon={ArrowUp} label="Top" />
      </button>
      {older ? (
        <Link
          to="/blog/$slug"
          params={{ slug: older.slug }}
          aria-label={`Older article: ${older.frontmatter.title}`}
          className={item}
        >
          <Inner icon={ChevronRight} label="Older" />
        </Link>
      ) : (
        <Disabled>
          <Inner icon={ChevronRight} label="Older" />
        </Disabled>
      )}
    </DockShell>
  );
}

export function BlogIndexDock() {
  return (
    <DockShell label="Blog controls">
      <Link to="/" aria-label="Back to home" className={item}>
        <Inner icon={House} label="Home" />
      </Link>
      <button type="button" onClick={toTop} aria-label="Back to top" className={item}>
        <Inner icon={ArrowUp} label="Top" />
      </button>
    </DockShell>
  );
}
