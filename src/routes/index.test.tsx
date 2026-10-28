import { describe, expect, it } from "vitest";
import { site } from "@/content/site";
import { Route } from "./index";

type MetaEntry = Record<string, string>;

/** Read the home page's share tags the way SSR renders them, with no loader data. */
function homeMeta(loaderData?: unknown): MetaEntry[] {
  const head = Route.options.head as (ctx: {
    loaderData?: unknown;
    params: Record<string, string>;
  }) => { meta: MetaEntry[] };
  return head({ loaderData, params: {} }).meta;
}

describe("home route share metadata", () => {
  it("publishes an absolute og:image built from the configured site URL", () => {
    const meta = homeMeta();
    const ogImage = meta.find((m) => m.property === "og:image")?.content;
    const twitterImage = meta.find((m) => m.name === "twitter:image")?.content;
    expect(ogImage).toBeDefined();
    expect(ogImage).toMatch(/^https:\/\//);
    expect(ogImage).toContain(site.url);
    expect(twitterImage).toBe(ogImage);
  });

  it("never emits an unawaited promise into a share tag", () => {
    expect(JSON.stringify(homeMeta())).not.toContain("object Promise");
  });

  it("ignores loader data so the tags never depend on a server roundtrip", () => {
    expect(homeMeta({ origin: "https://evil.example" })).toEqual(homeMeta());
  });
});
