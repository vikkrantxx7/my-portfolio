import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { CodeBlock } from "./code-block";

afterEach(() => vi.unstubAllGlobals());

describe("MDX code copying", () => {
  it("copies highlighted lines with original indentation and line breaks, not button text", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal("navigator", { clipboard: { writeText } });
    render(
      <CodeBlock>
        <code>
          <span data-line=""><span>function run() {"{"}</span></span>
          <span data-line=""><span>{"  return 42;"}</span></span>
          <span data-line=""><span>{"}"}</span></span>
        </code>
      </CodeBlock>,
    );
    fireEvent.click(screen.getByRole("button", { name: "Copy code" }));
    await waitFor(() => expect(writeText).toHaveBeenCalledWith("function run() {\n  return 42;\n}"));
    expect(await screen.findByRole("button", { name: "Copied" })).toBeEnabled();
  });

  it("copies unhighlighted code and preserves blank lines", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal("navigator", { clipboard: { writeText } });
    render(<CodeBlock><code>{"first\n\n  last\n"}</code></CodeBlock>);
    fireEvent.click(screen.getByRole("button", { name: "Copy code" }));
    await waitFor(() => expect(writeText).toHaveBeenCalledWith("first\n\n  last\n"));
  });

  it("reports clipboard rejection and allows retry", async () => {
    const writeText = vi.fn().mockRejectedValueOnce(new Error("Denied")).mockResolvedValue(undefined);
    vi.stubGlobal("navigator", { clipboard: { writeText } });
    render(<CodeBlock><code>retry me</code></CodeBlock>);
    fireEvent.click(screen.getByRole("button", { name: "Copy code" }));
    const retry = await screen.findByRole("button", { name: "Copy failed — retry" });
    fireEvent.click(retry);
    expect(await screen.findByRole("button", { name: "Copied" })).toBeEnabled();
    expect(writeText).toHaveBeenLastCalledWith("retry me");
  });
});