import { fireEvent, render, screen } from "@testing-library/react";
import { existsSync } from "node:fs";
import { describe, expect, it, vi } from "vitest";
import { ResumeHtmlDocument, DARK_STYLE_ID } from "./resume-html-document";

function stubDoc(frame: HTMLIFrameElement, body: string) {
  const doc = document.implementation.createHTMLDocument("r");
  doc.body.innerHTML = body;
  Object.defineProperty(frame, "contentDocument", { value: doc });
  return doc;
}

describe("ResumeHtmlDocument", () => {
  it("ships the HTML resume as a public file", () => {
    expect(existsSync("public/resume.html")).toBe(true);
  });

  it("renders the page in a script-free sandboxed frame", () => {
    render(<ResumeHtmlDocument src="/resume.html" title="Resume" dark={false} onFail={() => {}} />);
    const frame = screen.getByTitle("Resume");
    expect(frame.getAttribute("src")).toBe("/resume.html");
    expect(frame.getAttribute("sandbox")).toBe("allow-same-origin");
  });

  it("injects the dark stylesheet only in dark mode", () => {
    const { rerender } = render(
      <ResumeHtmlDocument src="/r" title="Resume" dark onFail={() => {}} />,
    );
    const frame = screen.getByTitle("Resume") as HTMLIFrameElement;
    const doc = stubDoc(frame, '<div class="page"></div>');
    fireEvent.load(frame);
    expect(doc.getElementById(DARK_STYLE_ID)).not.toBeNull();
    rerender(<ResumeHtmlDocument src="/r" title="Resume" dark={false} onFail={() => {}} />);
    expect(doc.getElementById(DARK_STYLE_ID)).toBeNull();
  });

  it("reports failure when the loaded page is not the resume", () => {
    const onFail = vi.fn();
    render(<ResumeHtmlDocument src="/r" title="Resume" dark={false} onFail={onFail} />);
    const frame = screen.getByTitle("Resume") as HTMLIFrameElement;
    stubDoc(frame, "<h1>Not found</h1>");
    fireEvent.load(frame);
    expect(onFail).toHaveBeenCalled();
  });
});
