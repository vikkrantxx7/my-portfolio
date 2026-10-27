import { describe, expect, it } from "vitest";
import manifest from "../../../public/manifest.webmanifest?raw";
import { shouldRegister } from "./register-sw";

const loc = (href: string) => new URL(href);

describe("shouldRegister", () => {
  it("registers on the real domain in production", () => {
    expect(shouldRegister(loc("https://vikrantfullstack.in/"), true, false)).toBe(true);
  });
  it("refuses in development", () => {
    expect(shouldRegister(loc("https://vikrantfullstack.in/"), false, false)).toBe(false);
  });
  it("refuses inside an iframe", () => {
    expect(shouldRegister(loc("https://vikrantfullstack.in/"), true, true)).toBe(false);
  });
  it("refuses with ?sw=off", () => {
    expect(shouldRegister(loc("https://vikrantfullstack.in/?sw=off"), true, false)).toBe(false);
  });
  it.each([
    "https://id-preview--349090e7-7418-46e5-9c38-68249eb75c53.lovable.app/",
    "https://preview--shop.lovable.app/",
    "https://preview-abc12--shop.gpt-eng.com/",
    "https://project--349090e7-7418-46e5-9c38-68249eb75c53-dev.lovable.app/",
    "https://x.lovableproject.com/",
    "https://lovableproject-dev.com/",
    "https://beta.lovable.dev/",
  ])("refuses on preview host %s", (href) => {
    expect(shouldRegister(loc(href), true, false)).toBe(false);
  });
  it("keeps the published lovable.app address eligible", () => {
    expect(shouldRegister(loc("https://vikk-after-dark-portfolio.lovable.app/"), true, false)).toBe(
      true,
    );
  });
});

describe("manifest", () => {
  const m = JSON.parse(manifest);
  it("describes an installable standalone app", () => {
    expect(m.name).toBe("Vikrant Sharma");
    expect(m.short_name).toBe("Vikrant");
    expect(m.display).toBe("standalone");
    expect(m.theme_color).toBe("#080A0F");
    const sizes = m.icons.map((i: { sizes: string }) => i.sizes);
    expect(sizes).toEqual(expect.arrayContaining(["192x192", "512x512"]));
    expect(m.icons.some((i: { purpose?: string }) => i.purpose === "maskable")).toBe(true);
  });
});
