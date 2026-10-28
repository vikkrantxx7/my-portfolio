import { useLocation, useRouter } from "@tanstack/react-router";
import { Command as CommandPrimitive } from "cmdk";
import { BookOpen, FolderGit2, Hash, Milestone, Search } from "lucide-react";
import { type ReactNode, useEffect, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { type BlogPost, blogPosts } from "@/content/blog";
import { content as siteContent } from "@/content/data";
import type { Content } from "@/content/types";
import {
  achievementHash,
  navigateToAchievement,
  replaceHash,
} from "@/features/deep-link/deep-link";
import { scrollToSection } from "@/shared/lib/use-prefers-reduced-motion";

type Base = { id: string; label: string; hint: string; keywords?: string[] };
export type PaletteItem =
  | (Base & { kind: "section"; hash: string })
  | (Base & { kind: "project"; slug: string })
  | (Base & { kind: "articles" })
  | (Base & { kind: "article"; slug: string })
  | (Base & { kind: "achievement"; hash: string });

const SECTIONS = [
  { id: "work", label: "Work" },
  { id: "experience", label: "Experience" },
  { id: "about", label: "About & contact" },
];

/** Every typed word must appear somewhere in the item's text. */
export function paletteFilter(value: string, search: string, keywords: string[] = []) {
  const hay = `${value} ${keywords.join(" ")}`.toLowerCase();
  return search
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .every((w) => hay.includes(w))
    ? 1
    : 0;
}

/** Pure: every place the palette can reach, all of which also exist in normal navigation. */
export function buildPaletteItems(c: Content, posts: BlogPost[] = blogPosts): PaletteItem[] {
  return [
    {
      kind: "articles",
      id: "articles",
      label: "All articles",
      hint: "Blog",
      keywords: ["blogs", "posts", "list"],
    },
    ...posts.map(
      (post): PaletteItem => ({
        kind: "article",
        id: `article-${post.slug}`,
        label: post.frontmatter.title,
        hint: "Article",
        slug: post.slug,
        keywords: [post.frontmatter.description, ...post.frontmatter.tags],
      }),
    ),
    ...SECTIONS.map(
      (s): PaletteItem => ({
        kind: "section",
        id: `section-${s.id}`,
        label: s.label,
        hint: "Section",
        hash: `#${s.id}`,
      }),
    ),
    ...c.projects.map(
      (p): PaletteItem => ({
        kind: "project",
        id: `project-${p.slug}`,
        label: p.title,
        hint: p.category,
        slug: p.slug,
        keywords: [p.problem, ...p.tech, ...p.domains],
      }),
    ),
    ...c.experiences.flatMap((e) =>
      e.achievements.map(
        (a): PaletteItem => ({
          kind: "achievement",
          id: `ach-${e.id}-${a.id}`,
          label: a.summary,
          hint: e.company,
          hash: achievementHash(e.id, a.id),
          keywords: [a.context, a.contribution, a.impact, ...a.decisions],
        }),
      ),
    ),
  ];
}

const GROUPS: { kind: PaletteItem["kind"]; heading: string; icon: ReactNode }[] = [
  { kind: "section", heading: "Sections", icon: <Hash aria-hidden /> },
  { kind: "project", heading: "Projects", icon: <FolderGit2 aria-hidden /> },
  { kind: "articles", heading: "Blog", icon: <BookOpen aria-hidden /> },
  { kind: "article", heading: "Articles", icon: <BookOpen aria-hidden /> },
  { kind: "achievement", heading: "Achievements", icon: <Milestone aria-hidden /> },
];

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const { pathname } = useLocation();
  const items = buildPaletteItems(siteContent);

  useEffect(() => {
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key.toLowerCase() === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const select = (item: PaletteItem) => {
    setOpen(false);
    if (item.kind === "articles") {
      router.navigate({ to: "/blog" });
      return;
    }
    if (item.kind === "article") {
      router.navigate({ to: "/blog/$slug", params: { slug: item.slug } });
      return;
    }
    if (item.kind === "project") {
      router.navigate({ to: "/projects/$slug", params: { slug: item.slug } });
      return;
    }
    if (pathname !== "/") {
      router.navigate({ to: "/", hash: item.hash.slice(1) });
      return;
    }
    // Wait for the dialog to unmount so focus return doesn't fight the scroll.
    requestAnimationFrame(() => {
      if (item.kind === "achievement") return navigateToAchievement(item.hash);
      scrollToSection(item.hash.slice(1));
      replaceHash(item.hash, router.navigate);
    });
  };

  return (
    <>
      <button
        type="button"
        aria-label="Search the site (Ctrl+K)"
        onClick={() => setOpen(true)}
        className="fixed right-6 bottom-6 z-40 hidden items-center gap-2 rounded-full border border-primary/40 bg-background/85 px-4 py-2 font-mono text-xs text-muted-foreground shadow-glow backdrop-blur-xl transition hover:text-primary md:flex"
      >
        <Search aria-hidden className="size-4 text-primary" />
        Search
        <kbd className="rounded border border-border px-1.5 text-[10px]">⌘K</kbd>
      </button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="block overflow-hidden border-primary/30 p-0 shadow-glow">
          <DialogTitle className="sr-only">Search the site</DialogTitle>
          <DialogDescription className="sr-only">
            Jump to a section, project, article or achievement.
          </DialogDescription>
          <CommandPrimitive
            className="w-full min-w-0 bg-popover text-popover-foreground"
            loop
            filter={paletteFilter}
          >
            <div className="flex items-center gap-2 border-b border-border px-4 pr-12">
              <Search aria-hidden className="size-4 text-primary" />
              <CommandPrimitive.Input
                autoFocus
                placeholder="Search sections, projects, articles…"
                className="h-12 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              />
            </div>
            <CommandPrimitive.List className="max-h-96 overflow-x-hidden overflow-y-auto p-2">
              <CommandPrimitive.Empty className="py-6 text-center text-sm text-muted-foreground">
                No matches.
              </CommandPrimitive.Empty>
              {GROUPS.map((g) => (
                <CommandPrimitive.Group
                  key={g.kind}
                  heading={g.heading}
                  className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-2 [&_[cmdk-group-heading]]:font-mono [&_[cmdk-group-heading]]:text-[10px] [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-[0.18em] [&_[cmdk-group-heading]]:text-muted-foreground"
                >
                  {items
                    .filter((i) => i.kind === g.kind)
                    .map((i) => (
                      <CommandPrimitive.Item
                        key={i.id}
                        value={`${i.label} ${i.hint} ${i.id}`}
                        keywords={i.keywords ?? []}
                        onSelect={() => select(i)}
                        className="flex cursor-pointer items-center gap-3 rounded-md px-2 py-2.5 text-sm data-[selected=true]:bg-primary/10 data-[selected=true]:text-primary [&_svg]:size-4 [&_svg]:shrink-0 [&_svg]:text-primary"
                      >
                        {g.icon}
                        <span className="min-w-0 flex-1 truncate">{i.label}</span>
                        <span className="max-w-[40%] shrink-0 truncate font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                          {i.hint}
                        </span>
                      </CommandPrimitive.Item>
                    ))}
                </CommandPrimitive.Group>
              ))}
            </CommandPrimitive.List>
          </CommandPrimitive>
        </DialogContent>
      </Dialog>
    </>
  );
}
