import { describe, expect, it, vi } from "vitest";
import { saveResume } from "./save-resume";

const blob = new Blob(["%PDF"], { type: "application/pdf" });
const fetchOk = vi.fn(async () => new Response(blob));

describe("saveResume", () => {
  it("uses the native share sheet with the PDF file when sharing files is supported", async () => {
    const share = vi.fn(async () => {});
    const result = await saveResume("/resume.pdf", "cv.pdf", {
      fetch: fetchOk,
      navigator: { share, canShare: () => true, maxTouchPoints: 5 },
      download: vi.fn(),
    });
    expect(result).toBe("shared");
    const files = (share.mock.calls[0] as unknown as [{ files: File[] }])[0].files;
    expect(files[0]?.name).toBe("cv.pdf");
  });

  it("downloads a blob without navigating when sharing is unavailable", async () => {
    const download = vi.fn();
    const result = await saveResume("/resume.pdf", "cv.pdf", {
      fetch: fetchOk,
      navigator: { maxTouchPoints: 0 },
      download,
    });
    expect(result).toBe("downloaded");
    expect(download).toHaveBeenCalledWith(expect.any(Blob), "cv.pdf");
  });

  it("treats a dismissed share sheet as cancelled, not as a download", async () => {
    const download = vi.fn();
    const share = vi.fn(async () => {
      throw new DOMException("x", "AbortError");
    });
    const result = await saveResume("/resume.pdf", "cv.pdf", {
      fetch: fetchOk,
      navigator: { share, canShare: () => true, maxTouchPoints: 5 },
      download,
    });
    expect(result).toBe("cancelled");
    expect(download).not.toHaveBeenCalled();
  });
});
