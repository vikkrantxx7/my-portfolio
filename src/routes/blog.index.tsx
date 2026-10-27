import { createFileRoute } from "@tanstack/react-router";
import { blogPosts } from "@/content/blog";
import { site } from "@/content/site";
import { pageUrl } from "@/shared/lib/seo";
import { BlogHeader } from "@/widgets/blog/blog-header";
import { BlogLedger } from "@/widgets/blog/blog-ledger";

const title = `Engineering blog — ${site.titleSuffix}`;
const description =
  "Articles on frontend architecture, testing and developer workflow by a lead fullstack engineer.";

export const Route = createFileRoute("/blog/")({
  staticData: { sitemap: true },
  validateSearch: (search: Record<string, unknown>): { tag?: string } =>
    typeof search["tag"] === "string" && search["tag"] ? { tag: search["tag"] } : {},
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { property: "og:url", content: pageUrl("/blog") },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: pageUrl("/blog") }],
  }),
  component: BlogIndex,
});

function BlogIndex() {
  const { tag = "" } = Route.useSearch();
  return (
    <>
      <BlogHeader back="home" />
      <main className="mx-auto max-w-5xl space-y-10 px-6 pt-12 pb-24 md:px-16">
        <header className="space-y-3">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-primary">Writing</p>
          <h1 className="text-4xl font-semibold tracking-tight">Engineering blog</h1>
          <p className="max-w-2xl text-muted-foreground">{description}</p>
        </header>
        <BlogLedger posts={blogPosts} tag={tag} />
      </main>
    </>
  );
}
