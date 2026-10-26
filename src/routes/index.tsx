import { createFileRoute } from "@tanstack/react-router";
import ogBanner from "@/assets/og-banner.jpg.asset.json";
import { content } from "@/content/data";
import { getRequestOrigin } from "@/shared/lib/origin.functions";
import { personJsonLd } from "@/shared/lib/seo";
import { projectFilterNavigation } from "@/features/filter-projects/filter-navigation";
import { validateProjectSearch } from "@/features/filter-projects/filter-projects";
import { Contact } from "@/widgets/contact/contact";
import { ProjectGallery } from "@/widgets/gallery/project-gallery";
import { Hero } from "@/widgets/hero/hero";
import { EngineeringLab } from "@/widgets/lab/lab";
import { SiteNav } from "@/widgets/nav/site-nav";
import { Snapshot } from "@/widgets/snapshot/snapshot";
import { CareerTimeline } from "@/widgets/timeline/timeline";

export const Route = createFileRoute("/")({
  validateSearch: validateProjectSearch,
  loader: async () => ({ origin: await getRequestOrigin() }),
  head: ({ loaderData }) => ({
    meta: [
      { title: "Vikrant Sharma — I build systems, not just screens" },
      {
        name: "description",
        content:
          "Senior software engineer portfolio: frontend architecture, case studies and AI-enabled products.",
      },
      { property: "og:title", content: "Vikrant Sharma — I build systems, not just screens" },
      {
        property: "og:description",
        content:
          "Senior software engineer portfolio: frontend architecture, case studies and AI-enabled products.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/" },
      { name: "twitter:card", content: "summary_large_image" },
      ...(loaderData?.origin
        ? [
            { property: "og:image", content: `${loaderData.origin}${ogBanner.url}` },
            { property: "og:image:width", content: "1200" },
            { property: "og:image:height", content: "630" },
            { name: "twitter:image", content: `${loaderData.origin}${ogBanner.url}` },
          ]
        : []),
    ],
    links: [{ rel: "canonical", href: "/" }],
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
