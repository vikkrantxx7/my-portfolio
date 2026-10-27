import { describe, expect, it } from "vitest";
import { createScrollRestorationPolicy } from "./scroll-restoration";

describe("document scroll restoration", () => {
  it("skips delayed hydration restoration so early manual scrolling is preserved", () => {
    const restore = createScrollRestorationPolicy();
    expect(restore(false)).toBe(false);
    expect(restore(false)).toBe(true);
    expect(restore(false)).toBe(true);
  });

  it("keeps the initial server scroll script and subsequent back/forward restoration", () => {
    const restore = createScrollRestorationPolicy();
    expect(restore(true)).toBe(true);
    expect(restore(true)).toBe(true);
    expect(restore(false)).toBe(false);
    expect(restore(false)).toBe(true);
  });
});
