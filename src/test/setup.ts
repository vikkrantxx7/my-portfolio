import "@testing-library/jest-dom/vitest";

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
    observe() {}
    unobserve() {}
    disconnect() {}
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
  // biome-ignore lint/suspicious/noExplicitAny: test stub
  (globalThis as any).ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
}

// jsdom lacks the Pointer Capture API that Radix Select uses on its trigger,
// and lacks Element.scrollIntoView (Radix keeps highlighted items in view with it).
// biome-ignore lint/suspicious/noExplicitAny: test stub
const elementProto = Element.prototype as any;
if (!elementProto.hasPointerCapture) {
  elementProto.hasPointerCapture = () => false;
  elementProto.setPointerCapture = () => {};
  elementProto.releasePointerCapture = () => {};
}
if (!elementProto.scrollIntoView) {
  elementProto.scrollIntoView = () => {};
}
