import { useEffect, useRef, useState } from "react";
import { prefersReducedMotion } from "@/shared/lib/use-prefers-reduced-motion";

export function useCountUp<T extends Element>(target: number, duration = 1200) {
  const ref = useRef<T>(null);
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (prefersReducedMotion() || typeof IntersectionObserver === "undefined") {
      setValue(target);
      return;
    }
    let raf = 0;
    const io = new IntersectionObserver((entries) => {
      if (!entries.some((e) => e.isIntersecting)) return;
      io.disconnect();
      const start = performance.now();
      const tick = (now: number) => {
        const t = Math.min(1, (now - start) / duration);
        setValue(Math.round(target * (1 - (1 - t) ** 3)));
        if (t < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    });
    if (ref.current) io.observe(ref.current);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [target, duration]);

  return { ref, value };
}
