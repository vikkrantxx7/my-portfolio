import { animate, motion, useMotionValue, useTransform } from "motion/react";
import { type RefObject, useId, useLayoutEffect, useRef, useState } from "react";
import { usePrefersReducedMotion } from "@/shared/lib/use-prefers-reduced-motion";
import { getEnergyTransfer, getLiquidFrame, type EnergyRect } from "./header-energy-geometry";

type Flight = ReturnType<typeof getEnergyTransfer> & { key: number };

function borderArc(rect: EnergyRect, right: boolean, avatar: boolean) {
  const radius = avatar ? 6 : rect.height / 2;
  const x = right ? rect.right : rect.left;
  const inner = x + (right ? -radius : radius);
  const bottom = rect.top + rect.height;
  return `M ${inner} ${rect.top} Q ${x} ${rect.top} ${x} ${rect.top + radius} L ${x} ${bottom - radius} Q ${x} ${bottom} ${inner} ${bottom}`;
}

function LiquidFlight({ flight }: { flight: Flight }) {
  const progress = useMotionValue(0);
  const gradientId = useId().replace(/:/g, "");
  useLayoutEffect(() => {
    const animation = animate(progress, 1, { duration: flight.duration, ease: [0.25, 0.1, 0.25, 1] });
    return () => animation.stop();
  }, [flight, progress]);
  const shape = useTransform(progress, (p) => {
    const { x, y, radius: r, tail } = getLiquidFrame(flight, p);
    const dir = flight.rightward ? 1 : -1;
    const tip = x + dir * r;
    const rear = x - dir * tail;
    const neck = x - dir * tail * 0.26;
    const thickness = 3 + Math.sin(p * Math.PI) * 3;
    // Concave fork follows the capsule's rounded nose, rather than a detached bar.
    return `M ${rear} ${y} C ${neck} ${y - thickness} ${x - dir * r} ${y - thickness} ${tip} ${y - r} Q ${x} ${y - r} ${x} ${y} Q ${x} ${y + r} ${tip} ${y + r} C ${x - dir * r} ${y + thickness} ${neck} ${y + thickness} ${rear} ${y} Z`;
  });
  return (
    <motion.svg aria-hidden className="nav-energy-canvas pointer-events-none absolute inset-0 hidden size-full md:block" data-header-energy
      initial={{ opacity: 1 }} animate={{ opacity: [1, 1, 0] }}
      transition={{ duration: flight.duration + 0.45, times: [0, flight.duration / (flight.duration + 0.45), 1] }}>
      <defs>
        <linearGradient id={gradientId} x1={flight.from.x} y1={flight.from.y} x2={flight.to.x} y2={flight.to.y} gradientUnits="userSpaceOnUse">
          <stop offset="0" className="nav-energy-stop-tail" />
          <stop offset="0.55" className="nav-energy-stop-mid" />
          <stop offset="1" className="nav-energy-stop-head" />
        </linearGradient>
      </defs>
      <motion.path d={shape} fill={`url(#${gradientId})`} className="nav-energy-liquid" />
      <motion.path d={borderArc(flight.source, flight.rightward, flight.sourceKind === "avatar")} className="nav-energy-rim"
        initial={{ opacity: 0 }} animate={{ opacity: [0, 1, 1, 0] }}
        transition={{ duration: flight.duration + 0.2, times: [0, 0.08, 0.45, 1] }} />
      <motion.path data-energy-edge={flight.edge} d={borderArc(flight.destination, !flight.rightward, flight.destinationKind === "avatar")} className="nav-energy-rim"
        initial={{ opacity: 0 }} animate={{ opacity: [0, 1, 0] }}
        transition={{ delay: flight.duration * 0.72, duration: 0.5, times: [0, 0.4, 1] }} />
    </motion.svg>
  );
}

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
  return flight && !reduce ? <LiquidFlight key={flight.key} flight={flight} /> : null;
}