import { screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { blogPosts } from "@/content/blog";
import { renderWithRouter } from "@/test/render-with-router";
import { BlogLedger } from "./blog-ledger";

describe("BlogLedger", () => {
  it("renders a table row per post linking to the article", async () => {
    await renderWithRouter(<BlogLedger posts={blogPosts} tag="" />);
    const table = screen.getByRole("table", { name: /articles/i });
    const link = within(table).getByRole("link", { name: "Ship faster with MSW" });
    expect(link.getAttribute("href")).toBe("/blog/ship-faster-with-msw");
    expect(within(table).getByText("9 min")).toBeTruthy();
  });

  it("marks the active tag filter and shows an empty state", async () => {
    await renderWithRouter(<BlogLedger posts={blogPosts} tag="rust" />);
    expect(screen.getByText(/no articles tagged/i)).toBeTruthy();
    await renderWithRouter(<BlogLedger posts={blogPosts} tag="testing" />);
    const active = screen.getAllByRole("link", { name: "Testing" }).find((l) =>
      l.getAttribute("aria-current"),
    );
    expect(active).toBeTruthy();
  });
});
