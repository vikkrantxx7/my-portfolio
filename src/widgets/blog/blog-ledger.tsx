import { Link } from "@tanstack/react-router";
import { type BlogPost, blogTags, filterPostsByTag } from "@/content/blog";
import { cn } from "@/lib/utils";
import { tagVariants } from "@/shared/ui/tag";

const pill = (active: boolean) =>
  cn(
    tagVariants({ tone: active ? "accent" : "neutral" }),
    "transition-colors hover:border-primary/60 hover:text-primary",
    active && "bg-primary/10",
  );

/** Tabular article ledger with URL-driven tag filter pills. */
export function BlogLedger({ posts, tag }: { posts: BlogPost[]; tag: string }) {
  const tags = blogTags(posts);
  const visible = filterPostsByTag(posts, tag);
  const isActive = (t: string) => t.toLowerCase() === tag.toLowerCase();

  return (
    <div className="space-y-8">
      <nav aria-label="Filter by tag" className="flex flex-wrap gap-2">
        <Link
          to="/blog"
          search={{}}
          aria-current={tag ? undefined : "true"}
          className={pill(!tag)}
        >
          All
        </Link>
        {tags.map((t) => (
          <Link
            key={t}
            to="/blog"
            search={{ tag: t.toLowerCase() }}
            aria-current={isActive(t) ? "true" : undefined}
            className={pill(isActive(t))}
          >
            {t}
          </Link>
        ))}
      </nav>

      {visible.length === 0 ? (
        <p className="font-mono text-sm text-muted-foreground">No articles tagged “{tag}” yet.</p>
      ) : (
        <table aria-label="Articles" className="w-full border-collapse text-left">
          <thead className="hidden md:table-header-group">
            <tr className="border-b border-border font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
              <th className="py-3 pr-6 font-normal">Date</th>
              <th className="py-3 pr-6 font-normal">Article</th>
              <th className="py-3 pr-6 font-normal">Tags</th>
              <th className="py-3 text-right font-normal">Read</th>
            </tr>
          </thead>
          <tbody>
            {visible.map((post) => (
              <tr
                key={post.slug}
                className="group relative flex flex-col gap-2 border-b border-border py-5 transition-colors hover:bg-primary/5 md:table-row"
              >
                <td className="font-mono text-xs text-muted-foreground md:py-5 md:pr-6 md:align-top">
                  <time dateTime={post.frontmatter.publishedAt}>{post.frontmatter.publishedAt}</time>
                </td>
                <td className="md:py-5 md:pr-6">
                  <Link
                    to="/blog/$slug"
                    params={{ slug: post.slug }}
                    className="font-semibold text-foreground transition-colors after:absolute after:inset-0 group-hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    {post.frontmatter.title}
                  </Link>
                  <p className="mt-1 text-sm text-muted-foreground">{post.frontmatter.description}</p>
                </td>
                <td className="md:py-5 md:pr-6 md:align-top">
                  <span className="flex flex-wrap gap-1.5">
                    {post.frontmatter.tags.map((t) => (
                      <span key={t} className={tagVariants({ tone: "neutral" })}>
                        {t}
                      </span>
                    ))}
                  </span>
                </td>
                <td className="font-mono text-xs text-muted-foreground md:py-5 md:text-right md:align-top">
                  {post.frontmatter.readingMinutes} min
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
