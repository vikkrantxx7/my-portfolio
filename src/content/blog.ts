import type { ComponentType } from "react";
import mswCover from "@/assets/ship-faster-with-msw-cover.webp.asset.json";
import mswOg from "@/assets/ship-faster-with-msw-og.jpg.asset.json";
import MswBody, { frontmatter as mswFrontmatter } from "./blog/ship-faster-with-msw.mdx";

export interface BlogFrontmatter {
  title: string;
  description: string;
  /** ISO date, YYYY-MM-DD. */
  publishedAt: string;
  readingMinutes: number;
  tags: string[];
  coverAlt?: string;
}

export interface BlogPost {
  slug: string;
  frontmatter: BlogFrontmatter;
  Body: ComponentType;
  /** Displayed cover and a 1200x630 share rendition. */
  cover: { url: string; ogUrl: string };
}

export function validateBlogFrontmatter(fm: BlogFrontmatter): string[] {
  const errors: string[] = [];
  if (!fm.title?.trim()) errors.push("title is required");
  if (!fm.description?.trim()) errors.push("description is required");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(fm.publishedAt ?? "")) errors.push("publishedAt must be YYYY-MM-DD");
  if (!(fm.readingMinutes > 0)) errors.push("readingMinutes must be positive");
  if (!fm.tags?.length) errors.push("at least one tag is required");
  return errors;
}

/** Register new posts here; the list is sorted newest first. */
export const blogPosts: BlogPost[] = [
  {
    slug: "ship-faster-with-msw",
    frontmatter: mswFrontmatter as unknown as BlogFrontmatter,
    Body: MswBody as ComponentType,
    cover: { url: mswCover.url, ogUrl: mswOg.url },
  },
].sort((a, b) => b.frontmatter.publishedAt.localeCompare(a.frontmatter.publishedAt));

export const findPost = (slug: string) => blogPosts.find((p) => p.slug === slug);

export function filterPostsByTag(posts: BlogPost[], tag: string) {
  if (!tag) return posts;
  const t = tag.toLowerCase();
  return posts.filter((p) => p.frontmatter.tags.some((x) => x.toLowerCase() === t));
}

export const blogTags = (posts: BlogPost[]) =>
  [...new Set(posts.flatMap((p) => p.frontmatter.tags))].sort((a, b) => a.localeCompare(b));
