import { expect, it } from "vitest";
import { getEnergyTransfer, getLiquidFrame } from "./header-energy-geometry";

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

it("long liquid transfers touch the destination border and wrap its full height", () => {
  const flight = getEnergyTransfer(avatar, work, "avatar", "pill");
  const frame = getLiquidFrame(flight, 1);
  expect(frame.x).toBe(400);
  expect(frame.y).toBe(32);
  expect(frame.radius).toBe(14);
});

it("leftward liquid transfers touch the right border without an offset", () => {
  const flight = getEnergyTransfer(experience, work, "pill", "pill");
  expect(getLiquidFrame(flight, 1).x).toBe(480);
});
