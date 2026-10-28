import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { content } from "@/content/data";
import { blogPosts } from "@/content/blog";
import { achievementNavigationEvent } from "@/features/deep-link/deep-link";
import { renderWithRouter } from "@/test/render-with-router";
import { NAV_SECTIONS } from "@/widgets/nav/site-nav";
import { buildPaletteItems, CommandPalette } from "./command-palette";

beforeEach(() => {
  Element.prototype.scrollIntoView = vi.fn();
  for (const id of ["work", "experience", "about"]) {
    if (!document.getElementById(id)) {
      const s = document.createElement("section");
      s.id = id;
      document.body.appendChild(s);
    }
  }
});

describe("buildPaletteItems", () => {
  const items = buildPaletteItems(content);

  it("includes the article collection and every published article", () => {
    expect(items.find((item) => item.kind === "articles")).toMatchObject({ kind: "articles" });
    expect(items.filter((item) => item.kind === "article").map((item) => item.slug)).toEqual(
      blogPosts.map((post) => post.slug),
    );
  });

  it("AC2: covers every section, project and achievement", () => {
    expect(items.filter((i) => i.kind === "section")).toHaveLength(3);
    expect(items.filter((i) => i.kind === "project")).toHaveLength(content.projects.length);
    const total = content.experiences.reduce((n, e) => n + e.achievements.length, 0);
    expect(items.filter((i) => i.kind === "achievement")).toHaveLength(total);
  });

  it("AC3: every target is reachable through normal navigation", () => {
    const navIds = NAV_SECTIONS.map((s) => `#${s.id}`);
    for (const i of items) {
      if (i.kind === "section") expect(navIds).toContain(i.hash);
      if (i.kind === "project") expect(content.projects.map((p) => p.slug)).toContain(i.slug);
      if (i.kind === "achievement") expect(i.hash).toMatch(/^#exp-/);
    }
  });
});

describe("CommandPalette", () => {
  it("AC1: Ctrl+K opens and Esc closes", async () => {
    const user = userEvent.setup();
    await renderWithRouter(() => <CommandPalette />);
    await screen.findByRole("button", { name: /search/i });
    await user.keyboard("{Control>}k{/Control}");
    expect(await screen.findByRole("dialog")).toBeInTheDocument();
    await user.keyboard("{Escape}");
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
  });

  it("AC1: Meta+K opens it too", async () => {
    const user = userEvent.setup();
    await renderWithRouter(() => <CommandPalette />);
    await screen.findByRole("button", { name: /search/i });
    await user.keyboard("{Meta>}k{/Meta}");
    expect(await screen.findByRole("dialog")).toBeInTheDocument();
  });

  it("AC2: typing filters and Enter jumps to an achievement", async () => {
    const user = userEvent.setup();
    const heard = vi.fn();
    window.addEventListener(achievementNavigationEvent, (e) =>
      heard((e as CustomEvent<string>).detail),
    );
    await renderWithRouter(() => <CommandPalette />);
    await user.click(await screen.findByRole("button", { name: /search/i }));
    await user.type(screen.getByRole("combobox"), "rspack");
    await user.keyboard("{Enter}");
    await waitFor(() => expect(heard).toHaveBeenCalledWith("#exp-adidas-rspack-optimization"));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});
