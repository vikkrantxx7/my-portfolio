import { content } from "@/content/data";
import type { Stat } from "@/content/types";
import { SectionHeading } from "@/shared/ui/section-heading";
import { useCountUp } from "./use-count-up";

function StatCard({ stat }: { stat: Stat }) {
  const { ref, value } = useCountUp<HTMLDivElement>(stat.value);
  return (
    <div ref={ref} className="rounded-xl border border-border bg-card p-6">
      <p
        data-testid={`stat-${stat.id}`}
        className="text-4xl font-semibold tabular-nums text-primary md:text-5xl"
      >
        <span className="sr-only">{`${stat.value}${stat.suffix}`}</span>
        <span aria-hidden>{`${value}${stat.suffix}`}</span>
      </p>
      <p className="mt-2 font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">
        {stat.label}
      </p>
    </div>
  );
}

export function Snapshot() {
  const { strengths, stats, problemAreas } = content.snapshot;
  return (
    <section id="snapshot" aria-labelledby="snapshot-title" className="scroll-mt-20 space-y-12">
      <SectionHeading
        index="02"
        label="Engineering snapshot"
        title={
          <span id="snapshot-title">
            How I <span className="text-gradient-accent">work</span>.
          </span>
        }
      />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((s) => (
          <StatCard key={s.id} stat={s} />
        ))}
      </div>
      <div className="grid gap-10 lg:grid-cols-[2fr_1fr]">
        <ul className="grid gap-4 sm:grid-cols-2">
          {strengths.map((s) => (
            <li key={s.title} className="rounded-xl border border-border bg-card/60 p-6">
              <h3 className="font-semibold text-foreground">{s.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{s.detail}</p>
            </li>
          ))}
        </ul>
        <div>
          <h3 className="font-mono text-xs uppercase tracking-[0.2em] text-secondary">
            Problems I solve
          </h3>
          <ul className="mt-4 space-y-3">
            {problemAreas.map((p) => (
              <li key={p} className="flex gap-3 text-muted-foreground">
                <span aria-hidden className="text-primary">
                  →
                </span>
                {p}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
