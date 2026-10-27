export interface EnergyRect {
  left: number;
  right: number;
  top: number;
  height: number;
}

export function getEnergyTransfer(
  source: EnergyRect,
  destination: EnergyRect,
  sourceKind: "avatar" | "pill",
  destinationKind: "avatar" | "pill",
) {
  const rightward = destination.left > source.left;
  const from = { x: rightward ? source.right : source.left, y: source.top + source.height / 2 };
  const to = {
    x: rightward ? destination.left : destination.right,
    y: destination.top + destination.height / 2,
  };
  const distance = Math.hypot(to.x - from.x, to.y - from.y);
  const avatarFlight = sourceKind === "avatar" || destinationKind === "avatar";
  return {
    from,
    to,
    distance,
    rightward,
    edge: destinationKind === "avatar" ? "avatar" : rightward ? "left" : "right",
    duration: avatarFlight ? 0.68 : 0.36,
    tail: Math.min(230, Math.max(36, distance * 0.55)),
    source,
    destination,
    sourceKind,
    destinationKind,
  } as const;
}

export function rimFalloff(position: number) {
  return Math.max(0, 1 - Math.abs(position * 2 - 1)) ** 2;
}

export function getLightningPoints(flight: ReturnType<typeof getEnergyTransfer>, progress: number, dissolve = 0) {
  const p = Math.min(1, Math.max(0, progress));
  const consumed = Math.min(1, Math.max(0, dissolve));
  const segments = Math.max(4, Math.ceil(flight.distance / 18));
  return Array.from({ length: segments + 1 }, (_, index) => {
    const t = consumed + (1 - consumed) * index / segments;
    const offset = index === 0 || index === segments ? 0 :
      Math.sin(index * 2.399 + flight.distance * 0.017) * Math.min(3.5, flight.distance * 0.08) * Math.sin(Math.PI * t);
    return {
      x: flight.from.x + (flight.to.x - flight.from.x) * t * p,
      y: flight.from.y + (flight.to.y - flight.from.y) * t * p + offset * p * (1 - consumed),
    };
  });
}
