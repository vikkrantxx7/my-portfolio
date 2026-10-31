import { describe, expect, it } from "vitest";
import { mdxOptions } from "../mdx.config.ts";

/**
 * Regression guard for the production blog crash: compiled MDX must use the
 * stable production JSX runtime, never the development `jsxDEV` runtime,
 * regardless of the build mode the publish pipeline runs in.
 */
describe("shared MDX compiler options", () => {
  it("pins the production JSX runtime (development disabled)", () => {
    expect(mdxOptions.development).toBe(false);
  });

  it("still provides the MDX provider source", () => {
    expect(mdxOptions.providerImportSource).toBe("@mdx-js/react");
  });
});
