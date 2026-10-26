import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { Hero } from "./hero";

beforeEach(() => {
  document.body.innerHTML = '<section id="work"></section>';
  Element.prototype.scrollIntoView = vi.fn();
});

describe("Hero", () => {
  it("AC1: shows headline, role line and both actions", () => {
    render(<Hero />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      /I build systems,\s*not just screens/i,
    );
    expect(screen.getByText(/Lead Fullstack Engineer/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /explore my work/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /download resume/i })).toBeInTheDocument();
  });

  it("AC1b: Explore my work uses the animated gradient outline treatment", () => {
    render(<Hero />);
    expect(screen.getByRole("button", { name: /explore my work/i })).toHaveClass("gradient-frame");
  });

  it("AC2: background is decorative and hidden from assistive tech", () => {
    const { container } = render(<Hero />);
    expect(container.querySelector("[data-hero-bg]")).toHaveAttribute("aria-hidden", "true");
  });

  it("AC3: Explore my work scrolls to Selected Work", async () => {
    render(<Hero />);
    await userEvent.click(screen.getByRole("button", { name: /explore my work/i }));
    expect(Element.prototype.scrollIntoView).toHaveBeenCalled();
  });

  it("AC3: Download resume downloads the PDF", () => {
    render(<Hero />);
    const link = screen.getByRole("link", { name: /download resume/i });
    expect(link).toHaveAttribute("href", "/resume.pdf");
    expect(link).toHaveAttribute("download", "Vikrant_Sharma_Lead_Fullstack_Engineer.pdf");
  });
});
