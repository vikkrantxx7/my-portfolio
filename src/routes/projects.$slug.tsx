import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { content } from "@/content/data";
import { pageUrl } from "@/shared/lib/seo";
import { buttonVariants } from "@/shared/ui/button";
import { ProjectBackLink } from "@/widgets/project-detail/project-back-link";
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
      { title: `${loaderData?.title ?? "Project not found"} — Vikrant Sharma` },
      {
        name: "description",
        content: loaderData?.problem ?? "This project is not in Vikrant Sharma's portfolio.",
      },
      {
        property: "og:title",
        content: `${loaderData?.title ?? "Project not found"} — Vikrant Sharma`,
      },
      {
        property: "og:description",
        content: loaderData?.problem ?? "This project is not in Vikrant Sharma's portfolio.",
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
    <main className="mx-auto max-w-4xl space-y-8 px-6 pt-16 pb-32 md:py-24">
      <ProjectBackLink />
      <ProjectDetail project={project} />
      <ProjectPager projects={content.projects} slug={project.slug} />
      <ProjectDock projects={content.projects} slug={project.slug} />
    </main>
  );
}
