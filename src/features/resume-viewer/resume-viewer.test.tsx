import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

// These tests cover the PDF/image fallback; the HTML view has its own tests.
const siteMock = vi.hoisted(() => ({ resumeHtmlUrl: undefined as string | undefined }));
vi.mock("@/content/site", async (orig) => {
  const real = (await orig()) as { site: object };
  return {
    site: new Proxy(real.site, {
      get: (t, k) => (k === "resumeHtmlUrl" ? siteMock.resumeHtmlUrl : Reflect.get(t, k)),
    }),
  };
});

import { ResumeViewer } from "./resume-viewer";

function renderViewer(triggerClassName?: string) {
  return render(<ResumeViewer triggerClassName={triggerClassName}>View resume</ResumeViewer>);
}

describe("ResumeViewer", () => {
  it("renders the trigger as a button, not a navigation link", () => {
    renderViewer();
    const trigger = screen.getByRole("button", { name: /view resume/i });
    expect(trigger.tagName).toBe("BUTTON");
  });

  it("opens an in-app dialog showing the PDF in a frame", async () => {
    renderViewer();
    await userEvent.click(screen.getByRole("button", { name: /view resume/i }));
    const dialog = screen.getByRole("dialog", { name: /resume/i });
    const frame = within(dialog).getByTitle(/vikrant sharma — resume/i);
    expect(frame).toHaveAttribute("src", "/resume.pdf");
  });

  it("frames the PDF with theme-matched vignette corners", async () => {
    renderViewer();
    await userEvent.click(screen.getByRole("button", { name: /view resume/i }));
    const dialog = screen.getByRole("dialog", { name: /resume/i });
    expect(dialog.querySelector("[data-resume-vignette]")).not.toBeNull();
  });

  it("switches the PDF between paper and dark viewing, independent of the site theme", async () => {
    renderViewer();
    await userEvent.click(screen.getByRole("button", { name: /view resume/i }));
    const dialog = screen.getByRole("dialog", { name: /resume/i });
    const frame = within(dialog).getByTitle(/vikrant sharma — resume/i);
    expect(frame).not.toHaveClass("resume-frame--dark");
    await userEvent.click(within(dialog).getByRole("button", { name: /dark view/i }));
    expect(frame).toHaveClass("resume-frame--dark");
    await userEvent.click(within(dialog).getByRole("button", { name: /paper view/i }));
    expect(frame).not.toHaveClass("resume-frame--dark");
  });

  it("offers a real download of the PDF", async () => {
    renderViewer();
    await userEvent.click(screen.getByRole("button", { name: /view resume/i }));
    const dialog = screen.getByRole("dialog", { name: /resume/i });
    const download = within(dialog).getByRole("link", { name: /download pdf/i });
    expect(download).toHaveAttribute("href", "/resume.pdf");
    expect(download).toHaveAttribute("download", "Vikrant_Sharma_Lead_Fullstack_Engineer.pdf");
  });

  it("keeps a dark-styled back control that closes the viewer", async () => {
    renderViewer();
    await userEvent.click(screen.getByRole("button", { name: /view resume/i }));
    const dialog = screen.getByRole("dialog", { name: /resume/i });
    const back = within(dialog).getByRole("button", { name: /back to portfolio/i });
    // Floating controls stay dark even when the PDF is shown in paper (light) mode.
    expect(back.closest("[data-resume-dock]")).not.toBeNull();
    await userEvent.click(back);
    expect(screen.queryByRole("dialog", { name: /resume/i })).toBeNull();
  });

  it("shows both resume pages as a zoomable mobile reader", async () => {
    renderViewer();
    await userEvent.click(screen.getByRole("button", { name: /view resume/i }));
    const dialog = screen.getByRole("dialog", { name: /resume/i });
    const reader = dialog.querySelector("[data-resume-reader]");
    expect(reader).not.toBeNull();
    const pages = within(reader as HTMLElement).getAllByRole("img");
    expect(pages.map((p) => p.getAttribute("src"))).toEqual([
      "/resume/page-1.webp",
      "/resume/page-2.webp",
    ]);
    expect(within(dialog).getByRole("button", { name: /zoom in/i })).toBeInTheDocument();
    expect(within(dialog).getByRole("button", { name: /zoom out/i })).toBeInTheDocument();
  });

  it("applies the caller's trigger styling", () => {
    renderViewer("custom-trigger");
    expect(screen.getByRole("button", { name: /view resume/i })).toHaveClass("custom-trigger");
  });

  it("shows the HTML resume and hides zoom when an HTML version is configured", async () => {
    siteMock.resumeHtmlUrl = "/resume.html";
    renderViewer();
    await userEvent.click(screen.getByRole("button", { name: /view resume/i }));
    const dialog = screen.getByRole("dialog", { name: /resume/i });
    expect(dialog.querySelector('iframe[src="/resume.html"]')).not.toBeNull();
    expect(dialog.querySelector("[data-resume-reader]")).toBeNull();
    expect(within(dialog).getByRole("link", { name: /download pdf/i })).toHaveAttribute(
      "href",
      "/resume.pdf",
    );

    // Seamless reading area: in dark view the area around the document must match the
    // inverted paper tone instead of staying white (which showed as bright margins).
    const readingArea = dialog.querySelector("[data-resume-vignette]") as HTMLElement;
    expect(readingArea).toHaveClass("bg-white");
    await userEvent.click(within(dialog).getByRole("button", { name: /dark view/i }));
    expect(readingArea).not.toHaveClass("bg-white");
    expect(readingArea).toHaveClass("bg-[#0d0d0d]");

    siteMock.resumeHtmlUrl = undefined;
  });
});
