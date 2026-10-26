import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { FilterSelect } from "./filter-select";

describe("FilterSelect", () => {
  it("shows the label and the current value, and lists every option when opened", async () => {
    render(
      <FilterSelect label="Technology" value="" options={["Fastify", "React"]} onChange={vi.fn()} />,
    );
    const trigger = screen.getByRole("combobox", { name: "Technology" });
    expect(trigger).toHaveTextContent("All technologies");
    expect(screen.queryByRole("option", { name: "Fastify" })).not.toBeInTheDocument();

    await userEvent.click(trigger);
    expect(screen.getByRole("option", { name: "Fastify" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "React" })).toBeInTheDocument();
  });

  it("reports the chosen option to the caller and closes the list", async () => {
    const change = vi.fn();
    render(
      <FilterSelect label="Domain" value="" options={["Open Source"]} onChange={change} />,
    );
    await userEvent.click(screen.getByRole("combobox", { name: "Domain" }));
    await userEvent.click(screen.getByRole("option", { name: "Open Source" }));
    expect(change).toHaveBeenCalledWith("Open Source");
    expect(screen.queryByRole("option", { name: "Open Source" })).not.toBeInTheDocument();
  });

  it("reports an empty value when the caller picks the all option", async () => {
    const change = vi.fn();
    render(
      <FilterSelect label="Technology" value="Fastify" options={["Fastify"]} onChange={change} />,
    );
    await userEvent.click(screen.getByRole("combobox", { name: "Technology" }));
    await userEvent.click(screen.getByRole("option", { name: "All technologies" }));
    expect(change).toHaveBeenCalledWith("");
  });

  it("closes the list with Escape and leaves the choice unchanged", async () => {
    const change = vi.fn();
    render(
      <FilterSelect label="Technology" value="" options={["Fastify"]} onChange={change} />,
    );
    await userEvent.click(screen.getByRole("combobox", { name: "Technology" }));
    expect(screen.getByRole("option", { name: "Fastify" })).toBeInTheDocument();
    await userEvent.keyboard("{Escape}");
    expect(screen.queryByRole("option", { name: "Fastify" })).not.toBeInTheDocument();
    expect(change).not.toHaveBeenCalled();
  });

  it("opens with the keyboard and moves through options with arrow keys", async () => {
    const change = vi.fn();
    render(
      <FilterSelect label="Technology" value="" options={["Fastify", "React"]} onChange={change} />,
    );
    await userEvent.tab();
    await userEvent.keyboard("{ArrowDown}");
    expect(screen.getByRole("option", { name: "Fastify" })).toBeInTheDocument();
    await userEvent.keyboard("{ArrowDown}{ArrowDown}{Enter}");
    expect(change).toHaveBeenCalledWith("React");
  });
});
