import { screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { blogPosts } from "@/content/blog";
import { renderWithRouter } from "@/test/render-with-router";
import { BlogLedger } from "./blog-ledger";

describe("BlogLedger", () => {
  it("renders a table row per post linking to the article", async () => {
    await renderWithRouter(() => <BlogLedger posts={blogPosts} tag="" />);
    const table = await screen.findByRole("table", { name: /articles/i });
    const link = within(table).getByRole("link", { name: "Ship faster with MSW" });
    expect(link.getAttribute("href")).toBe("/blog/ship-faster-with-msw");
    expect(within(table).getByText("9 min")).toBeTruthy();
  });

  it("shows an empty state for a tag with no posts", async () => {
    await renderWithRouter(() => <BlogLedger posts={blogPosts} tag="rust" />);
    expect(await screen.findByText(/no articles tagged/i)).toBeTruthy();
  });

  it("marks the active tag filter", async () => {
    await renderWithRouter(() => <BlogLedger posts={blogPosts} tag="testing" />);
    const filters = await screen.findByRole("navigation", { name: /filter by tag/i });
    expect(
      within(filters).getByRole("link", { name: "Testing" }).getAttribute("aria-current"),
    ).toBe("true");
    expect(
      within(filters).getByRole("link", { name: "All" }).getAttribute("aria-current"),
    ).toBeNull();
  });
});
