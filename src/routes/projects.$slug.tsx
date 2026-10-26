import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { content } from "@/content/data";
import { projectArtwork } from "@/content/project-artwork";
import { buttonVariants } from "@/shared/ui/button";
import { Tag } from "@/shared/ui/tag";

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
      <p className="font-mono text-sm text-secondary">{project.category}</p>
      <h1 className="break-words text-4xl font-semibold sm:text-5xl">{project.title}</h1>
      <p className="max-w-2xl text-lg leading-relaxed text-muted-foreground">{project.problem}</p>
      <p>
        <span className="text-muted-foreground">My role · </span>
        {project.role}
      </p>
      <div className="flex flex-wrap gap-2">
        {project.tech.map((tech) => (
          <Tag key={tech}>{tech}</Tag>
        ))}
      </div>
      {projectArtwork[project.slug] && (
        <img
          src={projectArtwork[project.slug]}
          alt=""
          width={1024}
          height={640}
          className="aspect-[8/5] w-full rounded-lg object-cover"
        />
      )}
    </main>
  );
}
