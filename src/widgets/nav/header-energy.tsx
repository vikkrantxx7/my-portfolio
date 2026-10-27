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
  const dissolve = useMotionValue(0);
  const spread = useMotionValue(0.15);
  const rimStart = useTransform(spread, s => flight.destination.top + flight.destination.height * (0.5 - s / 2));
  const rimEnd = useTransform(spread, s => flight.destination.top + flight.destination.height * (0.5 + s / 2));
  const gradientId = useId().replace(/:/g, "");
  useLayoutEffect(() => {
    const animation = animate(progress, 1, {
      duration: flight.duration,
      ease: [0.25, 0.1, 0.25, 1],
    });
    const glow = animate(absorption, [0, 0.95, 0.95, 0], {
      delay: flight.duration,
      duration: 0.85,
      times: [0, 0.3, 0.48, 1],
      ease: "easeInOut",
    });
    const consume = animate(dissolve, 1, { delay: flight.duration, duration: 0.38, ease: "easeOut" });
    const expansion = animate(spread, 1, { delay: flight.duration, duration: 0.42, ease: "easeOut" });
    return () => {
      animation.stop();
      glow.stop();
      consume.stop();
      expansion.stop();
    };
  }, [flight, progress, absorption, dissolve, spread]);
  const shape = useTransform(() => {
    return getLightningPoints(flight, progress.get(), dissolve.get()).map((point, index) =>
      `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`,
    ).join(" ");
  });
  return (
    <motion.svg
      aria-hidden
      className="nav-energy-canvas pointer-events-none absolute inset-0 z-10 hidden size-full md:block"
      data-header-energy
      initial={{ opacity: 1 }}
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
          <motion.linearGradient key={index} id={`${gradientId}-rim-${index}`} x1="0" x2="0"
            y1={index === 1 ? rimStart : rect.top} y2={index === 1 ? rimEnd : rect.top + rect.height} gradientUnits="userSpaceOnUse">
            {[0, 0.15, 0.3, 0.4, 0.5, 0.6, 0.7, 0.85, 1].map((position) => (
              <stop key={position} offset={position} className="nav-energy-stop-head" stopOpacity={rimFalloff(position)} />
            ))}
          </motion.linearGradient>
        ))}
      </defs>
      <g className="nav-energy-fused">
        <motion.path d={shape} stroke={`url(#${gradientId})`} className="nav-energy-lightning"
          initial={{ opacity: 0 }} animate={{ opacity: [0, 0.85, 0.85, 0] }}
          transition={{ duration: flight.duration + 0.38, times: [0, 0.15, flight.duration / (flight.duration + 0.38), 1], ease: "easeInOut" }} />
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
        <motion.path
          d={borderArc(flight.destination, !flight.rightward, flight.destinationKind === "avatar")}
          className="nav-energy-rim-bloom"
          stroke={`url(#${gradientId}-rim-1)`}
          style={{ opacity: absorption }}
        />
      </g>
    </motion.svg>
  );
}

export type EnergyEndpoint = { element: HTMLElement; kind: "avatar" | "pill" };
export type EnergyTargetResolver = (key: string | null, container: HTMLElement) => EnergyEndpoint | null;

/** Default lookup: any element marked data-energy-target="<key>"; data-energy-shape="circle" draws round rims. */
export const dataAttributeTargets: EnergyTargetResolver = (key, container) => {
  if (key === null) return null;
  const element = container.querySelector<HTMLElement>(`[data-energy-target="${CSS.escape(key)}"]`);
  if (!element) return null;
  return { element, kind: element.dataset.energyShape === "circle" ? "avatar" : "pill" };
};

/**
 * Lightning hand-off between two elements inside a container (nav bar, tabs, ...).
 * `active` is the current target key; changing it fires one flight from the previous target.
 */
export function HeaderEnergy({
  active,
  navRef,
  resolveTarget = dataAttributeTargets,
}: {
  active: string | null;
  navRef: RefObject<HTMLElement | null>;
  resolveTarget?: EnergyTargetResolver;
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
    const source = resolveTarget(last, nav);
    const destination = resolveTarget(active, nav);
    if (!source || !destination) return;
    const sourceRect = source.element.getBoundingClientRect();
    const destinationRect = destination.element.getBoundingClientRect();
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
        source.kind,
        destination.kind,
      ),
      key: ++serial.current,
    });
  }, [active, reduce, navRef, resolveTarget]);
  return flight && !reduce ? <LightningFlight key={flight.key} flight={flight} /> : null;
}
