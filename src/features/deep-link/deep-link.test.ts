import { afterEach, describe, expect, it, vi } from "vitest";
import { content } from "@/content/data";
import { achievementHash, replaceHash, resolveDeepLink } from "./deep-link";

const adidas = content.experiences.find((experience) => experience.id === "adidas");
const graphqlBff = adidas?.achievements.find((achievement) => achievement.id === "graphql-bff");
if (!adidas || !graphqlBff) throw new Error("Content fixtures require adidas/graphql-bff");

describe("achievement deep links", () => {
  afterEach(() => {
    window.location.hash = "";
    vi.restoreAllMocks();
  });

  it("builds a hash from experience and achievement ids", () => {
    expect(achievementHash("adidas", "graphql-bff")).toBe("#exp-adidas-graphql-bff");
  });

  it("resolves a valid hash to its experience and achievement", () => {
    expect(resolveDeepLink(content.experiences, "#exp-adidas-graphql-bff")).toEqual({
      experienceId: "adidas",
      achievementId: "graphql-bff",
    });
  });

  it("rejects malformed, unrelated and unknown hashes", () => {
    expect(resolveDeepLink(content.experiences, "")).toBeNull();
    expect(resolveDeepLink(content.experiences, "#work")).toBeNull();
    expect(resolveDeepLink(content.experiences, "#exp-adidas")).toBeNull();
    expect(resolveDeepLink(content.experiences, "#exp-nowhere-nothing")).toBeNull();
    expect(resolveDeepLink(content.experiences, "#exp-adidas-not-an-achievement")).toBeNull();
  });

  it("replaceHash writes and clears the hash without adding history entries", () => {
    const pushState = vi.spyOn(window.history, "pushState");
    const replaceState = vi.spyOn(window.history, "replaceState");

    replaceHash(achievementHash("adidas", "graphql-bff"));
    expect(window.location.hash).toBe("#exp-adidas-graphql-bff");

    replaceHash(null);
    expect(window.location.hash).toBe("");
    expect(window.location.href).not.toContain("#");

    expect(pushState).not.toHaveBeenCalled();
    expect(replaceState).toHaveBeenCalled();
  });
});
