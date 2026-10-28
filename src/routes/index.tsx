import { createFileRoute } from "@tanstack/react-router";
import ogBanner from "@/assets/og-banner.jpg.asset.json";
import { content } from "@/content/data";
import { site } from "@/content/site";
import { projectFilterNavigation } from "@/features/filter-projects/filter-navigation";
import { validateProjectSearch } from "@/features/filter-projects/filter-projects";
import { pageUrl, personJsonLd } from "@/shared/lib/seo";
import { Contact } from "@/widgets/contact/contact";
import { ProjectGallery } from "@/widgets/gallery/project-gallery";
import { Hero } from "@/widgets/hero/hero";
import { EngineeringLab } from "@/widgets/lab/lab";
import { SiteNav } from "@/widgets/nav/site-nav";
import { Snapshot } from "@/widgets/snapshot/snapshot";
import { CareerTimeline } from "@/widgets/timeline/timeline";

/**
 * Share tags must be a stable absolute URL, so they are built from the
 * configured site URL — never from the request origin, and never from an
 * un-awaited server function (which would stringify to "[object Promise]").
 */
const ogImageUrl = `${site.url}${ogBanner.url}`;

export const Route = createFileRoute("/")({
  staticData: { sitemap: true },
  validateSearch: validateProjectSearch,
  head: () => ({
    meta: [
      { title: site.homeTitle },
      {
        name: "description",
        content: site.homeDescription,
      },
      { property: "og:title", content: site.homeTitle },
      {
        property: "og:description",
        content: site.homeDescription,
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: pageUrl("/") },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:image", content: ogImageUrl },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { name: "twitter:image", content: ogImageUrl },
    ],
    links: [{ rel: "canonical", href: pageUrl("/") }],
    scripts: [
      { type: "application/ld+json", children: JSON.stringify(personJsonLd(content.profile)) },
    ],
  }),
  component: Index,
});

function Index() {
  const filters = Route.useSearch();
  const navigate = Route.useNavigate();
  return (
    <>
      <SiteNav />
      <main id="top" className="min-h-screen bg-background">
        <Hero />
        <div className="px-6 py-24 md:px-16">
          <div className="mx-auto max-w-6xl space-y-32">
            <Snapshot />
            <ProjectGallery
              filters={filters}
              onFiltersChange={(search) =>
                navigate(projectFilterNavigation(search, window.location.hash))
              }
            />
            <CareerTimeline />
            <EngineeringLab />
            <Contact />
          </div>
        </div>
      </main>
    </>
  );
}
