import artwork from "@/assets/from-url-to-pixels.avif.asset.json";
import song from "@/assets/from-url-to-pixels.mp3.asset.json";

/** The single song in the floating audio player. Swap the CDN pointers to rebrand. */
export const nowPlaying = {
  title: "From URL to Pixels",
  audioUrl: song.url,
  artworkUrl: artwork.url,
} as const;
