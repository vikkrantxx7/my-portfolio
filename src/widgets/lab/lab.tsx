import { content } from "@/content/data";
import { achievementHash, navigateToAchievement } from "@/features/deep-link/deep-link";
import { SectionHeading } from "@/shared/ui/section-heading";
import { Tag } from "@/shared/ui/tag";

export function EngineeringLab() {
  return (
    <section id="lab" aria-labelledby="lab-title" className="scroll-mt-20 space-y-10">
      <div id="lab-title">
        <SectionHeading index="05" label="Engineering lab" title="Experiments and notes." />
      </div>
      <div className="grid gap-6 md:grid-cols-3">
        {content.lab.map((entry) => {
          const [expId, achId] = entry.achievementRef?.split("/") ?? [];
          return (
            <article
              key={entry.id}
              className="flex flex-col gap-4 rounded-lg border border-border bg-card p-6 transition-colors hover:border-primary/50"
            >
              <p className="font-mono text-xs uppercase tracking-wider text-secondary">
                {entry.kind}
              </p>
              <h3 className="text-lg font-medium">{entry.title}</h3>
              <p className="flex-1 leading-relaxed text-muted-foreground">{entry.summary}</p>
              <div className="flex flex-wrap gap-2">
                {entry.tags.map((tag) => (
                  <Tag key={tag}>{tag}</Tag>
                ))}
              </div>
              {expId && achId && (
                <a
                  href={achievementHash(expId, achId)}
                  onClick={(event) => {
                    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
                    event.preventDefault();
                    navigateToAchievement(achievementHash(expId, achId));
                  }}
                  className="text-sm text-primary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  See it in my career timeline
                </a>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}
