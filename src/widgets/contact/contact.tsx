import { Copy, Github, Linkedin, Mail } from "lucide-react";
import { useState } from "react";
import { content } from "@/content/data";
import { Button, buttonVariants } from "@/shared/ui/button";
import { SectionHeading } from "@/shared/ui/section-heading";

export function Contact() {
  const { profile } = content;
  const [copied, setCopied] = useState(false);
  const copy = () =>
    navigator.clipboard?.writeText(profile.email).then(() => {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    });

  return (
    <section id="about" className="min-h-[60vh] scroll-mt-20 space-y-8">
      <SectionHeading index="06" label="About & contact" title="Let's build something." />
      <p className="max-w-xl text-muted-foreground">{profile.summary}</p>
      <div className="flex flex-wrap items-center gap-3">
        <a
          href={`mailto:${profile.email}`}
          aria-label={`Email ${profile.name.split(" ")[0]} at ${profile.email}`}
          className={buttonVariants({ variant: "glow" })}
        >
          <Mail className="size-4" aria-hidden="true" />
          {profile.email}
        </a>
        <Button variant="ghost" onClick={copy} aria-label="Copy email address">
          <Copy className="size-4" aria-hidden="true" />
          Copy
        </Button>
        <a
          href={profile.links.linkedin}
          target="_blank"
          rel="noreferrer"
          aria-label="LinkedIn profile (opens in a new tab)"
          className={buttonVariants({ variant: "ghost" })}
        >
          <Linkedin className="size-4" aria-hidden="true" />
          LinkedIn
        </a>
        <a
          href={profile.links.github}
          target="_blank"
          rel="noreferrer"
          aria-label="GitHub profile (opens in a new tab)"
          className={buttonVariants({ variant: "ghost" })}
        >
          <Github className="size-4" aria-hidden="true" />
          GitHub
        </a>
      </div>
      <p role="status" className="h-5 text-sm text-primary">
        {copied ? "Email copied" : ""}
      </p>
    </section>
  );
}
