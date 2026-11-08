import { describe, expect, it } from "vitest";
import { nowPlaying } from "./now-playing";

describe("nowPlaying", () => {
  it("uses the supplied song title", () => {
    expect(nowPlaying.title).toBe("From URL to Pixels");
  });

  it("points at the CDN mp3 and avif objects", () => {
    expect(nowPlaying.audioUrl).toMatch(/^\/__l5e\/assets-v1\/.+\.mp3$/);
    expect(nowPlaying.artworkUrl).toMatch(/^\/__l5e\/assets-v1\/.+\.avif$/);
  });
});
