import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  Outlet,
  RouterProvider,
} from "@tanstack/react-router";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ProjectGallery } from "./project-gallery";

function renderWithRouter() {
  const rootRoute = createRootRoute({ component: () => <Outlet /> });
  const home = createRoute({
    getParentRoute: () => rootRoute,
    path: "/",
    component: () => <ProjectGallery filters={{}} onFiltersChange={vi.fn()} />,
  });
  const project = createRoute({
    getParentRoute: () => rootRoute,
    path: "/projects/$slug",
    component: () => <h1>Case study page</h1>,
  });
  const router = createRouter({
    routeTree: rootRoute.addChildren([home, project]),
    history: createMemoryHistory({ initialEntries: ["/"] }),
  });
  render(<RouterProvider router={router} />);
  return router;
}

describe("Gallery case-study navigation", () => {
  it("opens a case study in-app instead of reloading the whole page", async () => {
    const router = renderWithRouter();
    const link = await screen.findByRole("link", { name: "Open case study: PrepForge" });
    expect(link).toHaveAttribute("href", "/projects/prepforge");
    await userEvent.setup().click(link);
    expect(await screen.findByRole("heading", { name: "Case study page" })).toBeInTheDocument();
    expect(router.state.location.pathname).toBe("/projects/prepforge");
  });
});
