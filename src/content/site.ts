import { content } from "./data";

const { name } = content.profile;

/** Site-wide identity and SEO copy. Edit this (plus data.ts) to rebrand the template. */
export const site = {
  /** Public origin used for canonical/og:url and the sitemap — no trailing slash. */
  url: "https://vikrantfullstack.in",
  author: name,
  /** Shared default title/description (root route). */
  defaultTitle: `${name} — Senior Software Engineer`,
  defaultDescription: `Portfolio of ${name}: frontend architecture, scalable systems and AI-assisted workflows.`,
  homeTitle: `${name} — ${content.profile.headline.replace(/\.$/, "")}`,
  homeDescription:
    "Lead fullstack engineer portfolio: frontend architecture, case studies and AI-assisted workflows.",
  /** Suffix for sub-page titles, e.g. "PrepForge — Vikrant Sharma". */
  titleSuffix: name,
  notFoundDescription: `This project is not in ${name}'s portfolio.`,
  themeColor: "#080A0F",
} as const;
