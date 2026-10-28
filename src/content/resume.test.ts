import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { content } from "./data";

const resume = new DOMParser().parseFromString(
  readFileSync("public/resume.html", "utf8"),
  "text/html",
);
const text = (element: Element | null) => element?.textContent?.replace(/\s+/g, " ").trim() ?? "";
const jobs = Array.from(resume.querySelectorAll(".job"));
const contactLinks = Array.from(resume.querySelectorAll(".contact-row a"));

// www and a trailing slash do not change these public profile identities.
function profileUrl(value: string) {
  const url = new URL(value);
  return `${url.protocol}//${url.hostname.replace(/^www\./, "")}${url.pathname.replace(/\/$/, "")}`;
}

function resumeMonth(value: string) {
  const [year, month] = value.split("-");
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  return `${months[Number(month) - 1]} ${year}`;
}

describe("resume HTML and portfolio shared facts", () => {
  it("uses the same candidate name", () => {
    expect(text(resume.querySelector(".header h1"))).toBe(content.profile.name);
  });

  it("uses the same professional title", () => {
    expect(text(resume.querySelector(".summary-text"))).toMatch(
      new RegExp(`^${content.profile.title.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`),
    );
  });

  it("uses the same email address and mail link", () => {
    const link = contactLinks.find((entry) => entry.getAttribute("href")?.startsWith("mailto:"));
    expect(link?.getAttribute("href")).toBe(`mailto:${content.profile.email}`);
    expect(text(link ?? null)).toBe(content.profile.email);
  });

  it.each(["github", "linkedin"] as const)("uses the same %s profile", (network) => {
    const expected = profileUrl(content.profile.links[network]);
    const links = contactLinks
      .map((entry) => entry.getAttribute("href"))
      .filter((href): href is string => Boolean(href?.startsWith("https://")))
      .map(profileUrl);
    expect(links).toContain(expected);
  });

  it("lists the same companies in the same career order", () => {
    expect(jobs.map((job) => text(job.querySelector(".job-company")))).toEqual(
      content.experiences.map((experience) => experience.company),
    );
  });

  it.each(content.experiences)("keeps $company's role title in sync", (experience) => {
    const job = jobs.find(
      (entry) => text(entry.querySelector(".job-company")) === experience.company,
    );
    expect(text(job?.querySelector(".job-role") ?? null)).toBe(experience.role);
  });

  it.each(content.experiences)("keeps $company's start/end dates in sync", (experience) => {
    const job = jobs.find(
      (entry) => text(entry.querySelector(".job-company")) === experience.company,
    );
    const period = text(job?.querySelector(".job-period") ?? null).replace(/[–—]/g, "-");
    expect(period).toBe(
      `${resumeMonth(experience.start)} - ${experience.end ? resumeMonth(experience.end) : "Present"}`,
    );
  });

  it("keeps the years-of-experience figure in sync", () => {
    const stat = content.snapshot.stats.find((entry) => entry.id === "years");
    expect(stat).toBeDefined();
    const years = text(resume.querySelector(".summary-text")).match(/(\d+)\+? years\b/i);
    expect(years).not.toBeNull();
    expect(Number(years?.[1])).toBe(stat?.value);
  });

  it.each([
    { id: "bundle", pattern: /JavaScript and CSS by\s*~?(\d+)%/i },
    { id: "images", pattern: /image assets by\s*~?(\d+)%/i },
    { id: "effort", pattern: /~?(\d+)% reduction in development effort/i },
  ])("keeps the $id improvement metric in sync", ({ id, pattern }) => {
    const stat = content.snapshot.stats.find((entry) => entry.id === id);
    expect(stat).toBeDefined();
    const metric = jobs.map(text).join(" ").match(pattern);
    expect(metric).not.toBeNull();
    expect(Number(metric?.[1])).toBe(stat?.value);
  });
});

describe("content from resume", () => {
  it("lists roles newest first: adidas, UKG, Infosys", () => {
    expect(content.experiences.map((e) => e.company)).toEqual(["adidas", "UKG", "Infosys"]);
  });

  it("uses real contact details", () => {
    expect(content.profile.email).toBe("sharma.vikkrant@gmail.com");
    expect(content.profile.links.github).toBe("https://github.com/vikkrantxx7");
    expect(content.profile.links.linkedin).toBe("https://www.linkedin.com/in/vikrant-sharma-001");
  });

  it("current role at adidas started Dec 2021 and is ongoing", () => {
    const adidas = content.experiences[0];
    expect(adidas?.start).toBe("2021-12");
    expect(adidas?.end).toBeNull();
  });

  it("career starts Sep 2013 (13 years)", () => {
    expect(content.experiences.at(-1)?.start).toBe("2013-09");
  });

  it("features PrepForge and git-contributor-stats", () => {
    const slugs = content.projects.map((p) => p.slug);
    expect(slugs).toContain("prepforge");
    expect(slugs).toContain("git-contributor-stats");
  });

  it("the resume PDF the site serves uses the same email", () => {
    const pdf = readFileSync("public/resume.pdf", "latin1");
    const mailtos = pdf.match(/mailto:[^>\s/)]+/g) ?? [];
    expect(mailtos.length).toBeGreaterThan(0);
    expect(new Set(mailtos)).toEqual(new Set([`mailto:${content.profile.email}`]));
    expect(pdf).not.toContain("sharma.vikrant@gmail.com");
  });
});
