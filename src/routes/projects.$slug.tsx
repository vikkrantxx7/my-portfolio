import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { content } from "@/content/data";
import { buttonVariants } from "@/shared/ui/button";
import { ProjectDetail } from "@/widgets/project-detail/project-detail";

export const Route = createFileRoute("/projects/$slug")({
  loader: ({ params }) => {
    const project = content.projects.find((item) => item.slug === params.slug);
    if (!project) throw notFound();
    return project;
  },
  head: ({ loaderData }) => ({
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
      { name: "twitter:card", content: "summary_large_image" },
    ],
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
    <main className="mx-auto max-w-4xl space-y-8 px-6 py-16 md:py-24">
      <Link to="/" hash="work" className={buttonVariants({ variant: "ghost", size: "sm" })}>
        <ArrowLeft className="size-4" aria-hidden="true" />
        Selected work
      </Link>
      <ProjectDetail project={project} />
    </main>
  );
}
