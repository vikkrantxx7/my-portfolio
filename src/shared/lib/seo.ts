import { site } from "@/content/site";
import type { Profile } from "@/content/types";

/** Stable public page identity, independent of the preview/request origin. */
export function pageUrl(path: `/${string}`) {
  return `${site.url}${path}`;
}

/** schema.org Person data for the home page. Phone is intentionally omitted. */
export function personJsonLd(profile: Profile) {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: profile.name,
    jobTitle: profile.title,
    description: profile.summary,
    email: `mailto:${profile.email}`,
    sameAs: [profile.links.linkedin, profile.links.github],
  };
}
