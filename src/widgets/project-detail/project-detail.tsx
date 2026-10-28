import { ArrowUpRight } from "lucide-react";
import { caseStudyBodies } from "@/content/case-study-bodies";
import { projectArtwork } from "@/content/project-artwork";
import type { Project } from "@/content/types";
import { useTheme } from "@/features/theme-toggle/use-theme";
import { buttonVariants } from "@/shared/ui/button";
import { Prose } from "@/shared/ui/prose/prose";
import { Tag } from "@/shared/ui/tag";
import { ArchitectureDiagram } from "@/widgets/architecture-diagram/architecture-diagram";

export function ProjectDetail({ project }: { project: Project }) {
  const theme = useTheme();
  const mdx = caseStudyBodies[project.slug];
  const study = mdx ? { ...project.caseStudy, ...mdx.frontmatter } : project.caseStudy;
  return (
    <>
      <header className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="font-mono text-sm text-secondary">{project.category}</p>
          <Tag tone="accent">{study.status}</Tag>
        </div>
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
        <a
          href={study.repository}
          target="_blank"
          rel="noreferrer"
          className={buttonVariants({ variant: "ghost" })}
        >
          View repository
          <ArrowUpRight className="size-4" aria-hidden="true" />
        </a>
      </header>
      {projectArtwork[project.slug] && (
        <img
          src={projectArtwork[project.slug][theme]}
          alt=""
          width={1024}
          height={640}
          className="aspect-[8/5] w-full rounded-lg object-cover"
        />
      )}
      {mdx ? (
        <Prose components={{ Diagram: () => <ArchitectureDiagram diagram={study.diagram} /> }}>
          <mdx.Body />
        </Prose>
      ) : (
        <>
          <section className="space-y-5 border-t border-border pt-10">
            <h2 className="text-2xl font-semibold">Overview</h2>
            <p className="leading-relaxed text-muted-foreground">{study.overview}</p>
          </section>
          <section className="space-y-6 border-t border-border pt-10">
            <h2 className="text-2xl font-semibold">System design</h2>
            <ArchitectureDiagram diagram={study.diagram} />
            <ol className="grid gap-8 sm:grid-cols-2">
              {study.architecture.map((layer, index) => (
                <li key={layer.title} className="space-y-3">
                  <p className="font-mono text-xs text-primary">0{index + 1}</p>
                  <h3 className="text-lg font-medium">{layer.title}</h3>
                  <p className="leading-relaxed text-muted-foreground">{layer.detail}</p>
                </li>
              ))}
            </ol>
          </section>
          <section className="space-y-6 border-t border-border pt-10">
            <h2 className="text-2xl font-semibold">Decisions</h2>
            <dl className="space-y-6">
              {study.decisions.map((decision) => (
                <div key={decision.title} className="grid gap-2 sm:grid-cols-[1fr_2fr] sm:gap-8">
                  <dt className="font-medium">{decision.title}</dt>
                  <dd className="leading-relaxed text-muted-foreground">{decision.detail}</dd>
                </div>
              ))}
            </dl>
          </section>
          <section className="space-y-5 border-t border-border pt-10">
            <h2 className="text-2xl font-semibold">Implementation</h2>
            <ul className="list-disc space-y-4 pl-5 leading-relaxed text-muted-foreground">
              {study.implementation.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>
          <section className="space-y-5 border-t border-border pt-10">
            <h2 className="text-2xl font-semibold">Results and learnings</h2>
            {study.results.map((item) => (
              <p key={item} className="leading-relaxed text-muted-foreground">
                {item}
              </p>
            ))}
          </section>
        </>
      )}
      <section className="space-y-5 border-t border-border pt-10">
        <h2 className="text-2xl font-semibold">Links and source evidence</h2>
        <ul className="grid gap-4 sm:grid-cols-2">
          {study.sources.map((source) => (
            <li key={source.path}>
              <a
                className="inline-flex items-center gap-2 text-primary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                href={`${study.repository}/blob/main/${source.path}`}
                target="_blank"
                rel="noreferrer"
              >
                {source.label}
                <ArrowUpRight className="size-4" aria-hidden="true" />
              </a>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
