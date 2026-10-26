import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { content } from "@/content/data";
import { ProjectGallery } from "./project-gallery";

describe("Selected work gallery", () => {
  it("shows the resume-backed projects with problem, role, technology and a working destination", () => {
    render(<ProjectGallery filters={{}} onFiltersChange={vi.fn()} />);
    const cards = screen.getAllByRole("article");
    expect(cards).toHaveLength(2);
    for (const [index, project] of content.projects.entries()) {
      const card = cards[index];
      if (!card) throw new Error("Missing project card");
      expect(within(card).getByRole("heading", { name: project.title })).toBeInTheDocument();
      expect(within(card).getByText(project.problem)).toBeInTheDocument();
      expect(within(card).getByText(project.role)).toBeInTheDocument();
      for (const tech of project.tech) expect(within(card).getByText(tech)).toBeInTheDocument();
      expect(within(card).getByRole("link", { name: /Open case study/ })).toHaveAttribute(
        "href",
        `/projects/${project.slug}`,
      );
    }
  });
  it("technology and domain selectors preserve the other filter", async () => {
    const user = userEvent.setup();
    const change = vi.fn();
    render(<ProjectGallery filters={{ domain: "Open Source" }} onFiltersChange={change} />);
    await user.selectOptions(screen.getByRole("combobox", { name: "Technology" }), "Fastify");
    expect(change).toHaveBeenLastCalledWith({ tech: "Fastify", domain: "Open Source" });
    await user.selectOptions(screen.getByRole("combobox", { name: "Domain" }), "Developer Tools");
    expect(change).toHaveBeenLastCalledWith({ domain: "Developer Tools" });
  });
  it("filters displayed cards and offers reset when no projects match", async () => {
    const change = vi.fn();
    const { rerender } = render(
      <ProjectGallery filters={{ tech: "Fastify" }} onFiltersChange={change} />,
    );
    expect(screen.getAllByRole("article")).toHaveLength(1);
    expect(screen.getByRole("heading", { name: "PrepForge" })).toBeInTheDocument();
    rerender(<ProjectGallery filters={{ tech: "Rust" }} onFiltersChange={change} />);
    expect(screen.queryByRole("article")).not.toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent("No projects match");
    await userEvent.setup().click(screen.getByRole("button", { name: "Clear filters" }));
    expect(change).toHaveBeenCalledWith({});
  });
});
