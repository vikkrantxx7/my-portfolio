import { describe, expect, it } from "vitest";
import { projectFilterNavigation } from "./filter-navigation";

describe("Filter navigation scroll policy", () => {
  it("preserves achievement hashes but prevents both scroll reset and hash scrolling", () => {
    expect(projectFilterNavigation({ tech: "Fastify" }, "#exp-adidas-ai-adoption")).toEqual({
      search: { tech: "Fastify" },
      hash: "exp-adidas-ai-adoption",
      resetScroll: false,
      hashScrollIntoView: false,
    });
  });
  it("applies the same policy when clearing filters without a hash", () => {
    expect(projectFilterNavigation({}, "")).toEqual({
      search: {},
      hash: "",
      resetScroll: false,
      hashScrollIntoView: false,
    });
  });
});
