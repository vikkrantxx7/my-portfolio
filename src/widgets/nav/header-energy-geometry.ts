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

export function getImpactBranches(flight: ReturnType<typeof getEnergyTransfer>) {
  const direction = flight.rightward ? 1 : -1;
  const radius = flight.destination.height / 2;
  const spread = Math.min(6, radius * 0.45);
  const bend = flight.destinationKind === "avatar" ? 0 : radius - Math.sqrt(radius ** 2 - spread ** 2);
  return [-1, 1].map((side) => [
    { x: flight.to.x - direction * Math.min(12, flight.distance * 0.3), y: flight.to.y },
    { x: flight.to.x - direction * 4, y: flight.to.y + side * spread * 0.4 },
    { x: flight.to.x - direction * 6, y: flight.to.y + side * spread * 0.7 },
    { x: flight.to.x + direction * bend, y: flight.to.y + side * spread },
  ]);
}

export function getLightningPoints(flight: ReturnType<typeof getEnergyTransfer>, progress: number) {
  const p = Math.min(1, Math.max(0, progress));
  const segments = Math.max(4, Math.ceil(flight.distance / 18));
  return Array.from({ length: segments + 1 }, (_, index) => {
    const t = index / segments;
    const offset = index === 0 || index === segments ? 0 :
      Math.sin(index * 2.399 + flight.distance * 0.017) * Math.min(3.5, flight.distance * 0.08) * Math.sin(Math.PI * t);
    return {
      x: flight.from.x + (flight.to.x - flight.from.x) * t * p,
      y: flight.from.y + (flight.to.y - flight.from.y) * t * p + offset * p,
    };
  });
}
