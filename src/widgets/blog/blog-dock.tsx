import { Link } from "@tanstack/react-router";
import { BookOpen, ChevronLeft, ChevronRight, House } from "lucide-react";
import type { BlogPost } from "@/content/blog";
import { cn } from "@/lib/utils";
import { dockItem } from "@/shared/ui/dock";
import { useDockRipple } from "@/shared/ui/dock-ripple";

import { DockDisabled, DockShell, DockTop, DockIcon as Inner } from "@/shared/ui/dock-shell";

/** Mobile bottom dock for the blog, mirroring the case-study dock. */

const item = dockItem();
const articleItem = cn(item, "min-w-0 flex-1 px-1 tracking-normal");
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
  const ripple = useDockRipple();
  return (
    <DockShell label="Article controls" progress>
      {newer ? (
        <Link
          to="/blog/$slug"
          params={{ slug: newer.slug }}
          aria-label={`Newer article: ${newer.frontmatter.title}`}
          className={articleItem}
          {...ripple}
        >
          <Inner icon={ChevronLeft} label="Newer" />
        </Link>
      ) : (
        <DockDisabled className={articleItem}>
          <Inner icon={ChevronLeft} label="Newer" />
        </DockDisabled>
      )}
      <Link to="/" aria-label="Home" className={articleItem} {...ripple}>
        <Inner icon={House} label="Home" />
      </Link>
      <Link to="/blog" aria-label="All articles" className={articleItem} {...ripple}>
        <Inner icon={BookOpen} label="Articles" />
      </Link>
      <DockTop className={articleItem} />
      {older ? (
        <Link
          to="/blog/$slug"
          params={{ slug: older.slug }}
          aria-label={`Older article: ${older.frontmatter.title}`}
          className={articleItem}
          {...ripple}
        >
          <Inner icon={ChevronRight} label="Older" />
        </Link>
      ) : (
        <DockDisabled className={articleItem}>
          <Inner icon={ChevronRight} label="Older" />
        </DockDisabled>
      )}
    </DockShell>
  );
}

export function BlogIndexDock() {
  const ripple = useDockRipple();
  return (
    <DockShell label="Blog controls" size="compact">
      <Link to="/" aria-label="Back to home" className={item} {...ripple}>
        <Inner icon={House} label="Home" />
      </Link>
      <DockTop />
    </DockShell>
  );
}
