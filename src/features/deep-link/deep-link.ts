import type { Experience } from "@/content/types";

export interface AchievementDeepLink {
  experienceId: string;
  achievementId: string;
}

export function achievementHash(experienceId: string, achievementId: string) {
  return `#exp-${experienceId}-${achievementId}`;
}

/**
 * Resolves a location hash of the form `#exp-<experienceId>-<achievementId>` against
 * the known experiences. Unknown or malformed hashes return null and are ignored.
 */
export function resolveDeepLink(
  experiences: Experience[],
  hash: string,
): AchievementDeepLink | null {
  const raw = hash.replace(/^#/, "");
  if (!raw.startsWith("exp-")) return null;
  const rest = raw.slice("exp-".length);
  for (const experience of experiences) {
    const prefix = `${experience.id}-`;
    if (!rest.startsWith(prefix)) continue;
    const achievementId = rest.slice(prefix.length);
    if (experience.achievements.some((achievement) => achievement.id === achievementId)) {
      return { experienceId: experience.id, achievementId };
    }
  }
  return null;
}

/** Replaces (never pushes) the URL hash; null clears it. */
export function replaceHash(hash: string | null) {
  if (typeof window === "undefined") return;
  const url = new URL(window.location.href);
  url.hash = hash ?? "";
  window.history.replaceState(null, "", url.href);
}

export function achievementShareUrl(hash: string) {
  if (typeof window === "undefined") return hash;
  return `${window.location.origin}${window.location.pathname}${hash}`;
}
