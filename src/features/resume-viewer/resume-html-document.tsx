import { useCallback, useEffect, useRef } from "react";

export const DARK_STYLE_ID = "resume-dark-view";

// Fixed hex on purpose: this styles the isolated resume document, not the site.
const DARK_CSS = `
html, body { background: #0E1118 !important; }
body, body * { color: #E6E9F0 !important; border-color: #2A3140 !important; }
a, h2, h3, .header-gradient, [class*="accent"] { color: #62F4E0 !important; }
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
      className="mx-auto block size-full max-w-[230mm] bg-white"
    />
  );
}
