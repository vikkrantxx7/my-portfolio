import type { Profile } from "@/content/types";

/** schema.org Person data for the home page. Phone is intentionally omitted. */
export function personJsonLd(profile: Profile) {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: profile.name,
    jobTitle: "Lead Fullstack Engineer",
    description: profile.summary,
    email: `mailto:${profile.email}`,
    sameAs: [profile.links.linkedin, profile.links.github],
  };
}
