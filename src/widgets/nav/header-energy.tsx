import { animate, motion, useMotionValue, useTransform } from "motion/react";
import { type RefObject, useId, useLayoutEffect, useRef, useState } from "react";
import { usePrefersReducedMotion } from "@/shared/lib/use-prefers-reduced-motion";
import { type EnergyRect, getEnergyTransfer, getLightningPoints, rimFalloff } from "./header-energy-geometry";

type Flight = ReturnType<typeof getEnergyTransfer> & { key: number };

function borderArc(rect: EnergyRect, right: boolean, avatar: boolean) {
  const radius = avatar ? 6 : rect.height / 2;
  const x = right ? rect.right : rect.left;
  const inner = x + (right ? -radius : radius);
  const bottom = rect.top + rect.height;
  const sweep = right ? 1 : 0;
  return `M ${inner} ${rect.top} A ${radius} ${radius} 0 0 ${sweep} ${x} ${rect.top + radius} L ${x} ${bottom - radius} A ${radius} ${radius} 0 0 ${sweep} ${inner} ${bottom}`;
}

function LightningFlight({ flight }: { flight: Flight }) {
  const progress = useMotionValue(0);
  const absorption = useMotionValue(0);
  const gradientId = useId().replace(/:/g, "");
  useLayoutEffect(() => {
    const animation = animate(progress, 1, {
      duration: flight.duration,
      ease: [0.25, 0.1, 0.25, 1],
    });
    const glow = animate(absorption, [0, 0.65, 0], {
      delay: flight.duration * 0.8,
      duration: 0.65,
      times: [0, 0.4, 1],
      ease: "easeInOut",
    });
    return () => {
      animation.stop();
      glow.stop();
    };
  }, [flight, progress, absorption]);
  const shape = useTransform(progress, (p) => {
    return getLightningPoints(flight, p).map((point, index) =>
      `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`,
    ).join(" ");
  });
  return (
    <motion.svg
      aria-hidden
      className="nav-energy-canvas pointer-events-none absolute inset-0 hidden size-full md:block"
      data-header-energy
      initial={{ opacity: 1 }}
      animate={{ opacity: [1, 1, 0] }}
      transition={{
        duration: flight.duration + 0.7,
        times: [0, flight.duration / (flight.duration + 0.7), 1],
      }}
    >
      <defs>
        <linearGradient
          id={gradientId}
          x1={flight.from.x}
          y1={flight.from.y}
          x2={flight.to.x}
          y2={flight.to.y}
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0" className="nav-energy-stop-tail" />
          <stop offset="0.55" className="nav-energy-stop-mid" />
          <stop offset="1" className="nav-energy-stop-head" />
        </linearGradient>
        {([flight.source, flight.destination] as const).map((rect, index) => (
          <linearGradient key={index} id={`${gradientId}-rim-${index}`} x1="0" x2="0"
            y1={rect.top} y2={rect.top + rect.height} gradientUnits="userSpaceOnUse">
            {[0, 0.15, 0.3, 0.4, 0.5, 0.6, 0.7, 0.85, 1].map((position) => (
              <stop key={position} offset={position} className="nav-energy-stop-head" stopOpacity={rimFalloff(position)} />
            ))}
          </linearGradient>
        ))}
      </defs>
      <g className="nav-energy-fused">
        <motion.path d={shape} stroke={`url(#${gradientId})`} className="nav-energy-lightning"
          initial={{ opacity: 0 }} animate={{ opacity: [0, 0.85, 0.85, 0] }}
          transition={{ duration: flight.duration + 0.28, times: [0, 0.2, 0.72, 1], ease: "easeInOut" }} />
        <motion.path
          d={borderArc(flight.source, flight.rightward, flight.sourceKind === "avatar")}
          className="nav-energy-rim"
          stroke={`url(#${gradientId}-rim-0)`}
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.95, 0.95, 0] }}
          transition={{
            duration: flight.duration + 0.35,
            times: [0, 0.3, 0.5, 1],
            ease: "easeInOut",
          }}
        />
        <motion.path
          data-energy-edge={flight.edge}
          d={borderArc(flight.destination, !flight.rightward, flight.destinationKind === "avatar")}
          className="nav-energy-rim"
          stroke={`url(#${gradientId}-rim-1)`}
          style={{ opacity: absorption }}
        />
      </g>
    </motion.svg>
  );
}

export function HeaderEnergy({
  active,
  navRef,
}: {
  active: string | null;
  navRef: RefObject<HTMLElement | null>;
}) {
  const reduce = usePrefersReducedMotion();
  const previous = useRef(active);
  const serial = useRef(0);
  const [flight, setFlight] = useState<Flight | null>(null);
  useLayoutEffect(() => {
    const last = previous.current;
    previous.current = active;
    if (last === active || reduce) {
      setFlight(null);
      return;
    }
    const nav = navRef.current;
    if (!nav) return;
    const endpoint = (id: string | null) =>
      nav.querySelector<HTMLElement>(id ? `a[href="#${id}"]` : "[data-avatar-frame]");
    const source = endpoint(last);
    const destination = endpoint(active);
    if (!source || !destination) return;
    const sourceRect = source.getBoundingClientRect();
    const destinationRect = destination.getBoundingClientRect();
    if (!sourceRect.width || !destinationRect.width) {
      setFlight(null);
      return;
    }
    const origin = nav.getBoundingClientRect();
    const local = (rect: DOMRect) => ({
      left: rect.left - origin.left,
      right: rect.left + rect.width - origin.left,
      top: rect.top - origin.top,
      height: rect.height,
    });
    setFlight({
      ...getEnergyTransfer(
        local(sourceRect),
        local(destinationRect),
        last ? "pill" : "avatar",
        active ? "pill" : "avatar",
      ),
      key: ++serial.current,
    });
  }, [active, reduce, navRef]);
  return flight && !reduce ? <LightningFlight key={flight.key} flight={flight} /> : null;
}
