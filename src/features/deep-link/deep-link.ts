import type { Experience } from "@/content/types";

export interface AchievementDeepLink {
  experienceId: string;
  achievementId: string;
}

export const achievementNavigationEvent = "portfolio:achievement-navigation";

/** Explicit same-page action; leave URL updates until the scroll has settled. */
export function navigateToAchievement(hash: string) {
  window.dispatchEvent(new CustomEvent(achievementNavigationEvent, { detail: hash }));
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

interface HashNavigationOptions {
  hash: string;
  search: true;
  replace: true;
  resetScroll: false;
  hashScrollIntoView: false;
}

/** Replaces (never pushes) the URL hash without triggering router scroll. */
export function replaceHash(
  hash: string | null,
  navigate?: (options: HashNavigationOptions) => unknown,
) {
  if (navigate) {
    void navigate({
      hash: (hash ?? "").replace(/^#/, ""),
      search: true,
      replace: true,
      resetScroll: false,
      hashScrollIntoView: false,
    });
    return;
  }
  if (typeof window === "undefined") return;
  const url = new URL(window.location.href);
  url.hash = hash ?? "";
  window.history.replaceState(window.history.state, "", url.href);
}

export function achievementShareUrl(hash: string) {
  if (typeof window === "undefined") return hash;
  return `${window.location.origin}${window.location.pathname}${hash}`;
}
