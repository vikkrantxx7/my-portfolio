import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { Route } from "./__root";

type HeadLink = {
  rel: string;
  href: string;
  as?: string;
  type?: string;
  crossOrigin?: string;
};

describe("critical font delivery", () => {
  const fonts = ["geist-latin.woff2", "geist-mono-latin.woff2"];

  it.each(fonts)("preloads %s directly from the page head", (font) => {
    const head = Route.options.head as () => { links: HeadLink[] };
    const preloads = head().links.filter((link) => link.as === "font");
    expect(preloads.filter((link) => link.href === `/fonts/${font}`)).toEqual([
      {
        rel: "preload",
        href: `/fonts/${font}`,
        as: "font",
        type: "font/woff2",
        crossOrigin: "anonymous",
      },
    ]);
  });

  it.each(fonts)("serves a valid WOFF2 file for %s", (font) => {
    const bytes = readFileSync(`public/fonts/${font}`);
    expect(bytes.subarray(0, 4).toString()).toBe("wOF2");
    expect(bytes.length).toBeGreaterThan(10000);
  });

  it("uses the preload URLs for the two swap-enabled Latin font definitions", () => {
    const css = readFileSync("src/fonts.css", "utf8");
    expect([...css.matchAll(/url\("([^"]+)"\)/g)].map((match) => match[1])).toEqual(
      fonts.map((font) => `/fonts/${font}`),
    );
    expect(css.match(/font-display: swap/g)).toHaveLength(2);
    expect(css.match(/font-weight: 100 900/g)).toHaveLength(2);
    const stylesheet = readFileSync("src/styles.css", "utf8");
    expect(stylesheet).toContain('@import "./fonts.css";');
    expect(stylesheet).not.toContain('@import "@fontsource-variable/');
  });
});
