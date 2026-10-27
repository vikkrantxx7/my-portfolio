import { motion } from "motion/react";
import { type RefObject, useLayoutEffect, useRef, useState } from "react";
import { usePrefersReducedMotion } from "@/shared/lib/use-prefers-reduced-motion";
import { getEnergyTransfer } from "./header-energy-geometry";

type Flight = ReturnType<typeof getEnergyTransfer> & { key: number };

export function HeaderEnergy({ active, navRef }: { active: string | null; navRef: RefObject<HTMLElement | null> }) {
  const reduce = usePrefersReducedMotion();
  const previous = useRef(active);
  const serial = useRef(0);
  const [flight, setFlight] = useState<Flight | null>(null);

  useLayoutEffect(() => {
    const last = previous.current;
    previous.current = active;
    if (last === active || reduce) { setFlight(null); return; }
    const nav = navRef.current;
    if (!nav) return;
    const endpoint = (id: string | null) => nav.querySelector<HTMLElement>(id ? `a[href="#${id}"]` : "[data-avatar-frame]");
    const source = endpoint(last);
    const destination = endpoint(active);
    if (!source || !destination) return;
    const sourceRect = source.getBoundingClientRect();
    const destinationRect = destination.getBoundingClientRect();
    if (!sourceRect.width || !destinationRect.width) { setFlight(null); return; }
    const origin = nav.getBoundingClientRect();
    const local = (rect: DOMRect) => ({ left: rect.left - origin.left, right: rect.right - origin.left, top: rect.top - origin.top, height: rect.height });
    setFlight({ ...getEnergyTransfer(local(sourceRect), local(destinationRect), last ? "pill" : "avatar", active ? "pill" : "avatar"), key: ++serial.current });
  }, [active, reduce, navRef]);

  if (!flight || reduce) return null;
  const direction = flight.rightward ? 1 : -1;
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 hidden md:block" data-header-energy>
      <motion.div key={`flight-${flight.key}`} className="absolute left-0 top-0"
        initial={{ x: flight.from.x, y: flight.from.y, opacity: 0 }}
        animate={{ x: [flight.from.x, flight.to.x], y: [flight.from.y, flight.to.y], opacity: [0, 1, 1, 0] }}
        transition={{ duration: flight.duration, ease: [0.25, 0.1, 0.25, 1], opacity: { times: [0, 0.08, 0.85, 1], duration: flight.duration } }}>
        <motion.span className={`nav-energy-streak ${flight.rightward ? "nav-energy-right" : "nav-energy-left"}`}
          initial={{ width: 0 }} animate={{ width: [0, flight.tail, flight.tail * 0.65, 0] }}
          transition={{ duration: flight.duration, times: [0, 0.3, 0.7, 1] }} />
      </motion.div>
      <motion.span key={`emit-${flight.key}`} className="nav-energy-impact absolute left-0 top-0"
        initial={{ x: flight.from.x - 2, y: flight.from.y - 12, opacity: 0, scaleY: 0.4 }}
        animate={{ opacity: [0, 0.8, 0], scaleY: [0.4, 1, 0.5] }} transition={{ duration: 0.28 }} />
      <motion.span key={`absorb-${flight.key}`} data-energy-edge={flight.edge} className="nav-energy-impact absolute left-0 top-0"
        initial={{ x: flight.to.x - 2 * direction, y: flight.to.y - 12, opacity: 0, scaleY: 0.4 }}
        animate={{ opacity: [0, 1, 0], scaleY: [0.4, 1.2, 0.6] }}
        transition={{ delay: flight.duration * 0.85, duration: 0.4 }} />
    </div>
  );
}