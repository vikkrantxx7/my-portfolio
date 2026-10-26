import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { FilterSelect } from "./filter-select";

describe("FilterSelect", () => {
  it("shows the label, the current value and every option", () => {
    render(
      <FilterSelect label="Technology" value="" options={["Fastify", "React"]} onChange={vi.fn()} />,
    );
    const select = screen.getByRole("combobox", { name: "Technology" });
    expect(select).toHaveValue("");
    expect(screen.getByRole("option", { name: "All technologies" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Fastify" })).toBeInTheDocument();
  });

  it("reports the chosen option to the caller", async () => {
    const change = vi.fn();
    render(
      <FilterSelect label="Domain" value="" options={["Open Source"]} onChange={change} />,
    );
    await userEvent.selectOptions(screen.getByRole("combobox", { name: "Domain" }), "Open Source");
    expect(change).toHaveBeenCalledWith("Open Source");
  });

  it("keeps its own chevron clear of the edge and out of the click path", () => {
    render(
      <FilterSelect label="Technology" value="" options={["Fastify"]} onChange={vi.fn()} />,
    );
    const select = screen.getByRole("combobox", { name: "Technology" });
    // The browser's own arrow sits flush against the border, so the control draws its own.
    expect(select).toHaveClass("appearance-none");
    const chevron = select.parentElement?.querySelector("svg");
    expect(chevron).not.toBeNull();
    expect(chevron).toHaveClass("right-3", "pointer-events-none");
  });
});
