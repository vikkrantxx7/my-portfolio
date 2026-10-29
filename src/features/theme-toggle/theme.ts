export type Theme = "dark" | "light";
export const THEME_KEY = "theme";
/** Shared speed of the paper-burn theme transition; the sun/moon icon arc matches it. */
export const THEME_TRANSITION_SECONDS = 1.7;

export function parseTheme(value: string | null | undefined): Theme {
  return value === "light" ? "light" : "dark";
}

export function readTheme(): Theme {
  if (typeof document === "undefined") return "dark";
  return document.documentElement.classList.contains("light") ? "light" : "dark";
}

/** Browser chrome colour (iOS status bar / Safari toolbar) per theme; matches the page background tokens. */
export const THEME_BAR_COLORS: Record<Theme, string> = { dark: "#080A0F", light: "#F6F7FB" };

/** Paints the browser chrome (iOS status bar / Safari toolbar) to match the theme. */
export function syncBrowserBar(theme: Theme) {
  // iOS Safari latches the theme-color element it saw first and ignores later
  // content edits, so swap in a fresh element instead of mutating it.
  for (const m of document.querySelectorAll('meta[name="theme-color"]')) m.remove();
  const meta = document.createElement("meta");
  meta.name = "theme-color";
  meta.content = THEME_BAR_COLORS[theme];
  document.head.appendChild(meta);
}

export function applyTheme(theme: Theme) {
  const root = document.documentElement;
  root.classList.toggle("light", theme === "light");
  root.classList.toggle("dark", theme === "dark");
  root.style.colorScheme = theme;
  syncBrowserBar(theme);
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch {
    /* storage unavailable */
  }
}

export interface BurnOrigin {
  x: number;
  y: number;
}

/**
 * Switch with a burn transition (View Transitions) radiating from the toggle,
 * unless motion is reduced/unsupported. Light incinerates outward; dark consumes.
 */
export function switchTheme(theme: Theme, reduceMotion: boolean, origin?: BurnOrigin) {
  const doc = document as Document & { startViewTransition?: (cb: () => void) => unknown };
  // Update the bar immediately: some iOS Safari builds ignore theme-color
  // changes made while a view transition is running, leaving the top bar in
  // the previous theme until reload.
  syncBrowserBar(theme);
  if (reduceMotion || typeof doc.startViewTransition !== "function") return applyTheme(theme);
  const root = document.documentElement;
  root.dataset["themeBurn"] = theme;
  const o = origin ?? { x: window.innerWidth - 44, y: 44 };
  root.style.setProperty("--burn-x", `${o.x}px`);
  root.style.setProperty("--burn-y", `${o.y}px`);
  const transition = doc.startViewTransition(() => applyTheme(theme)) as
    | { finished?: Promise<unknown> }
    | undefined;
  // Re-sync once the burn settles in case the browser dropped the mid-transition update.
  transition?.finished?.catch(() => undefined).then(() => syncBrowserBar(theme));
}

/** Inline pre-paint script: applies the saved theme before first paint. */
export const THEME_SCRIPT = `try{var t=localStorage.getItem("${THEME_KEY}")==="light"?"light":"dark";var r=document.documentElement;r.classList.add(t);r.style.colorScheme=t;var c=t==="light"?"${THEME_BAR_COLORS.light}":"${THEME_BAR_COLORS.dark}";var m=document.createElement("meta");m.name="theme-color";m.content=c;document.head.appendChild(m)}catch(e){}`;

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
