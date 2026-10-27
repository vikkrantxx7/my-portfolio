const clampScale = (scale: number) => Math.max(1, Math.min(4, scale));

export function wheelResumeScale(scale: number, delta: number, mode: number) {
  const pixels = delta * (mode === 1 ? 16 : mode === 2 ? 100 : 1);
  return clampScale(scale * Math.exp(-pixels * 0.0015));
}

/** Native document zoom keeps text selectable and scrolling native inside the sandbox.
 * A transform wrapper cannot receive iframe gestures or resize its scrollable page. */
export function bindResumeZoom(doc: Document, frame: HTMLIFrameElement, host: HTMLElement) {
  let scale = 1;
  let pinch: { distance: number; scale: number } | undefined;
  const root = doc.documentElement;
  const scroller = doc.scrollingElement ?? root;
  const width = root.clientWidth;
  const zoom = (next: number, x: number, y: number) => {
    const previous = scale;
    const left = scroller.scrollLeft;
    const top = scroller.scrollTop;
    scale = clampScale(next);
    if (width) doc.body.style.width = `${width}px`;
    doc.body.style.zoom = String(scale);
    const ratio = scale / previous;
    scroller.scrollLeft = (left + x) * ratio - x;
    scroller.scrollTop = (top + y) * ratio - y;
  };
  const onWheel = (event: WheelEvent) => {
    if (!event.ctrlKey) return;
    event.preventDefault();
    const rect = frame.getBoundingClientRect();
    const inside = event.currentTarget === doc;
    zoom(
      wheelResumeScale(scale, event.deltaY, event.deltaMode),
      inside ? event.clientX : event.clientX - rect.left,
      inside ? event.clientY : event.clientY - rect.top,
    );
  };
  const onTouch = (event: TouchEvent) => {
    const first = event.touches[0];
    const second = event.touches[1];
    if (!first || !second) {
      pinch = undefined;
      return;
    }
    event.preventDefault();
    const distance = Math.hypot(second.clientX - first.clientX, second.clientY - first.clientY);
    if (!pinch) {
      pinch = { distance, scale };
      return;
    }
    if (!pinch.distance) return;
    zoom(
      (pinch.scale * distance) / pinch.distance,
      (first.clientX + second.clientX) / 2,
      (first.clientY + second.clientY) / 2,
    );
  };
  doc.addEventListener("wheel", onWheel, { passive: false });
  host.addEventListener("wheel", onWheel, { passive: false });
  doc.addEventListener("touchstart", onTouch, { passive: false });
  doc.addEventListener("touchmove", onTouch, { passive: false });
  doc.addEventListener("touchend", onTouch);
  doc.addEventListener("touchcancel", onTouch);
  return () => {
    doc.removeEventListener("wheel", onWheel);
    host.removeEventListener("wheel", onWheel);
    doc.removeEventListener("touchstart", onTouch);
    doc.removeEventListener("touchmove", onTouch);
    doc.removeEventListener("touchend", onTouch);
    doc.removeEventListener("touchcancel", onTouch);
  };
}
