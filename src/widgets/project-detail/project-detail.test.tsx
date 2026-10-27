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

  it("renders the complete git-contributor-stats content and citations from MDX", () => {
    const project = content.projects.find((p) => p.slug === "git-contributor-stats");
    if (!project) throw new Error("Git contributor stats required");
    render(<ProjectDetail project={project} />);
    expect(screen.getByText(project.caseStudy.overview)).toBeInTheDocument();
    for (const item of project.caseStudy.architecture)
      expect(screen.getByText(item.detail)).toBeInTheDocument();
    for (const item of project.caseStudy.decisions)
      expect(screen.getByText(item.detail)).toBeInTheDocument();
    for (const item of [...project.caseStudy.implementation, ...project.caseStudy.results])
      expect(screen.getByText(item)).toBeInTheDocument();
    for (const source of project.caseStudy.sources)
      expect(screen.getByRole("link", { name: source.label })).toHaveAttribute(
        "href",
        `${project.caseStudy.repository}/blob/main/${source.path}`,
      );
  });

  it("keeps typed content for projects without a registered MDX body", () => {
    const project = content.projects[0];
    if (!project) throw new Error("Project fixture required");
    const overview = "Typed fallback overview fixture";
    render(
      <ProjectDetail
        project={{
          ...project,
          slug: "unregistered-case-study",
          caseStudy: { ...project.caseStudy, overview },
        }}
      />,
    );
    expect(screen.getByText(overview)).toBeInTheDocument();
  });
});
