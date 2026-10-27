import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  Outlet,
  RouterProvider,
} from "@tanstack/react-router";
import { render, screen } from "@testing-library/react";
import type { ReactNode } from "react";

/** Renders UI at "/" inside a minimal router so TanStack `Link`s work in tests. */
export async function renderWithRouter(ui: () => ReactNode) {
  const rootRoute = createRootRoute({
    staticData: { sitemap: false },
    component: () => <Outlet />,
  });
  const home = createRoute({
    staticData: { sitemap: true },
    getParentRoute: () => rootRoute,
    path: "/",
    component: ui,
  });
  const project = createRoute({
    staticData: { sitemap: true },
    getParentRoute: () => rootRoute,
    path: "/projects/$slug",
    component: () => <h1>Case study page</h1>,
  });
  const blog = createRoute({
    staticData: { sitemap: true },
    getParentRoute: () => rootRoute,
    path: "/blog/",
    component: () => <h1>Blog index</h1>,
  });
  const blogPost = createRoute({
    staticData: { sitemap: true },
    getParentRoute: () => rootRoute,
    path: "/blog/$slug",
    component: () => <h1>Blog article</h1>,
  });
  const router = createRouter({
    routeTree: rootRoute.addChildren([home, project]),
    history: createMemoryHistory({ initialEntries: ["/"] }),
  });
  const result = render(<RouterProvider router={router} />);
  await screen.findAllByRole("article").catch(() => undefined);
  return { router, ...result };
}
