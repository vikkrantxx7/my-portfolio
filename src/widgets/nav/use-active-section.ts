import { useCallback, useEffect, useRef, useState } from "react";

export function useActiveSection(ids: readonly string[]) {
  const [active, setActive] = useState<string | null>(null);
  const pending = useRef<string | null>(null);
  const key = ids.join(",");
  const select = useCallback((id: string) => {
    pending.current = id;
    setActive(id === "top" ? null : id);
  }, []);

  useEffect(() => {
    let frame = 0;
    let settleTimer: ReturnType<typeof setTimeout> | undefined;
    const measure = () => {
      frame = 0;
      if (pending.current) return;
      // Match the targets' scroll-margin so selection changes at the header,
      // not an observer band halfway down the viewport. Above Work means top.
      let current: string | null = null;
      for (const id of key.split(",")) {
        const el = document.getElementById(id);
        if (!el) continue;
        const margin = Number.parseFloat(getComputedStyle(el).scrollMarginTop) || 96;
        if (el.getBoundingClientRect().top <= margin + 1) current = id;
      }
      setActive(window.scrollY <= 1 ? null : current);
    };
    const finish = () => {
      clearTimeout(settleTimer);
      pending.current = null;
      measure();
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(measure);
      clearTimeout(settleTimer);
      // Fallback for browsers without scrollend; only releases after scrolling
      // stops, not a fixed navigation timeout that could expire mid-scroll.
      settleTimer = setTimeout(finish, 160);
    };
    const interrupt = () => {
      if (pending.current) finish();
    };
    const onKey = (event: KeyboardEvent) => {
      if (["ArrowUp", "ArrowDown", "PageUp", "PageDown", "Home", "End", " "].includes(event.key)) interrupt();
    };
    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    window.addEventListener("scrollend", finish);
    window.addEventListener("wheel", interrupt, { passive: true });
    window.addEventListener("touchstart", interrupt, { passive: true });
    window.addEventListener("keydown", onKey);
    return () => {
      cancelAnimationFrame(frame);
      clearTimeout(settleTimer);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      window.removeEventListener("scrollend", finish);
      window.removeEventListener("wheel", interrupt);
      window.removeEventListener("touchstart", interrupt);
      window.removeEventListener("keydown", onKey);
    };
  }, [key]);
  return { active, select };
}
