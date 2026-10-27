import { useCallback, useEffect, useRef } from "react";
import { bindResumeZoom } from "./resume-document-zoom";

export const DARK_STYLE_ID = "resume-dark-view";

const BASE_STYLE_ID = "resume-screen-view";
// Screen-only breathing room; the PDF uses its own @page margins.
const BASE_CSS = "@media screen { html { touch-action: pan-x pan-y; overscroll-behavior: contain; } body { padding: 24px 20px 120px !important; } }";

// Dark view reuses the PDF's colour-preserving filter on the frame itself, so it is
// dark from the first paint (no white flash) and keeps the resume's accent colours.
const DARK_CSS = "html { background: #fff; }";

/** Renders the HTML resume (same source as the PDF) in an isolated, script-free frame. */
export function ResumeHtmlDocument({
  src,
  title,
  dark,
  onFail,
}: {
  src: string;
  title: string;
  dark: boolean;
  onFail: () => void;
}) {
  const ref = useRef<HTMLIFrameElement>(null);
  const unbindZoom = useRef<(() => void) | undefined>(undefined);

  const bindZoom = useCallback(() => {
    const frame = ref.current;
    const doc = frame?.contentDocument;
    const host = frame?.closest<HTMLElement>('[role="dialog"]') ?? frame?.parentElement;
    if (!frame || !doc || !host) return;
    unbindZoom.current?.();
    unbindZoom.current = bindResumeZoom(doc, frame, host);
  }, []);
  useEffect(() => () => unbindZoom.current?.(), []);

  const applyDark = useCallback(() => {
    const doc = ref.current?.contentDocument;
    if (!doc?.head && !doc?.body) return;
    if (!doc.getElementById(BASE_STYLE_ID)) {
      const base = doc.createElement("style");
      base.id = BASE_STYLE_ID;
      base.textContent = BASE_CSS;
      (doc.head ?? doc.body).appendChild(base);
    }
    const existing = doc.getElementById(DARK_STYLE_ID);
    if (dark && !existing) {
      const style = doc.createElement("style");
      style.id = DARK_STYLE_ID;
      style.textContent = DARK_CSS;
      (doc.head ?? doc.body).appendChild(style);
    } else if (!dark && existing) existing.remove();
  }, [dark]);

  useEffect(applyDark, [applyDark]);
  // A cached page can finish loading before React attaches onLoad; check once on mount.
  // biome-ignore lint/correctness/useExhaustiveDependencies: mount-only check
  useEffect(() => {
    const doc = ref.current?.contentDocument;
    if (doc?.readyState === "complete" && doc.querySelector(".page")) {
      applyDark();
      bindZoom();
    }
  }, []);

  return (
    <iframe
      ref={ref}
      title={title}
      src={src}
      sandbox="allow-same-origin"
      onLoad={() => {
        const doc = ref.current?.contentDocument;
        if (!doc?.querySelector(".page")) return onFail();
        applyDark();
        bindZoom();
      }}
      onError={onFail}
      className={`mx-auto block size-full max-w-[230mm] bg-white ${dark ? "resume-frame--dark" : ""}`}
    />
  );
}
