import { createFileRoute } from "@tanstack/react-router";
import { getRouterInstance } from "@tanstack/react-start";
import { content } from "@/content/data";
import {
  isSitemapRouteIncluded,
  type SitemapEntry,
  sitemapPathForLocation,
  sitemapStaticPaths,
  sitemapXML,
} from "@/lib/sitemap";
import { pageUrl } from "@/shared/lib/seo";

export const Route = createFileRoute("/sitemap.xml")({
  staticData: { sitemap: false },
  server: {
    handlers: {
      GET: async () => {
        const router = await getRouterInstance();
        const entries: SitemapEntry[] = sitemapStaticPaths(router).map((path) => ({ path }));
        const routeId = "/projects/$slug";
        if (isSitemapRouteIncluded(router.routesById[routeId])) {
          for (const project of content.projects) {
            const location = router.buildLocation({
              to: "/projects/$slug",
              params: { slug: project.slug },
              search: () => ({}),
              hash: "",
            });
            const path = sitemapPathForLocation(router, location, routeId);
            if (path) entries.push({ path });
          }
        }
        if (entries.length === 0) {
          return new Response("No public pages are included in the sitemap", {
            status: 404,
            headers: { "Cache-Control": "no-store" },
          });
        }
        return new Response(sitemapXML(pageUrl("/"), entries), {
          headers: { "Content-Type": "application/xml", "Cache-Control": "public, max-age=3600" },
        });
      },
    },
  },
});
