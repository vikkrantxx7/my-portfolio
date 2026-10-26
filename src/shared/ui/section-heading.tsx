import type { ReactNode } from "react";

interface Props {
  index: string;
  label: string;
  title: ReactNode;
  description?: ReactNode;
}

export function SectionHeading({ index, label, title, description }: Props) {
  return (
    <header className="max-w-2xl space-y-4">
      <p className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.2em] text-primary">
        <span aria-hidden className="size-1.5 rounded-full bg-primary shadow-glow" />
        {`${index} / ${label}`}
      </p>
      <h2 className="text-4xl font-semibold tracking-tight text-foreground md:text-5xl">{title}</h2>
      {description && <p className="text-base text-muted-foreground">{description}</p>}
    </header>
  );
}
