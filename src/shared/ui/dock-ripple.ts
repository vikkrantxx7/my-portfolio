import type { PointerEvent } from "react";
import { prefersReducedMotion } from "@/shared/lib/use-prefers-reduced-motion";

/** Safety net so a ripple never outlives its animation. */
const RIPPLE_TTL_MS = 800;

/**
 * Spawns a soft radial ripple inside the pressed dock item, centred on the
 * pointer. Pure DOM (no state) so it works on links, buttons and icons alike.
 */
export function spawnDockRipple(event: PointerEvent<HTMLElement>) {
  if (prefersReducedMotion()) return;
  const target = event.currentTarget;
  const rect = target.getBoundingClientRect();
  const size = Math.max(rect.width, rect.height) * 2.4;

  const ripple = document.createElement("span");
  ripple.className = "dock-ripple";
  ripple.setAttribute("aria-hidden", "true");
  ripple.style.width = `${size}px`;
  ripple.style.height = `${size}px`;
  ripple.style.left = `${event.clientX - rect.left - size / 2}px`;
  ripple.style.top = `${event.clientY - rect.top - size / 2}px`;

  const remove = () => ripple.remove();
  ripple.addEventListener("animationend", remove, { once: true });
  window.setTimeout(remove, RIPPLE_TTL_MS);
  target.appendChild(ripple);
}

/** Spread the returned props onto any dock control to give it the tap ripple. */
export function useDockRipple() {
  return { onPointerDown: spawnDockRipple };
}
