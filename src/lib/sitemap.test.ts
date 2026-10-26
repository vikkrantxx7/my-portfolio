import { createRootRoute, createRoute, createRouter, createMemoryHistory } from "@tanstack/react-router";
import { describe, expect, it } from "vitest";
import { sitemapStaticPaths, sitemapPathForLocation, sitemapXML } from "./sitemap";

function fixture() {
  const root = createRootRoute({ staticData: { sitemap: false } });
  const home = createRoute({ getParentRoute: () => root, path: "/", staticData: { sitemap: true } });
  const project = createRoute({ getParentRoute: () => root, path: "/projects/$slug", staticData: { sitemap: true } });
  const excluded = createRoute({ getParentRoute: () => root, path: "/internal", staticData: { sitemap: "exclude-subtree" } });
  const child = createRoute({ getParentRoute: () => excluded, path: "child", staticData: { sitemap: true } });
  return createRouter({ routeTree: root.addChildren([home, project, excluded.addChildren([child])]), history: createMemoryHistory() });
}

describe("sitemap", () => {
  it("derives the homepage and excludes private subtrees and dynamic placeholders", () => {
    expect(sitemapStaticPaths(fixture())).toEqual(["/"]);
  });
  it("accepts an actual case-study destination and rejects an unknown page", () => {
    const router = fixture();
    const location = router.buildLocation({ to: "/projects/$slug", params: { slug: "prepforge" } });
    expect(sitemapPathForLocation(router, location, "/projects/$slug")).toBe("/projects/prepforge");
    expect(sitemapPathForLocation(router, { pathname: "/missing", publicHref: "/missing" }, "/projects/$slug")).toBeUndefined();
  });
  it("uses the primary domain, deduplicates entries and omits invented lastmod dates", () => {
    const xml = sitemapXML("https://vikrantfullstack.in", [{ path: "/" }, { path: "/projects/prepforge" }, { path: "/" }]);
    expect(xml).toContain("<loc>https://vikrantfullstack.in/</loc>");
    expect(xml).toContain("<loc>https://vikrantfullstack.in/projects/prepforge</loc>");
    expect(xml.match(/<url>/g)).toHaveLength(2);
    expect(xml).not.toContain("lastmod");
  });
});