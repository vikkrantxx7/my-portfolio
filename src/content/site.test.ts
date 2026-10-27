import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { pageUrl, personJsonLd } from "@/shared/lib/seo";
import { content } from "./data";
import { site } from "./site";

const SRC = path.resolve(__dirname, "..");

function sourceFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const full = path.join(dir, name);
    if (statSync(full).isDirectory()) return sourceFiles(full);
    return /\.(ts|tsx)$/.test(name) && !/\.test\./.test(name) ? [full] : [];
  });
}

describe("site config", () => {
  it("builds every canonical URL from the configured site URL", () => {
    expect(pageUrl("/")).toBe(`${site.url}/`);
    expect(pageUrl("/projects/x")).toBe(`${site.url}/projects/x`);
  });

  it("uses the configured job title in the Person JSON-LD", () => {
    expect(personJsonLd(content.profile).jobTitle).toBe(content.profile.title);
  });

  it("keeps personal details out of code outside src/content", () => {
    const personal = [
      content.profile.name,
      content.profile.email,
      content.profile.avatarUrl,
      new URL(site.url).host,
    ];
    const offenders = sourceFiles(SRC)
      .filter((file) => !file.startsWith(path.join(SRC, "content")))
      .filter((file) => !file.endsWith("routeTree.gen.ts"))
      .filter((file) => {
        const text = readFileSync(file, "utf8");
        return personal.some((value) => text.includes(value ?? "\u0000"));
      })
      .map((file) => path.relative(SRC, file));
    expect(offenders).toEqual([]);
  });
});
