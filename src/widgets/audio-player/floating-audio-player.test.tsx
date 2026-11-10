import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { createAudioEngine } from "@/features/audio-player/audio-engine";
import * as audioHook from "@/features/audio-player/use-audio-engine";
import { BAR_COUNT, FloatingAudioPlayer } from "./floating-audio-player";

describe("FloatingAudioPlayer", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders the artwork as a single play button with no other controls", () => {
    render(<FloatingAudioPlayer />);
    const buttons = within(screen.getByTestId("audio-player")).getAllByRole("button", {
      hidden: true,
    });
    expect(buttons).toHaveLength(1);
    expect(buttons[0]).toHaveClass("size-15");
    expect(buttons[0]).not.toHaveClass("md:size-24");
    expect(screen.getByLabelText("Play From URL to Pixels")).toBeInTheDocument();
  });

  it("describes the song artwork without changing the play button label", () => {
    render(<FloatingAudioPlayer />);
    expect(screen.getByAltText("Cover artwork for From URL to Pixels")).toHaveAttribute(
      "alt",
      "Cover artwork for From URL to Pixels",
    );
    expect(screen.getByLabelText("Play From URL to Pixels")).toBeInTheDocument();
  });

  it("places decorative radial bars around the artwork inside the play button", () => {
    render(<FloatingAudioPlayer />);
    const wave = screen.getByTestId("audio-wave");
    expect(wave.children).toHaveLength(BAR_COUNT);
    expect(wave.closest("button")).toBe(screen.getByLabelText("Play From URL to Pixels"));
    expect(wave.closest("svg")).toHaveAttribute("aria-hidden", "true");
    const bars = wave.querySelectorAll("line");
    expect(bars).toHaveLength(BAR_COUNT);
    expect(bars[0]).toHaveAttribute("y1", "11");
    expect(wave.children[0]).toHaveAttribute("transform", "rotate(0 50 50)");
    expect(wave.children[BAR_COUNT / 2]).toHaveAttribute("transform", "rotate(180 50 50)");
  });

  it("makes no audio request before interaction", () => {
    render(<FloatingAudioPlayer />);
    expect(document.querySelector("audio[src]")).toBeNull();
    expect(screen.getByLabelText("Song progress")).toBeDisabled();
  });

  it("seeks through the progress head without toggling playback", () => {
    const engine = createAudioEngine("/track.mp3");
    Object.defineProperty(engine.audio, "duration", { configurable: true, value: 200 });
    vi.spyOn(audioHook, "useAudioEngine").mockReturnValue({
      engine: () => engine,
      state: engine.state,
    });
    const toggle = vi.spyOn(engine, "toggle");
    render(<FloatingAudioPlayer />);
    const slider = screen.getByLabelText("Song progress");
    expect(slider.closest("button")).toBeNull();
    expect(slider).toBeEnabled();
    fireEvent.change(slider, { target: { value: "25" } });
    expect(engine.audio.currentTime).toBe(50);
    expect(slider).toHaveAttribute("aria-valuetext", "25%");
    act(() => {
      engine.audio.dispatchEvent(new Event("ended"));
      engine.audio.dispatchEvent(new Event("seeking"));
      engine.audio.dispatchEvent(new Event("timeupdate"));
    });
    expect(engine.state.ended).toBe(false);
    expect(slider).toHaveAttribute("aria-valuetext", "25%");
    expect(toggle).not.toHaveBeenCalled();
  });

  it("drags the head clockwise around the ring with pointer capture", () => {
    const engine = createAudioEngine("/track.mp3");
    Object.defineProperty(engine.audio, "duration", { configurable: true, value: 200 });
    vi.spyOn(audioHook, "useAudioEngine").mockReturnValue({
      engine: () => engine,
      state: engine.state,
    });
    const toggle = vi.spyOn(engine, "toggle");
    render(<FloatingAudioPlayer />);
    const art = screen.getByLabelText("Play From URL to Pixels");
    vi.spyOn(art, "getBoundingClientRect").mockReturnValue({
      x: 0,
      y: 0,
      left: 0,
      top: 0,
      right: 100,
      bottom: 100,
      width: 100,
      height: 100,
      toJSON: () => ({}),
    });
    const slider = screen.getByLabelText("Song progress");
    const pointer = (type: string, x: number, y: number) => {
      const event = new Event(type, { bubbles: true, cancelable: true });
      Object.defineProperties(event, {
        pointerId: { value: 1 },
        pointerType: { value: "touch" },
        button: { value: 0 },
        clientX: { value: x },
        clientY: { value: y },
      });
      fireEvent(slider, event);
    };
    pointer("pointerdown", 50, 16);
    pointer("pointermove", 84, 50);
    expect(engine.audio.currentTime).toBeCloseTo(50);
    pointer("pointerup", 50, 84);
    expect(engine.audio.currentTime).toBeCloseTo(100);
    expect(slider).toHaveAttribute("aria-valuetext", "50%");
    pointer("pointermove", 16, 50);
    expect(engine.audio.currentTime).toBeCloseTo(100);
    expect(toggle).not.toHaveBeenCalled();
  });

  it("extends radial bars from audio frequencies and settles them when paused", () => {
    const engine = createAudioEngine("/track.mp3");
    const getEngine = () => engine;
    vi.spyOn(audioHook, "useAudioEngine").mockReturnValue({
      engine: getEngine,
      state: engine.state,
    });
    vi.spyOn(engine, "readFrequencies").mockReturnValue(new Uint8Array(1024).fill(255));
    vi.spyOn(engine, "frequencyBinWidth", "get").mockReturnValue(48000 / 2048);
    const frames: FrameRequestCallback[] = [];
    vi.spyOn(window, "requestAnimationFrame").mockImplementation((callback) => {
      frames.push(callback);
      return frames.length;
    });
    vi.spyOn(window, "cancelAnimationFrame").mockImplementation(() => {});
    render(<FloatingAudioPlayer />);
    const bar = screen.getByTestId("audio-wave").querySelector("line");
    const restingEnd = Number(bar?.getAttribute("y2"));
    act(() => {
      engine.audio.dispatchEvent(new Event("playing"));
      frames.pop()?.(0);
    });
    expect(engine.readFrequencies).toHaveBeenCalled();
    expect(Number(bar?.getAttribute("y2"))).toBeLessThan(restingEnd);
    act(() => {
      for (let i = 0; i < 6; i++) frames.pop()?.(i * 16);
    });
    // At the 60px rendered size, loud beats need at least 4px of visible travel.
    expect((restingEnd - Number(bar?.getAttribute("y2"))) * 0.6).toBeGreaterThanOrEqual(4);
    expect(Number(bar?.getAttribute("y2"))).toBeGreaterThanOrEqual(1);
    act(() => engine.audio.dispatchEvent(new Event("pause")));
    expect(Number(bar?.getAttribute("y2"))).toBeCloseTo(restingEnd, 2);
  });

  it("keeps the radial waveform static when reduced motion is requested", () => {
    const matchMedia = window.matchMedia;
    vi.spyOn(window, "matchMedia").mockImplementation((query) => ({
      ...matchMedia(query),
      matches: query === "(prefers-reduced-motion: reduce)",
    }));
    const engine = createAudioEngine("/track.mp3");
    engine.audio.dispatchEvent(new Event("playing"));
    vi.spyOn(audioHook, "useAudioEngine").mockReturnValue({
      engine: () => engine,
      state: engine.state,
    });
    const read = vi.spyOn(engine, "readFrequencies");
    const raf = vi.spyOn(window, "requestAnimationFrame");
    render(<FloatingAudioPlayer />);
    expect(read).not.toHaveBeenCalled();
    expect(raf).not.toHaveBeenCalled();
  });
});
