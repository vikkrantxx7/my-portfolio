import { fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import type { Diagram } from "@/content/types";
import { validateDiagram } from "@/content/validate";
import { content } from "@/content/data";
import { ArchitectureDiagram, connectedIds } from "./architecture-diagram";

const diagram: Diagram = {
  layers: [
    { title: "Client", nodes: [{ id: "web", label: "Web app" }] },
    { title: "Service", nodes: [{ id: "api", label: "API" }, { id: "jobs", label: "Jobs" }] },
    { title: "Data", nodes: [{ id: "db", label: "Database" }] },
  ],
  edges: [
    { from: "web", to: "api", label: "calls" },
    { from: "api", to: "db", label: "reads and writes" },
  ],
};

describe("diagram data", () => {
  it("every project diagram only connects boxes that exist", () => {
    for (const p of content.projects) expect(validateDiagram(p.caseStudy.diagram)).toEqual([]);
  });
  it("flags connections to unknown boxes", () => {
    expect(
      validateDiagram({ ...diagram, edges: [{ from: "web", to: "ghost", label: "x" }] }),
    ).toEqual(["Unknown diagram box: ghost"]);
  });
  it("finds a box and its direct neighbours", () => {
    expect([...connectedIds(diagram, "api")].sort()).toEqual(["api", "db", "web"]);
  });
});

describe("ArchitectureDiagram", () => {
  it("lists every layer, box and connection as readable text", () => {
    render(<ArchitectureDiagram diagram={diagram} />);
    for (const t of ["Client", "Service", "Data"]) expect(screen.getByText(t)).toBeInTheDocument();
    const list = screen.getByRole("list", { name: "Connections" });
    expect(within(list).getByText(/Web app/)).toHaveTextContent("Web app calls API");
  });

  it("highlights a hovered box and its connections only", () => {
    render(<ArchitectureDiagram diagram={diagram} />);
    fireEvent.mouseEnter(screen.getByRole("button", { name: "Web app" }));
    expect(screen.getByRole("button", { name: "Web app" })).toHaveAttribute("data-state", "active");
    expect(screen.getByRole("button", { name: "API" })).toHaveAttribute("data-state", "related");
    expect(screen.getByRole("button", { name: "Database" })).toHaveAttribute("data-state", "dimmed");
    expect(screen.getByText(/Web app calls API/)).toHaveAttribute("data-state", "related");
    expect(screen.getByText(/API reads and writes Database/)).toHaveAttribute("data-state", "dimmed");
  });

  it("works with the keyboard and clears when focus leaves", async () => {
    const user = userEvent.setup();
    render(<ArchitectureDiagram diagram={diagram} />);
    await user.tab();
    expect(screen.getByRole("button", { name: "Web app" })).toHaveFocus();
    expect(screen.getByRole("button", { name: "Web app" })).toHaveAttribute("data-state", "active");
    await user.tab();
    expect(screen.getByRole("button", { name: "API" })).toHaveAttribute("data-state", "active");
    expect(screen.getByRole("button", { name: "Jobs" })).toHaveAttribute("data-state", "dimmed");
    await user.keyboard("{Escape}");
    expect(screen.getByRole("button", { name: "Jobs" })).toHaveAttribute("data-state", "idle");
  });
});
