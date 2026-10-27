export const RESUME_THEME_KEY = "resume-theme";

/** Stored resume viewing mode; defaults to paper. Safe when storage is unavailable. */
export function readResumeDark(): boolean {
  try {
    return localStorage.getItem(RESUME_THEME_KEY) === "dark";
  } catch {
    return false;
  }
}

export function writeResumeDark(dark: boolean) {
  try {
    localStorage.setItem(RESUME_THEME_KEY, dark ? "dark" : "paper");
  } catch {
    /* storage unavailable */
  }
}
