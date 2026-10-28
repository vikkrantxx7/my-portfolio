import gitStats from "@/assets/neon-git-analytics-dashboard.png.asset.json";
import gitStatsLight from "@/assets/neon-git-analytics-dashboard-light.png.asset.json";
import prepforge from "@/assets/prepforge-neon-interview-journey.png.asset.json";
import prepforgeLight from "@/assets/prepforge-neon-interview-journey-light.png.asset.json";

/** Concept artwork per site theme, not product screenshots. */
export type ProjectArtwork = { dark: string; light: string };

export const projectArtwork: Record<string, ProjectArtwork> = {
  prepforge: { dark: prepforge.url, light: prepforgeLight.url },
  "git-contributor-stats": { dark: gitStats.url, light: gitStatsLight.url },
};
