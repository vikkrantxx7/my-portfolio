import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Button, buttonVariants } from "./button";
import { Tag } from "./tag";
import { SectionHeading } from "./section-heading";

describe("Button", () => {
  it("defaults to the primary variant", () => {
    expect(buttonVariants()).toContain("bg-primary");
  });

  it.each([
    ["ghost", "border-border"],
    ["glow", "shadow-glow"],
  ] as const)("%s variant applies its style", (variant, cls) => {
    expect(buttonVariants({ variant })).toContain(cls);
  });

  it("renders a real button", () => {
    render(<Button>Explore</Button>);
    expect(screen.getByRole("button", { name: "Explore" })).toBeInTheDocument();
  });
});

describe("Tag", () => {
  it("renders its label", () => {
    render(<Tag>React</Tag>);
    expect(screen.getByText("React")).toBeInTheDocument();
  });
});

describe("SectionHeading", () => {
  it("renders the index label and an h2 title", () => {
    render(<SectionHeading index="03" label="Selected work" title="Things I've built." />);
    expect(screen.getByText("03 / Selected work")).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 2, name: "Things I've built." })).toBeInTheDocument();
  });
});
