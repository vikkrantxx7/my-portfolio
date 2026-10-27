import { useState } from "react";

/** Mounted with the menu: each opening owns one non-interactive border pulse. */
export function DockIgnition({ reducedMotion }: { reducedMotion: boolean }) {
  const [finished, setFinished] = useState(false);
  if (reducedMotion || finished) return null;

  return (
    <span
      aria-hidden="true"
      data-testid="dock-ignition"
      className="dock-ignition"
      onAnimationEnd={() => setFinished(true)}
    >
      <span className="dock-ignition-rim" />
    </span>
  );
}
