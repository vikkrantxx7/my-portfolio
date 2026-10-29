/** Border-box geometry, traced clockwise from the top midpoint. */
export function dockProgressGeometry(
  width: number,
  height: number,
  borderWidth: number,
  outerRadius: number,
) {
  const inset = borderWidth / 2;
  const left = inset;
  const top = inset;
  const right = width - inset;
  const bottom = height - inset;
  const radius = Math.max(0, Math.min(outerRadius, width / 2, height / 2) - inset);
  const middle = width / 2;
  const path = [
    `M ${middle} ${top}`,
    `L ${right - radius} ${top}`,
    `A ${radius} ${radius} 0 0 1 ${right} ${top + radius}`,
    `L ${right} ${bottom - radius}`,
    `A ${radius} ${radius} 0 0 1 ${right - radius} ${bottom}`,
    `L ${left + radius} ${bottom}`,
    `A ${radius} ${radius} 0 0 1 ${left} ${bottom - radius}`,
    `L ${left} ${top + radius}`,
    `A ${radius} ${radius} 0 0 1 ${left + radius} ${top}`,
    `L ${middle} ${top} Z`,
  ].join(" ");
  return {
    path,
    radius,
    start: { x: middle, y: top },
    bounds: { left, top, right, bottom },
    perimeter: 2 * (right - left + bottom - top - 4 * radius) + 2 * Math.PI * radius,
  };
}