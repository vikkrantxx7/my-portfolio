import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { LONG_PRESS_MS, useSecondaryPress } from "./use-secondary-press";

function Harness({ onOpen, onPlay }: { onOpen: () => void; onPlay: () => void }) {
  const { shouldHandleClick, ...h } = useSecondaryPress(onOpen);
  return (
    <button type="button" {...h} onClick={() => shouldHandleClick() && onPlay()}>
      art
    </button>
  );
}

describe("useSecondaryPress", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());
  const setup = () => {
    const onOpen = vi.fn();
    const onPlay = vi.fn();
    render(<Harness onOpen={onOpen} onPlay={onPlay} />);
    return { onOpen, onPlay, btn: screen.getByRole("button") };
  };

  it("right-click opens without playing", () => {
    const { onOpen, onPlay, btn } = setup();
    fireEvent.contextMenu(btn);
    expect(onOpen).toHaveBeenCalledOnce();
    expect(onPlay).not.toHaveBeenCalled();
  });

  it("600ms touch long-press opens and swallows the following click", () => {
    const { onOpen, onPlay, btn } = setup();
    fireEvent.pointerDown(btn, { pointerType: "touch", clientX: 0, clientY: 0 });
    act(() => vi.advanceTimersByTime(LONG_PRESS_MS));
    fireEvent.pointerUp(btn);
    fireEvent.click(btn);
    expect(onOpen).toHaveBeenCalledOnce();
    expect(onPlay).not.toHaveBeenCalled();
  });

  it("a short tap still plays", () => {
    const { onOpen, onPlay, btn } = setup();
    fireEvent.pointerDown(btn, { pointerType: "touch" });
    act(() => vi.advanceTimersByTime(200));
    fireEvent.pointerUp(btn);
    fireEvent.click(btn);
    expect(onOpen).not.toHaveBeenCalled();
    expect(onPlay).toHaveBeenCalledOnce();
  });

  it("moving more than 10px cancels the long-press", () => {
    const { onOpen, btn } = setup();
    fireEvent.pointerDown(btn, { pointerType: "touch", clientX: 0, clientY: 0 });
    fireEvent.pointerMove(btn, { clientX: 20, clientY: 0 });
    act(() => vi.advanceTimersByTime(LONG_PRESS_MS));
    expect(onOpen).not.toHaveBeenCalled();
  });

  it("Shift+F10 opens", () => {
    const { onOpen, btn } = setup();
    fireEvent.keyDown(btn, { key: "F10", shiftKey: true });
    expect(onOpen).toHaveBeenCalledOnce();
  });
});
