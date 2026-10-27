type NavLike = {
  share?: (data: { files: File[]; title?: string }) => Promise<void>;
  canShare?: (data: { files: File[] }) => boolean;
  maxTouchPoints?: number;
};

export type SaveDeps = {
  fetch: (url: string) => Promise<Response>;
  navigator: NavLike;
  download: (blob: Blob, fileName: string) => void;
};

/** Triggers a browser download from a blob, never navigating the window. */
export function blobDownload(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
}

/**
 * Saves the resume without navigating: touch devices get the native share
 * sheet ("Save to Files"), everything else a blob download. Mobile browsers
 * ignore `download` on same-origin PDFs and would otherwise trap PWA users.
 */
export async function saveResume(
  url: string,
  fileName: string,
  deps: SaveDeps = {
    fetch: (u) => fetch(u),
    navigator: globalThis.navigator as unknown as NavLike,
    download: blobDownload,
  },
): Promise<"shared" | "downloaded" | "cancelled"> {
  const res = await deps.fetch(url);
  const blob = new Blob([await res.blob()], { type: "application/pdf" });
  const nav = deps.navigator;
  const touch = (nav.maxTouchPoints ?? 0) > 0;
  if (touch && nav.share && typeof File !== "undefined") {
    const file = new File([blob], fileName, { type: "application/pdf" });
    if (!nav.canShare || nav.canShare({ files: [file] })) {
      try {
        await nav.share({ files: [file], title: fileName });
        return "shared";
      } catch (e) {
        if (e instanceof DOMException && e.name === "AbortError") return "cancelled";
      }
    }
  }
  deps.download(blob, fileName);
  return "downloaded";
}
