export type Theme = "dark" | "light";
export const THEME_KEY = "theme";

export function parseTheme(value: string | null | undefined): Theme {
  return value === "light" ? "light" : "dark";
}

export function readTheme(): Theme {
  if (typeof document === "undefined") return "dark";
  return document.documentElement.classList.contains("light") ? "light" : "dark";
}

export function applyTheme(theme: Theme) {
  const root = document.documentElement;
  root.classList.toggle("light", theme === "light");
  root.classList.toggle("dark", theme === "dark");
  root.style.colorScheme = theme;
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch {
    /* storage unavailable */
  }
}

/** Switch with a left-to-right wave (View Transitions) unless motion is reduced/unsupported. */
export function switchTheme(theme: Theme, reduceMotion: boolean) {
  const doc = document as Document & { startViewTransition?: (cb: () => void) => unknown };
  if (reduceMotion || typeof doc.startViewTransition !== "function") return applyTheme(theme);
  document.documentElement.dataset.themeWave = theme === "light" ? "ltr" : "rtl";
  doc.startViewTransition(() => applyTheme(theme));
}

/** Inline pre-paint script: applies the saved theme before first paint. */
export const THEME_SCRIPT = `try{var t=localStorage.getItem("${THEME_KEY}")==="light"?"light":"dark";var r=document.documentElement;r.classList.add(t);r.style.colorScheme=t}catch(e){}`;

function luminance(hex: string) {
  const n = hex.replace("#", "");
  const ch = (i: number) => {
    const c = Number.parseInt(n.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  };
  const [r, g, b] = [ch(0), ch(2), ch(4)];
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function contrastRatio(a: string, b: string) {
  const la = luminance(a);
  const lb = luminance(b);
  const hi = Math.max(la, lb);
  const lo = Math.min(la, lb);
  return (hi + 0.05) / (lo + 0.05);
}
