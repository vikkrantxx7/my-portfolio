import { expect, it } from "vitest";
import { getEnergyTransfer, getImpactBranches, getLightningPoints, rimFalloff } from "./header-energy-geometry";

const avatar = { left: 20, right: 52, top: 16, height: 32 };
const work = { left: 400, right: 480, top: 18, height: 28 };
const experience = { left: 520, right: 650, top: 18, height: 28 };

it("emits from the avatar right border and absorbs at the first pill left border", () => {
  expect(getEnergyTransfer(avatar, work, "avatar", "pill")).toMatchObject({
    from: { x: 52, y: 32 },
    to: { x: 400, y: 32 },
    edge: "left",
  });
});

it("absorbs rightward transfers at the left pill border", () => {
  expect(getEnergyTransfer(work, experience, "pill", "pill")).toMatchObject({
    from: { x: 480, y: 32 },
    to: { x: 520, y: 32 },
    edge: "left",
  });
});

it("absorbs leftward transfers at the right pill border", () => {
  expect(getEnergyTransfer(experience, work, "pill", "pill")).toMatchObject({
    from: { x: 520, y: 32 },
    to: { x: 480, y: 32 },
    edge: "right",
  });
});

it("returns energy to the avatar right rim when the name is selected", () => {
  expect(getEnergyTransfer(work, avatar, "pill", "avatar")).toMatchObject({
    from: { x: 400, y: 32 },
    to: { x: 52, y: 32 },
    edge: "avatar",
  });
});

it("avatar transfers travel farther and last longer than tab hops", () => {
  const hop = getEnergyTransfer(work, experience, "pill", "pill");
  const flight = getEnergyTransfer(avatar, experience, "avatar", "pill");
  expect(flight.distance).toBeGreaterThan(hop.distance);
  expect(flight.duration).toBeGreaterThan(hop.duration);
});

it("lightning starts and ends on the measured border centres in both directions", () => {
  for (const flight of [getEnergyTransfer(avatar, work, "avatar", "pill"), getEnergyTransfer(work, avatar, "pill", "avatar")]) {
    const points = getLightningPoints(flight, 1);
    expect(points[0]).toEqual(flight.from);
    expect(points.at(-1)).toEqual(flight.to);
  }
});

it("lightning is irregular but stays within a thin bounded corridor", () => {
  const flight = getEnergyTransfer(avatar, work, "avatar", "pill");
  const points = getLightningPoints(flight, 1);
  expect(points.some((point) => point.y > 32)).toBe(true);
  expect(points.some((point) => point.y < 32)).toBe(true);
  for (const point of points) {
    expect(point.x).toBeGreaterThanOrEqual(52);
    expect(point.x).toBeLessThanOrEqual(400);
    expect(Math.abs(point.y - 32)).toBeLessThanOrEqual(3.5);
  }
});

it("border illumination peaks at centre and fades symmetrically toward the ends", () => {
  expect(rimFalloff(0.5)).toBe(1);
  expect(rimFalloff(0)).toBe(0);
  expect(rimFalloff(1)).toBe(0);
  expect(rimFalloff(0.25)).toBeLessThan(rimFalloff(0.4));
  expect(rimFalloff(0.25)).toBeCloseTo(rimFalloff(0.75));
});

it("impact forks spread a little and land on the curved pill boundary in both directions", () => {
  for (const flight of [getEnergyTransfer(avatar, work, "avatar", "pill"), getEnergyTransfer(experience, work, "pill", "pill")]) {
    const branches = getImpactBranches(flight);
    expect(branches).toHaveLength(2);
    for (const branch of branches) {
      const end = branch.at(-1);
      if (!end) throw new Error("Missing impact endpoint");
      expect(Math.abs(end.y - flight.to.y)).toBe(6);
      const centreX = flight.rightward ? work.left + 14 : work.right - 14;
      expect(Math.hypot(end.x - centreX, end.y - flight.to.y)).toBeCloseTo(14);
    }
  }
});
