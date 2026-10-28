import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { renderWithRouter } from "@/test/render-with-router";
import { BlogHeader } from "./blog-header";

describe("BlogHeader", () => {
  it("offers a direct Home destination alongside the article collection", async () => {
    await renderWithRouter(() => <BlogHeader back="blog" />);
    expect(await screen.findByRole("link", { name: "Home" })).toHaveAttribute("href", "/");
    expect(screen.getByRole("link", { name: /all articles/i })).toHaveAttribute("href", "/blog");
  });

  it("keeps the glass bar with back link and toggle for desktop", async () => {
    await renderWithRouter(() => <BlogHeader back="blog" />);
    expect(await screen.findByRole("link", { name: /all articles/i })).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: /switch to/i }).length).toBeGreaterThan(0);
  });

  it("drops the bar on phones and keeps only a floating theme toggle", async () => {
    const { container } = await renderWithRouter(() => <BlogHeader back="home" />);
    expect(screen.getByRole("banner")).toHaveClass("hidden", "md:block");
    const floating = container.querySelector("[data-testid='blog-theme-float']");
    expect(floating).not.toBeNull();
    expect(floating).toHaveClass("fixed", "md:hidden");
    // Still two toggle instances: desktop bar + floating mobile one.
    expect(screen.getAllByRole("button", { name: /switch to/i })).toHaveLength(2);
  });
});
