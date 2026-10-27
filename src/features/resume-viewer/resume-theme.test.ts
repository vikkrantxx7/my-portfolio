import { beforeEach, describe, expect, it } from "vitest";
import { RESUME_THEME_KEY, readResumeDark, writeResumeDark } from "./resume-theme";

describe("resume view mode storage", () => {
  beforeEach(() => localStorage.clear());

  it("defaults to paper view when nothing is stored", () => {
    expect(readResumeDark()).toBe(false);
  });

  it("reads a stored dark choice", () => {
    localStorage.setItem(RESUME_THEME_KEY, "dark");
    expect(readResumeDark()).toBe(true);
  });

  it("saves the chosen mode", () => {
    writeResumeDark(true);
    expect(localStorage.getItem(RESUME_THEME_KEY)).toBe("dark");
    writeResumeDark(false);
    expect(localStorage.getItem(RESUME_THEME_KEY)).toBe("paper");
  });
});
