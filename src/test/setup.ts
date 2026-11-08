import { ByteLengthQueuingStrategy } from "node:stream/web";
import "@testing-library/jest-dom/vitest";

// Vitest's VM context omits the queue strategy used by TanStack's RPC decoder.
if (!("ByteLengthQueuingStrategy" in globalThis)) {
  Object.defineProperty(globalThis, "ByteLengthQueuingStrategy", {
    configurable: true,
    writable: true,
    value: ByteLengthQueuingStrategy,
  });
}

// jsdom exposes animation styles but no AnimationEvent; React otherwise
// listens for a vendor-prefixed event instead of the standard animationend.
if (!("AnimationEvent" in window)) {
  class TestAnimationEvent extends Event {
    readonly animationName: string;
    readonly elapsedTime: number;
    readonly pseudoElement: string;

    constructor(type: string, init: AnimationEventInit = {}) {
      super(type, init);
      this.animationName = init.animationName ?? "";
      this.elapsedTime = init.elapsedTime ?? 0;
      this.pseudoElement = init.pseudoElement ?? "";
    }
  }
  Object.defineProperty(window, "AnimationEvent", { value: TestAnimationEvent });
  Object.defineProperty(globalThis, "AnimationEvent", { value: TestAnimationEvent });
}

Object.defineProperty(window, "scrollTo", {
  writable: true,
  value: () => {},
});

Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => {},
  }),
});

// jsdom lacks IntersectionObserver; Motion's in-view reveals need a no-op stand-in.
if (!("IntersectionObserver" in window)) {
  class NoopIntersectionObserver {
    observe() {
      // no-op
    }
    unobserve() {
      // no-op
    }
    disconnect() {
      // no-op
    }
    takeRecords() {
      return [];
    }
  }
  Object.defineProperty(window, "IntersectionObserver", {
    writable: true,
    value: NoopIntersectionObserver,
  });
  Object.defineProperty(globalThis, "IntersectionObserver", {
    writable: true,
    value: NoopIntersectionObserver,
  });
}

// jsdom lacks ResizeObserver (used by cmdk).
if (!("ResizeObserver" in globalThis)) {
  (globalThis as any).ResizeObserver = class {
    observe() {
      // no-op
    }
    unobserve() {
      // no-op
    }
    disconnect() {
      // no-op
    }
  };
}

// jsdom lacks the Pointer Capture API that Radix Select uses on its trigger,
// and lacks Element.scrollIntoView (Radix keeps highlighted items in view with it).
const elementProto = Element.prototype as any;
if (!elementProto.hasPointerCapture) {
  elementProto.hasPointerCapture = () => false;
  elementProto.setPointerCapture = () => {};
  elementProto.releasePointerCapture = () => {};
}
if (!elementProto.scrollIntoView) {
  elementProto.scrollIntoView = () => {};
}
