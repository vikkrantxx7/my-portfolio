import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { content } from "@/content/data";
import { ProjectDetail } from "./project-detail";

describe("Project case study", () => {
  it("exposes repository evidence and all technical details", () => {
    const project = content.projects[0];
    if (!project) throw new Error("Project fixture required");
    render(<ProjectDetail project={project} />);
    expect(screen.getByText(project.caseStudy.overview)).toBeInTheDocument();
    for (const item of project.caseStudy.architecture)
      expect(screen.getByText(item.detail)).toBeInTheDocument();
    for (const item of project.caseStudy.implementation)
      expect(screen.getByText(item)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "View repository" })).toHaveAttribute(
      "href",
      "https://github.com/vikkrantxx7/prepforge",
    );
    expect(screen.getByRole("link", { name: "API assembly" })).toHaveAttribute(
      "href",
      "https://github.com/vikkrantxx7/prepforge/blob/main/apps/api/src/app.ts",
    );
  });
});

describe("MDX case study body", () => {
  it("renders PrepForge from MDX with the same sections and an embedded diagram", () => {
    const project = content.projects.find((p) => p.slug === "prepforge");
    if (!project) throw new Error("PrepForge required");
    render(<ProjectDetail project={project} />);
    for (const name of [
      "Overview",
      "System design",
      "Decisions",
      "Implementation",
      "Results and learnings",
    ])
      expect(screen.getByRole("heading", { level: 2, name })).toHaveAttribute("id");
    expect(
      screen.getByRole("heading", { level: 2, name: "Links and source evidence" }),
    ).toBeInTheDocument();
  });

  it("keeps typed sections for projects without an MDX body", () => {
    const project = content.projects.find((p) => p.slug !== "prepforge");
    if (!project) throw new Error("Second project required");
    render(<ProjectDetail project={project} />);
    expect(screen.getByRole("heading", { level: 2, name: "Overview" })).not.toHaveAttribute("id");
  });
});
