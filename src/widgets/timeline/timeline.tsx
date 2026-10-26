import { content } from "@/content/data";
import type { Experience } from "@/content/types";
import { AchievementDisclosure } from "@/features/expand-achievement/achievement-disclosure";
import { SectionHeading } from "@/shared/ui/section-heading";

function formatMonth(value: string) {
  return new Intl.DateTimeFormat("en", { month: "short", year: "numeric", timeZone: "UTC" }).format(
    new Date(`${value}-01T00:00:00Z`),
  );
}

export function CareerTimeline({ experiences = content.experiences }: { experiences?: Experience[] }) {
  const orderedExperiences = [...experiences].sort((a, b) => b.start.localeCompare(a.start));

  return (
    <section id="experience" aria-labelledby="career-heading" className="scroll-mt-24 space-y-12">
      <SectionHeading index="04" label="Experience" title={<span id="career-heading">Where I've worked.</span>} />
      <ol className="relative ml-2 border-l border-border md:ml-0">
        {orderedExperiences.map((experience) => (
          <li key={experience.id} className="relative pb-14 pl-6 last:pb-0 md:pl-10">
            <span aria-hidden="true" className={`absolute -left-1.5 top-2 size-3 rounded-full border border-primary ${experience.end === null ? "bg-primary shadow-glow" : "bg-background"}`} />
            <article aria-labelledby={`role-${experience.id}`} className="grid gap-6 md:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] md:gap-10">
              <header className="space-y-2 md:pt-0.5">
                <p className="font-mono text-xs leading-relaxed text-muted-foreground">
                  <time dateTime={experience.start}>{formatMonth(experience.start)}</time>
                  {" — "}
                  {experience.end ? <time dateTime={experience.end}>{formatMonth(experience.end)}</time> : <span className="text-primary">Present</span>}
                </p>
                <h3 id={`role-${experience.id}`} className="text-2xl font-semibold">{experience.company}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{experience.role}</p>
              </header>
              <ul className="min-w-0 border-t border-border">
                {experience.achievements.map((achievement) => (
                  <AchievementDisclosure key={achievement.id} achievement={achievement} experienceId={experience.id} />
                ))}
              </ul>
            </article>
          </li>
        ))}
      </ol>
    </section>
  );
}