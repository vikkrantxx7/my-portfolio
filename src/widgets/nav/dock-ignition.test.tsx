import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { DockIgnition } from "./dock-ignition";

describe("DockIgnition", () => {
  it("runs once and removes itself when the opening pulse finishes", () => {
    const { rerender } = render(<DockIgnition reducedMotion={false} />);
    const pulse = screen.getByTestId("dock-ignition");
    fireEvent.animationEnd(pulse);
    expect(screen.queryByTestId("dock-ignition")).not.toBeInTheDocument();
    rerender(<DockIgnition reducedMotion={false} />);
    expect(screen.queryByTestId("dock-ignition")).not.toBeInTheDocument();
  });

  it("starts a fresh pulse on each new opening", () => {
    const first = render(<DockIgnition reducedMotion={false} />);
    fireEvent.animationEnd(screen.getByTestId("dock-ignition"));
    first.unmount();
    render(<DockIgnition reducedMotion={false} />);
    expect(screen.getByTestId("dock-ignition")).toBeInTheDocument();
  });

  it("omits the pulse for reduced motion, including a live preference change", () => {
    const { rerender } = render(<DockIgnition reducedMotion={true} />);
    expect(screen.queryByTestId("dock-ignition")).not.toBeInTheDocument();
    rerender(<DockIgnition reducedMotion={false} />);
    expect(screen.getByTestId("dock-ignition")).toBeInTheDocument();
    rerender(<DockIgnition reducedMotion={true} />);
    expect(screen.queryByTestId("dock-ignition")).not.toBeInTheDocument();
  });
});