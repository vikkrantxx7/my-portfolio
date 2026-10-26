import { createFileRoute } from "@tanstack/react-router";
import { content } from "@/content/data";
import { Snapshot } from "@/widgets/snapshot/snapshot";
import { Hero } from "@/widgets/hero/hero";
import { SectionHeading } from "@/shared/ui/section-heading";
import { Tag } from "@/shared/ui/tag";
import { SiteNav } from "@/widgets/nav/site-nav";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Vikrant Sharma — I build systems, not just screens" },
      {
        name: "description",
        content:
          "Senior software engineer portfolio: frontend architecture, case studies and AI-enabled products.",
      },
      { property: "og:title", content: "Vikrant Sharma — I build systems, not just screens" },
      {
        property: "og:description",
        content:
          "Senior software engineer portfolio: frontend architecture, case studies and AI-enabled products.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  const { profile, projects, experiences } = content;
  return (
    <>
      <SiteNav />
      <main id="top" className="min-h-screen bg-background">
        <Hero />
        <div className="px-6 py-24 md:px-16">
          <div className="mx-auto max-w-6xl space-y-32">
            <Snapshot />
            <section id="work" className="min-h-[60vh] scroll-mt-20 space-y-8">
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
                {projects
                  .flatMap((p) => p.tech)
                  .filter((t, i, a) => a.indexOf(t) === i)
                  .map((t) => (
                    <Tag key={t} tone="accent">
                      {t}
                    </Tag>
                  ))}
              </div>
            </section>
            <section id="experience" className="min-h-[60vh] scroll-mt-20 space-y-8">
              <SectionHeading index="04" label="Experience" title="Where I've worked." />
              <ul className="space-y-3 text-muted-foreground">
                {experiences.map((e) => (
                  <li key={e.id}>
                    <span className="text-foreground">{e.company}</span> — {e.role}
                  </li>
                ))}
              </ul>
            </section>
            <section id="about" className="min-h-[60vh] scroll-mt-20 space-y-8">
              <SectionHeading index="06" label="About" title="A bit about me." />
              <p className="max-w-xl text-muted-foreground">{profile.summary}</p>
            </section>
          </div>
        </div>
      </main>
    </>
  );
}
