import { useCallback, useEffect, useRef } from "react";

export const LONG_PRESS_MS = 600;
export const MOVE_TOLERANCE_PX = 10;

/**
 * Secondary interaction for a button: right-click, touch long-press, or
 * Shift+F10 / ContextMenu key. After a completed long-press the next click is
 * swallowed so the primary action (play/pause) does not also fire.
 */
export function useSecondaryPress(onSecondary: () => void) {
  const cb = useRef(onSecondary);
  cb.current = onSecondary;
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const start = useRef<{ x: number; y: number } | null>(null);
  const swallowClick = useRef(false);

  const cancel = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
    start.current = null;
  }, []);
  useEffect(() => cancel, [cancel]);

  return {
    onContextMenu: (e: React.MouseEvent) => {
      e.preventDefault();
      // A long-press on touch also emits contextmenu; it already opened.
      if (swallowClick.current) return;
      cancel();
      cb.current();
    },
    onPointerDown: (e: React.PointerEvent) => {
      swallowClick.current = false;
      if (e.pointerType === "mouse") return;
      start.current = { x: e.clientX, y: e.clientY };
      timer.current = setTimeout(() => {
        timer.current = null;
        swallowClick.current = true;
        cb.current();
      }, LONG_PRESS_MS);
    },
    onPointerMove: (e: React.PointerEvent) => {
      const s = start.current;
      if (s && Math.hypot(e.clientX - s.x, e.clientY - s.y) > MOVE_TOLERANCE_PX) cancel();
    },
    onPointerUp: cancel,
    onPointerCancel: cancel,
    onPointerLeave: cancel,
    onKeyDown: (e: React.KeyboardEvent) => {
      if (e.key === "ContextMenu" || (e.shiftKey && e.key === "F10")) {
        e.preventDefault();
        cb.current();
      }
    },
    /** Wrap the primary click: returns false when it must be ignored. */
    shouldHandleClick: () => {
      if (swallowClick.current) {
        swallowClick.current = false;
        return false;
      }
      return true;
    },
  };
}
