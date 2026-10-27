# HTML resume inside the resume viewer

Your uploaded resume page (no scripts, ~29 KB) becomes what visitors read; the PDF stays the download.

## Stories (TDD, tests first)

**R1 — Resume page shipped with the site**
- Store the uploaded file unchanged as a public static file (`/resume.html`), so the PDF and the web view come from the same source.
- AC: file is served; a test fails if it is missing.

**R2 — Viewer shows the HTML version**
- New `ResumeHtmlDocument` component inside the existing `ResumeViewer` dialog, rendering the page in a sandboxed frame (its own styles can't leak into the site, and vice versa).
- Frame height follows content: natural scrolling on mobile, centred A4-width sheet on desktop. Zoom buttons hidden for HTML.
- AC: header, hero and mobile CV icon all show the HTML version.

**R3 — Paper / Dark**
- Paper: page as-is. Dark: a small dark stylesheet injected into the frame (dark background, light text, accent colours kept) — no colour-inverting filter.
- AC: remembered choice still applies everywhere.

**R4 — Fallback and download**
- If the HTML page fails to load, show the current PDF / image view.
- Save button still downloads `resume.pdf`.
- AC: fallback test; download link test.

## Technical details
- Frame: `sandbox="allow-same-origin"` (no scripts), height measured from `contentDocument` on load + ResizeObserver.
- Content config gains optional `resumeHtmlUrl` in `src/content/site.ts` to keep the template rebrandable; absent → existing behaviour.
- Update TEMPLATE.md and AGENTS.md rule for the resume viewer.
