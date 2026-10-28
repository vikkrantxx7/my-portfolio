import { useSyncExternalStore } from "react";
import { readTheme, type Theme } from "./theme";

// The theme lives on <html>'s class list, so a MutationObserver is the
// cheapest store: every component reading the theme re-renders when
// applyTheme() toggles the class, without sharing toggle state.
function subscribe(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["class"],
  });
  return () => observer.disconnect();
}

/** Reactive current site theme; "dark" while rendering on the server. */
export function useTheme(): Theme {
  return useSyncExternalStore(subscribe, readTheme, () => "dark");
}
