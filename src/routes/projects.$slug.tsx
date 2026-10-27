import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { content } from "@/content/data";
import { site } from "@/content/site";
import { pageUrl } from "@/shared/lib/seo";
import { buttonVariants } from "@/shared/ui/button";
import { ProjectHeader } from "@/widgets/project-detail/project-header";
import { ProjectDetail } from "@/widgets/project-detail/project-detail";
import { ProjectDock } from "@/widgets/project-detail/project-dock";
import { ProjectPager } from "@/widgets/project-detail/project-pager";

export const Route = createFileRoute("/projects/$slug")({
  staticData: { sitemap: true },
  loader: ({ params }) => {
    const project = content.projects.find((item) => item.slug === params.slug);
    if (!project) throw notFound();
    return project;
  },
  head: ({ loaderData, params }) => ({
    meta: [
      { title: `${loaderData?.title ?? "Project not found"} — ${site.titleSuffix}` },
      {
        name: "description",
        content: loaderData?.problem ?? site.notFoundDescription,
      },
      {
        property: "og:title",
        content: `${loaderData?.title ?? "Project not found"} — ${site.titleSuffix}`,
      },
      {
        property: "og:description",
        content: loaderData?.problem ?? site.notFoundDescription,
      },
      { property: "og:type", content: "article" },
      { property: "og:url", content: pageUrl(`/projects/${params.slug}`) },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: pageUrl(`/projects/${params.slug}`) }],
  }),
  component: ProjectOverview,
  notFoundComponent: () => (
    <main className="mx-auto max-w-4xl space-y-6 px-6 py-24">
      <h1 className="text-3xl font-semibold">Project not found</h1>
      <Link to="/" hash="work" className={buttonVariants({ variant: "ghost" })}>
        Back to selected work
      </Link>
    </main>
  ),
});

function ProjectOverview() {
  const project = Route.useLoaderData();
  return (
    <>
      <ProjectHeader />
      <main className="mx-auto max-w-4xl space-y-8 px-6 pt-16 pb-32 md:pt-12 md:pb-24">
      <ProjectDetail project={project} />
      <ProjectPager projects={content.projects} slug={project.slug} />
      <ProjectDock projects={content.projects} slug={project.slug} />
      </main>
    </>
  );
}
