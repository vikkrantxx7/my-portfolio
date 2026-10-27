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

export function getLiquidFrame(flight: ReturnType<typeof getEnergyTransfer>, progress: number) {
  const p = Math.min(1, Math.max(0, progress));
  return {
    x: flight.from.x + (flight.to.x - flight.from.x) * p,
    y: flight.from.y + (flight.to.y - flight.from.y) * p,
    radius: (flight.destination.height / 2) * (0.25 + 0.75 * p),
    tail: flight.tail * Math.sin((Math.PI * p) / 2),
  };
}
