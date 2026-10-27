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
    duration: avatarFlight ? 0.56 : 0.28,
    tail: Math.min(112, Math.max(24, distance * 0.38)),
  } as const;
}
