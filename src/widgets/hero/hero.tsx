import { content } from "@/content/data";
import { cn } from "@/lib/utils";
import { scrollToSection } from "@/shared/lib/use-prefers-reduced-motion";
import { Button, buttonVariants } from "@/shared/ui/button";

export function Hero() {
  const { profile } = content;
  return (
    <section
      aria-labelledby="hero-title"
      className="relative isolate flex min-h-[calc(100svh-4rem)] items-center overflow-hidden"
    >
      <div data-hero-bg aria-hidden="true" className="hero-bg absolute inset-0 -z-10">
        <div className="hero-grid absolute inset-0" />
        <div className="hero-bloom absolute -top-1/4 left-1/2 size-[60rem] -translate-x-1/2 rounded-full" />
      </div>
      <div className="mx-auto w-full max-w-6xl space-y-8 px-6 py-24 md:px-16">
        <p className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.2em] text-primary">
          <span aria-hidden className="size-1.5 rounded-full bg-primary shadow-glow" />
          01 / Intro
        </p>
        <h1
          id="hero-title"
          className="max-w-4xl text-5xl font-semibold leading-[1.05] tracking-tight md:text-7xl"
        >
          I build <span className="text-gradient-accent">systems</span>,<br />
          not just screens.
        </h1>
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
          {profile.role}
        </p>
        <p className="max-w-xl text-lg text-muted-foreground">{profile.summary}</p>
        <div className="flex flex-wrap gap-4">
          <Button size="lg" variant="frame" onClick={() => scrollToSection("work")}>
            Explore my work ↘
          </Button>
          <a
            href={profile.resumeUrl}
            download={profile.resumeFileName}
            className={cn(buttonVariants({ variant: "ghost", size: "lg" }))}
          >
            Download resume ↗
          </a>
        </div>
      </div>
    </section>
  );
}
