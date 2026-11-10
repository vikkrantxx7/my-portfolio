import artwork from "@/assets/from-url-to-pixels.avif.asset.json";
import song from "@/assets/from-url-to-pixels.mp3.asset.json";
import video from "@/assets/from-url-to-pixels.mp4.asset.json";
import poster from "@/assets/from-url-to-pixels-poster.avif.asset.json";

interface NowPlaying {
  title: string;
  audioUrl: string;
  artworkUrl: string;
  /** Optional music video, opened by right-click / long-press on the artwork. */
  videoUrl?: string;
  posterUrl?: string;
}

/** The single song in the floating audio player. Swap the CDN pointers to rebrand. */
export const nowPlaying: NowPlaying = {
  title: "From URL to Pixels",
  audioUrl: song.url,
  artworkUrl: artwork.url,
  videoUrl: video.url,
  posterUrl: poster.url,
};
