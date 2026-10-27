import { MDXProvider } from "@mdx-js/react";
import { Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import { Children, type ComponentProps, isValidElement, type ReactNode } from "react";

function textOf(node: ReactNode): string {
  return Children.toArray(node)
    .map((c) => (typeof c === "string" || typeof c === "number" ? String(c) : isValidElement(c) ? textOf((c.props as { children?: ReactNode }).children) : ""))
    .join("");
}

export const slugify = (node: ReactNode) =>
  textOf(node)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

const linkClass =
  "inline-flex items-center gap-1 text-primary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

function ProseLink({ href = "", children }: ComponentProps<"a">) {
  if (href.startsWith("/"))
    return (
      <Link to={href} className={linkClass}>
        {children}
      </Link>
    );
  return (
    <a href={href} target="_blank" rel="noreferrer" className={linkClass}>
      {children}
      <ArrowUpRight className="size-4" aria-hidden="true" />
    </a>
  );
}

export function Callout({ kind, children }: { kind: "decision" | "plan"; children: ReactNode }) {
  return (
    <aside className="rounded-lg border border-border bg-card p-4 leading-relaxed text-muted-foreground">
      <p className="mb-1 font-mono text-xs text-secondary">{kind === "plan" ? "Planned" : "Decision"}</p>
      {children}
    </aside>
  );
}

export const proseComponents = {
  h2: ({ children }: ComponentProps<"h2">) => (
    <h2 id={slugify(children)} className="scroll-mt-24 border-t border-border pt-10 text-2xl font-semibold">
      {children}
    </h2>
  ),
  h3: ({ children }: ComponentProps<"h3">) => (
    <h3 id={slugify(children)} className="scroll-mt-24 text-lg font-medium">
      {children}
    </h3>
  ),
  p: (props: ComponentProps<"p">) => <p className="leading-relaxed text-muted-foreground" {...props} />,
  ul: (props: ComponentProps<"ul">) => (
    <ul className="list-disc space-y-4 pl-5 leading-relaxed text-muted-foreground" {...props} />
  ),
  ol: (props: ComponentProps<"ol">) => (
    <ol className="list-decimal space-y-4 pl-5 leading-relaxed text-muted-foreground" {...props} />
  ),
  a: ProseLink,
  code: (props: ComponentProps<"code">) => (
    <code className="rounded bg-card px-1.5 py-0.5 font-mono text-sm text-foreground" {...props} />
  ),
  pre: (props: ComponentProps<"pre">) => (
    <pre className="overflow-x-auto rounded-lg border border-border bg-card p-4 font-mono text-sm" {...props} />
  ),
  blockquote: (props: ComponentProps<"blockquote">) => (
    <blockquote className="border-l-2 border-primary pl-4 italic text-muted-foreground" {...props} />
  ),
  table: (props: ComponentProps<"table">) => (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm" {...props} />
    </div>
  ),
  th: (props: ComponentProps<"th">) => <th className="border-b border-border py-2 pr-4 font-medium" {...props} />,
  td: (props: ComponentProps<"td">) => (
    <td className="border-b border-border py-2 pr-4 text-muted-foreground" {...props} />
  ),
  Callout,
};

/** Styles MDX content with site tokens; extra embeds can be supplied per page. */
export function Prose({
  children,
  components,
}: {
  children: ReactNode;
  components?: Record<string, unknown>;
}) {
  return (
    <MDXProvider components={{ ...proseComponents, ...(components as object) }}>
      <div className="space-y-6">{children}</div>
    </MDXProvider>
  );
}
