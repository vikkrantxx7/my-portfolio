import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import type { BlogPost } from "@/content/blog";
import { renderWithRouter } from "@/test/render-with-router";
import { BlogArticleDock, BlogIndexDock } from "./blog-dock";

const post = (slug: string) => ({ slug, frontmatter: { title: `Post ${slug}` } }) as BlogPost;
const list = [post("new"), post("mid"), post("old")];

describe("BlogArticleDock", () => {
  it("stays open at the bottom with Newer, Blog, Top and Older", async () => {
    await renderWithRouter(() => <BlogArticleDock posts={list} slug="mid" />);
    const dock = await screen.findByRole("navigation", { name: /article controls/i });
    expect(dock).toHaveClass("fixed", "md:hidden");
    expect(screen.getByRole("link", { name: /newer article: post new/i })).toHaveAttribute(
      "href",
      "/blog/new",
    );
    expect(screen.getByRole("link", { name: /older article: post old/i })).toHaveAttribute(
      "href",
      "/blog/old",
    );
    expect(screen.getByRole("link", { name: /all articles/i })).toHaveAttribute("href", "/blog");
  });

  it("disables Newer on the first post and Older on the last", async () => {
    await renderWithRouter(() => <BlogArticleDock posts={list} slug="new" />);
    await screen.findByRole("navigation", { name: /article controls/i });
    expect(screen.queryByRole("link", { name: /newer article/i })).toBeNull();
    expect(screen.getByText("Older").closest("[aria-disabled]")).toHaveAttribute(
      "aria-disabled",
      "true",
    );
  });

  it("Top scrolls smoothly to the top", async () => {
    const spy = vi.spyOn(window, "scrollTo");
    await renderWithRouter(() => <BlogArticleDock posts={list} slug="mid" />);
    await userEvent.click(await screen.findByRole("button", { name: /back to top/i }));
    expect(spy).toHaveBeenCalledWith({ top: 0, behavior: "smooth" });
  });

  it("lets taps through to page content behind the bar", async () => {
    await renderWithRouter(() => <BlogArticleDock posts={list} slug="mid" />);
    const dock = await screen.findByRole("navigation", { name: /article controls/i });
    expect(dock).toHaveClass("pointer-events-none");
    expect(dock.firstElementChild).toHaveClass("pointer-events-auto");
  });

  it("removes the tap delay on its controls", async () => {
    await renderWithRouter(() => <BlogArticleDock posts={list} slug="mid" />);
    await screen.findByRole("navigation", { name: /article controls/i });
    expect(screen.getByRole("link", { name: /all articles/i })).toHaveClass("touch-manipulation");
    expect(screen.getByRole("button", { name: /back to top/i })).toHaveClass("touch-manipulation");
  });
});

describe("BlogIndexDock", () => {
  it("stays open at the bottom with Home and Top", async () => {
    await renderWithRouter(() => <BlogIndexDock />);
    const dock = await screen.findByRole("navigation", { name: /blog controls/i });
    expect(dock).toHaveClass("fixed", "md:hidden");
    expect(screen.getByRole("link", { name: /back to home/i })).toHaveAttribute("href", "/");
  });

  it("Top scrolls smoothly to the top", async () => {
    const spy = vi.spyOn(window, "scrollTo");
    await renderWithRouter(() => <BlogIndexDock />);
    await userEvent.click(await screen.findByRole("button", { name: /back to top/i }));
    expect(spy).toHaveBeenCalledWith({ top: 0, behavior: "smooth" });
  });

  it("lets taps through to page content behind the bar", async () => {
    await renderWithRouter(() => <BlogIndexDock />);
    const dock = await screen.findByRole("navigation", { name: /blog controls/i });
    expect(dock).toHaveClass("pointer-events-none");
    expect(dock.firstElementChild).toHaveClass("pointer-events-auto");
  });
});
