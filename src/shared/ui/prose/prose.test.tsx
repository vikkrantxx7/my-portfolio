import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { renderWithRouter } from "@/test/render-with-router";
import Fixture, { frontmatter } from "./fixture.test.mdx";
import { Prose } from "./prose";

describe("MDX prose", () => {
  it("compiles frontmatter", () => {
    expect(frontmatter).toEqual({ title: "Fixture" });
  });

  it("gives headings a linkable id", async () => {
    await renderWithRouter(() => (
      <Prose>
        <Fixture />
      </Prose>
    ));
    expect(await screen.findByRole("heading", { name: "System design", level: 2 })).toHaveAttribute(
      "id",
      "system-design",
    );
  });

  it("opens external links safely and routes internal links in-app", async () => {
    const { router } = await renderWithRouter(() => (
      <Prose>
        <Fixture />
      </Prose>
    ));
    const external = await screen.findByRole("link", { name: "README" });
    expect(external).toHaveAttribute("target", "_blank");
    expect(external).toHaveAttribute("rel", "noreferrer");
    const internal = screen.getByRole("link", { name: "home" });
    expect(internal).not.toHaveAttribute("target");
    expect(internal).toHaveAttribute("href", router.buildLocation({ to: "/" }).href);
  });

  it("labels callouts as planned or decision", async () => {
    await renderWithRouter(() => (
      <Prose>
        <Fixture />
      </Prose>
    ));
    expect(await screen.findByText("Planned")).toBeInTheDocument();
  });
});
