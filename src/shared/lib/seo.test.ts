import { describe, expect, it } from "vitest";
import { content } from "@/content/data";
import { pageUrl, personJsonLd } from "./seo";

describe("pageUrl", () => {
  it("uses the absolute primary domain for the homepage", () => {
    expect(pageUrl("/")).toBe("https://vikrantfullstack.in/");
  });

  it("keeps case studies self-referencing on the primary domain", () => {
    expect(pageUrl("/projects/prepforge")).toBe("https://vikrantfullstack.in/projects/prepforge");
  });
});

describe("personJsonLd", () => {
  it("describes the owner as a Person with email and profiles", () => {
    const data = personJsonLd(content.profile);
    expect(data["@type"]).toBe("Person");
    expect(data.name).toBe("Vikrant Sharma");
    expect(data.email).toBe("mailto:sharma.vikkrant@gmail.com");
    expect(data.sameAs).toEqual([
      "https://www.linkedin.com/in/vikrant-sharma-001",
      "https://github.com/vikkrantxx7",
    ]);
  });

  it("never publishes a phone number", () => {
    expect(JSON.stringify(personJsonLd(content.profile))).not.toMatch(/telephone/i);
  });
});
