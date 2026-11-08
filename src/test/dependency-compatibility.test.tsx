import { render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import { Calendar } from "@/components/ui/calendar";
import { ChartContainer, ChartLegendContent, ChartTooltipContent } from "@/components/ui/chart";
import { Github, Linkedin } from "@/shared/ui/brand-icons";

vi.mock("recharts", async (importOriginal) => ({
  ...(await importOriginal<typeof import("recharts")>()),
  ResponsiveContainer: ({ children }: { children: ReactNode }) => children,
}));

describe("upgraded dependency compatibility", () => {
  it("retains the brand glyphs and Lucide styling props", () => {
    const { container } = render(
      <>
        <Github aria-label="GitHub" className="size-4" strokeWidth={1} />
        <Linkedin aria-label="LinkedIn" className="size-4" />
      </>,
    );
    expect(container.querySelector(".lucide-github")).toHaveAttribute("stroke-width", "1");
    expect(container.querySelector(".lucide-linkedin")).toHaveClass("size-4");
  });

  it("applies the DayPicker month grid styles using the current class name", () => {
    render(<Calendar defaultMonth={new Date(2026, 0, 1)} />);
    expect(screen.getByRole("grid")).toHaveClass("rdp-month_grid", "w-full", "border-collapse");
    expect(screen.getByRole("button", { name: /next month/i })).toBeInTheDocument();
  });

  it("renders Recharts content payloads and passes the full series to formatters", () => {
    const payload = [
      { graphicalItemId: "visitors", dataKey: "visitors", name: "Visitors", value: 42 },
      { graphicalItemId: "views", dataKey: "views", name: "Views", value: 84 },
    ];
    const formatter = vi.fn((value: unknown) => String(value));
    render(
      <ChartContainer config={{ visitors: { label: "Visitors" }, views: { label: "Views" } }}>
        <div>
          <ChartTooltipContent active payload={payload} formatter={formatter} />
          <ChartLegendContent payload={[{ dataKey: "visitors", value: "Visitors" }]} />
        </div>
      </ChartContainer>,
    );
    expect(screen.getByText("42")).toBeInTheDocument();
    expect(screen.getByText("84")).toBeInTheDocument();
    expect(screen.getAllByText("Visitors")).toHaveLength(2);
    expect(formatter).toHaveBeenNthCalledWith(1, 42, "Visitors", payload[0], 0, payload);
    expect(formatter).toHaveBeenNthCalledWith(2, 84, "Views", payload[1], 1, payload);
  });
});
