import { describe, expect, it } from "vitest";
import { Route } from "./index";

describe("home route loader", () => {
  it("resolves synchronously on client navigations so project → home is instant", () => {
    // jsdom provides `window`, so this exercises the client branch.
    // biome-ignore lint/suspicious/noExplicitAny: loader context is irrelevant here
    const result = (Route.options.loader as any)({});
    expect(result).not.toBeInstanceOf(Promise);
    expect(result).toEqual({});
  });
});
