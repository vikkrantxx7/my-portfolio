import { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";
import { createScrollRestorationPolicy } from "./shared/lib/scroll-restoration";

export const getRouter = () => {
  const queryClient = new QueryClient();
  const shouldRestoreScroll = createScrollRestorationPolicy();

  const router = createRouter({
    routeTree,
    context: { queryClient },
    // The SSR inline script already restores the document; a late hydration
    // pass must not overwrite scrolling started while assets were downloading.
    scrollRestoration: () => shouldRestoreScroll(typeof window === "undefined"),
    // Page changes and back/forward restore jump instantly; in-page section links glide smoothly.
    scrollRestorationBehavior: "instant",
    defaultPreloadStaleTime: 0,
  });

  return router;
};
