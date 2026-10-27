import { render } from "@testing-library/react";
import { useRef } from "react";
import { describe, expect, it, vi } from "vitest";
import { HeaderEnergy } from "./header-energy";

vi.mock("@/shared/lib/use-prefers-reduced-motion", async (orig) => ({
  ...(await orig<object>()),
  usePrefersReducedMotion: () => false,
}));

function rect(left: number, width: number) {
  return { left, top: 0, width, height: 32, right: left + width, bottom: 32, x: left, y: 0, toJSON() {} };
}

function Tabs({ active }: { active: string }) {
  const ref = useRef<HTMLDivElement>(null);
  return (
    <div ref={ref} role="tablist">
      <button type="button" data-energy-target="one" data-energy-shape="pill">
        One
      </button>
      <button type="button" data-energy-target="two" data-energy-shape="circle">
        Two
      </button>
      <HeaderEnergy active={active} navRef={ref} />
    </div>
  );
}

describe("HeaderEnergy outside the site nav", () => {
  it("draws a flight between generic data-energy-target elements", () => {
    const spy = vi
      .spyOn(HTMLElement.prototype, "getBoundingClientRect")
      .mockImplementation(function (this: HTMLElement) {
        const key = this.dataset["energyTarget"];
        return (key === "one" ? rect(0, 80) : key === "two" ? rect(200, 32) : rect(0, 400)) as DOMRect;
      });
    const { container, rerender } = render(<Tabs active="one" />);
    expect(container.querySelector("svg")).toBeNull();
    rerender(<Tabs active="two" />);
    expect(container.querySelector("svg.nav-energy-canvas")).not.toBeNull();
    spy.mockRestore();
  });
});
