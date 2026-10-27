import { useCallback, useEffect, useRef } from "react";

export const DARK_STYLE_ID = "resume-dark-view";

const BASE_STYLE_ID = "resume-screen-view";
// Screen-only breathing room; the PDF uses its own @page margins.
const BASE_CSS = "@media screen { body { padding: 24px 20px 120px !important; } }";

// Fixed hex on purpose: this styles the isolated resume document, not the site.
const DARK_CSS = `
html, body { background: #0E1118 !important; }
body, body * { color: #E6E9F0 !important; border-color: #2A3140 !important; }
a, h2, h3 { color: #62F4E0 !important; }
.competency-tag { background: #1A2030 !important; color: #E6E9F0 !important; }
`;

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
      }}
      onError={onFail}
      className="mx-auto block size-full max-w-[230mm]"
    />
  );
}
