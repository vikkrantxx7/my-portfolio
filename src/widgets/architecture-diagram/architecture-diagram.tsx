import { motion } from "motion/react";
import { useState } from "react";
import type { Diagram } from "@/content/types";
import { cn } from "@/lib/utils";
import { usePrefersReducedMotion } from "@/shared/lib/use-prefers-reduced-motion";

/** The box itself plus every box it connects to directly. */
export function connectedIds(diagram: Diagram, id: string): Set<string> {
  const ids = new Set([id]);
  for (const e of diagram.edges) {
    if (e.from === id) ids.add(e.to);
    if (e.to === id) ids.add(e.from);
  }
  return ids;
}

type State = "idle" | "active" | "related" | "dimmed";

const nodeCls: Record<State, string> = {
  idle: "border-border text-foreground",
  active: "border-primary text-primary shadow-glow",
  related: "border-secondary text-foreground",
  dimmed: "border-border text-muted-foreground opacity-40",
};

export function ArchitectureDiagram({ diagram }: { diagram: Diagram }) {
  const [active, setActive] = useState<string | null>(null);
  const reduced = usePrefersReducedMotion();
  const related = active ? connectedIds(diagram, active) : null;
  const labels = new Map(diagram.layers.flatMap((l) => l.nodes.map((n) => [n.id, n.label])));

  const nodeState = (id: string): State =>
    !related ? "idle" : id === active ? "active" : related.has(id) ? "related" : "dimmed";
  const edgeState = (from: string, to: string): State =>
    !active ? "idle" : from === active || to === active ? "related" : "dimmed";

  return (
    <div
      className="space-y-6"
      onKeyDown={(e) => {
        if (e.key === "Escape") setActive(null);
      }}
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {diagram.layers.map((layer, index) => {
          const body = (
            <>
              <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
                {layer.title}
              </p>
              <ul className="space-y-2">
                {layer.nodes.map((node) => {
                  const state = nodeState(node.id);
                  return (
                    <li key={node.id}>
                      <button
                        type="button"
                        data-state={state}
                        aria-pressed={state === "active"}
                        onMouseEnter={() => setActive(node.id)}
                        onMouseLeave={() => setActive(null)}
                        onFocus={() => setActive(node.id)}
                        onBlur={() => setActive(null)}
                        className={cn(
                          "w-full rounded-md border bg-background px-3 py-2 text-left text-sm transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                          nodeCls[state],
                        )}
                      >
                        {node.label}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </>
          );
          const cls = "space-y-3 rounded-lg border border-border bg-card p-4";
          return reduced ? (
            <div key={layer.title} className={cls}>
              {body}
            </div>
          ) : (
            <motion.div
              key={layer.title}
              className={cls}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ delay: index * 0.12, duration: 0.4 }}
            >
              {body}
            </motion.div>
          );
        })}
      </div>
      <div className="space-y-2">
        <h3 id="diagram-connections" className="text-sm font-medium text-muted-foreground">
          Connections
        </h3>
        <ul aria-labelledby="diagram-connections" className="grid gap-1 text-sm sm:grid-cols-2">
          {diagram.edges.map((e) => {
            const state = edgeState(e.from, e.to);
            return (
              <li
                key={`${e.from}-${e.to}`}
                data-state={state}
                className={cn(
                  "transition-opacity duration-200",
                  state === "related" ? "text-primary" : "text-muted-foreground",
                  state === "dimmed" && "opacity-40",
                )}
              >
                {`${labels.get(e.from)} ${e.label} ${labels.get(e.to)}`}
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
