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
    expect(screen.getByRole("button", { name: /view resume/i })).toBeInTheDocument();
  });

  it("AC1b: Explore my work uses the animated gradient outline treatment", () => {
    render(<Hero />);
    expect(screen.getByRole("button", { name: /explore my work/i })).toHaveClass("gradient-frame");
  });

  it("AC1c: Explore my work shows a pointer cursor", () => {
    render(<Hero />);
    expect(screen.getByRole("button", { name: /explore my work/i })).toHaveClass("cursor-pointer");
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

  it("AC3: View resume opens the in-app viewer instead of navigating away", async () => {
    render(<Hero />);
    await userEvent.click(screen.getByRole("button", { name: /view resume/i }));
    expect(screen.getByRole("dialog", { name: /resume/i })).toBeInTheDocument();
  });
});
