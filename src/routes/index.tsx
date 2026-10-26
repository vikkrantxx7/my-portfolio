import { createFileRoute } from "@tanstack/react-router";
import { content } from "@/content/data";
import { Button } from "@/shared/ui/button";
import { Tag } from "@/shared/ui/tag";
import { SectionHeading } from "@/shared/ui/section-heading";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Vikrant Sharma — I build systems, not just screens" },
      {
        name: "description",
        content: "Senior software engineer portfolio: frontend architecture, case studies and AI-enabled products.",
      },
      { property: "og:title", content: "Vikrant Sharma — I build systems, not just screens" },
      {
        property: "og:description",
        content: "Senior software engineer portfolio: frontend architecture, case studies and AI-enabled products.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  const { profile, projects } = content;
  return (
    <main className="min-h-screen bg-background px-6 py-24 md:px-16">
      <div className="mx-auto max-w-6xl space-y-16">
        <section className="space-y-8">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">{profile.role}</p>
          <h1 className="max-w-4xl text-5xl font-semibold leading-[1.05] tracking-tight md:text-7xl">
            I build <span className="text-primary">systems</span>,<br />
            not just screens.
          </h1>
          <p className="max-w-xl text-lg text-muted-foreground">{profile.summary}</p>
          <div className="flex flex-wrap gap-4">
            <Button>Explore my work ↘</Button>
            <Button variant="ghost">Download resume ↗</Button>
            <Button variant="glow">Engineering lab</Button>
          </div>
        </section>
        <section className="space-y-8">
          <SectionHeading
            index="03"
            label="Selected work"
            title={
              <>
                Things I've <span className="text-gradient-accent">built</span>.
              </>
            }
          />
          <div className="flex flex-wrap gap-2">
            {projects.flatMap((p) => p.tech).filter((t, i, a) => a.indexOf(t) === i).map((t) => (
              <Tag key={t} tone="accent">
                {t}
              </Tag>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
