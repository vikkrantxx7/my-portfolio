import { describe, expect, it } from "vitest";
import { bindResumeZoom, wheelResumeScale } from "./resume-document-zoom";

describe("resume-only zoom", () => {
  it("scales by wheel magnitude and normalizes line deltas", () => {
    expect(wheelResumeScale(1, -100, 0)).toBeCloseTo(Math.exp(0.15));
    expect(wheelResumeScale(1, -1, 1)).toBeCloseTo(wheelResumeScale(1, -16, 0));
    expect(wheelResumeScale(1, -1, 0)).toBeLessThan(1.01);
  });

  it("captures trackpad pinch without changing the app and leaves normal scrolling alone", () => {
    const doc = document.implementation.createHTMLDocument("Resume");
    const host = document.createElement("div");
    const frame = document.createElement("iframe");
    host.appendChild(frame);
    const cleanup = bindResumeZoom(doc, frame, host);
    const scroll = new WheelEvent("wheel", { deltaY: 100, cancelable: true });
    doc.dispatchEvent(scroll);
    expect(scroll.defaultPrevented).toBe(false);
    const pinch = new WheelEvent("wheel", { deltaY: -100, ctrlKey: true, cancelable: true });
    doc.dispatchEvent(pinch);
    expect(pinch.defaultPrevented).toBe(true);
    expect(Number(doc.body.style.zoom)).toBeCloseTo(Math.exp(0.15));
    expect(document.body.style.zoom).toBeUndefined();
    cleanup();
    const later = new WheelEvent("wheel", { ctrlKey: true, cancelable: true });
    doc.dispatchEvent(later);
    expect(later.defaultPrevented).toBe(false);
  });

  it("keeps zoom bounded and catches zoom gestures on the surrounding preview", () => {
    expect(wheelResumeScale(1, -100000, 0)).toBe(4);
    expect(wheelResumeScale(1, 100000, 0)).toBe(1);
    const doc = document.implementation.createHTMLDocument("Resume");
    const host = document.createElement("div");
    const frame = document.createElement("iframe");
    const cleanup = bindResumeZoom(doc, frame, host);
    const event = new WheelEvent("wheel", { ctrlKey: true, deltaY: -100, cancelable: true });
    host.dispatchEvent(event);
    expect(event.defaultPrevented).toBe(true);
    expect(Number(doc.body.style.zoom)).toBeGreaterThan(1);
    cleanup();
  });

  it("zooms only the document for two fingers, but leaves one-finger scrolling native", () => {
    const doc = document.implementation.createHTMLDocument("Resume");
    const frame = document.createElement("iframe");
    const cleanup = bindResumeZoom(doc, frame, document.createElement("div"));
    const touch = (type: string, points: { clientX: number; clientY: number }[]) => {
      const event = new Event(type, { cancelable: true });
      Object.defineProperty(event, "touches", { value: points });
      doc.dispatchEvent(event);
      return event;
    };
    expect(touch("touchstart", [{ clientX: 10, clientY: 10 }]).defaultPrevented).toBe(false);
    touch("touchstart", [{ clientX: 0, clientY: 10 }, { clientX: 100, clientY: 10 }]);
    const move = touch("touchmove", [{ clientX: 0, clientY: 10 }, { clientX: 200, clientY: 10 }]);
    expect(move.defaultPrevented).toBe(true);
    expect(doc.body.style.zoom).toBe("2");
    cleanup();
  });
});