import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { findPost } from "@/content/blog";
import { site } from "@/content/site";
import { pageUrl } from "@/shared/lib/seo";
import { buttonVariants } from "@/shared/ui/button";
import { Prose } from "@/shared/ui/prose/prose";
import { Tag } from "@/shared/ui/tag";
import { BlogArticleDock } from "@/widgets/blog/blog-dock";
import { BlogHeader } from "@/widgets/blog/blog-header";

export const Route = createFileRoute("/blog/$slug")({
  staticData: { sitemap: true },
  loader: ({ params }) => {
    const post = findPost(params.slug);
    if (!post) throw notFound();
    return { slug: post.slug, frontmatter: post.frontmatter, cover: post.cover };
  },
  head: ({ loaderData, params }) => {
    const fm = loaderData?.frontmatter;
    const title = `${fm?.title ?? "Article not found"} — ${site.titleSuffix}`;
    const description = fm?.description ?? "This article does not exist.";
    const url = pageUrl(`/blog/${params.slug}`);
    const image = loaderData ? `${site.url}${loaderData.cover.ogUrl}` : undefined;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "article" },
        { property: "og:url", content: url },
        { name: "twitter:card", content: "summary_large_image" },
        ...(image
          ? [
              { property: "og:image", content: image },
              { name: "twitter:image", content: image },
            ]
          : [{ name: "robots", content: "noindex" }]),
      ],
      links: [{ rel: "canonical", href: url }],
      scripts: fm
        ? [
            {
              type: "application/ld+json",
              children: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "BlogPosting",
                headline: fm.title,
                description: fm.description,
                datePublished: fm.publishedAt,
                author: { "@type": "Person", name: site.author },
                image,
                url,
                keywords: fm.tags.join(", "),
              }),
            },
          ]
        : [],
    };
  },
  component: BlogArticle,
  notFoundComponent: () => (
    <main className="mx-auto max-w-3xl space-y-6 px-6 py-24">
      <h1 className="text-3xl font-semibold">Article not found</h1>
      <Link to="/blog" className={buttonVariants({ variant: "ghost" })}>
        Back to all articles
      </Link>
    </main>
  ),
});

function BlogArticle() {
  const { slug, frontmatter: fm, cover } = Route.useLoaderData();
  const Body = findPost(slug)?.Body;
  return (
    <>
      <BlogHeader back="blog" />
      <main className="mx-auto max-w-3xl space-y-10 px-6 pt-12 pb-24">
        <header className="space-y-5">
          <p className="flex flex-wrap items-center gap-3 font-mono text-xs uppercase tracking-[0.16em] text-muted-foreground">
            <time dateTime={fm.publishedAt}>{fm.publishedAt}</time>
            <span aria-hidden>·</span>
            <span>{fm.readingMinutes} min read</span>
          </p>
          <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">{fm.title}</h1>
          <p className="text-lg text-muted-foreground">{fm.description}</p>
          <div className="flex flex-wrap gap-2">
            {fm.tags.map((t) => (
              <Link key={t} to="/blog" search={{ tag: t.toLowerCase() }}>
                <Tag tone="accent">{t}</Tag>
              </Link>
            ))}
          </div>
        </header>
        <img
          src={cover.url}
          alt={fm.coverAlt ?? ""}
          width={1536}
          height={1024}
          className="aspect-[3/2] w-full rounded-xl border border-border object-cover"
        />
        <article>{Body && <Prose><Body /></Prose>}</article>
      </main>
      <BlogArticleDock posts={blogPosts} slug={slug} />
    </>
  );
}
