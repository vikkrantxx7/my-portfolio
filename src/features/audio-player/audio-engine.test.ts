import { describe, expect, it, vi } from "vitest";
import { createAudioEngine } from "./audio-engine";

function fakeAudio() {
  const audio = document.createElement("audio");
  let paused = true;
  Object.defineProperty(audio, "paused", { get: () => paused });
  audio.play = vi.fn(async () => {
    paused = false;
    audio.dispatchEvent(new Event("playing"));
  });
  audio.pause = vi.fn(() => {
    paused = true;
    audio.dispatchEvent(new Event("pause"));
  });
  return audio;
}

function fakeContext() {
  const analyser = {
    fftSize: 0,
    smoothingTimeConstant: 0,
    get frequencyBinCount() {
      return this.fftSize / 2;
    },
    connect: vi.fn(),
    getByteFrequencyData: vi.fn(),
  };
  const source = { connect: vi.fn() };
  const ctx = {
    state: "suspended",
    sampleRate: 48000,
    destination: {},
    resume: vi.fn(async () => {
      ctx.state = "running";
    }),
    createAnalyser: vi.fn(() => analyser),
    createMediaElementSource: vi.fn(() => source),
  };
  return { ctx, analyser, source };
}

const SRC = "https://example.test/song.mp3";

describe("createAudioEngine", () => {
  it("keeps live state snapshots and supports detached methods", async () => {
    const audio = fakeAudio();
    const engine = createAudioEngine(SRC, { audio, createContext: () => null });
    const initial = engine.state;
    const { subscribe, toggle, progress, pause } = engine;
    const listener = vi.fn();
    const unsubscribe = subscribe(listener);
    expect(engine.state).toBe(initial);
    await toggle();
    expect(engine.state).not.toBe(initial);
    expect(engine.state.isPlaying).toBe(true);
    expect(listener).toHaveBeenCalled();
    expect(progress()).toBe(0);
    unsubscribe();
    listener.mockClear();
    pause();
    expect(engine.state.isPlaying).toBe(false);
    expect(listener).not.toHaveBeenCalled();
  });

  it("does not assign a source or preload before interaction", () => {
    const audio = fakeAudio();
    createAudioEngine(SRC, { audio, createContext: () => fakeContext().ctx as never });
    expect(audio.getAttribute("src")).toBeNull();
    expect(audio.preload).toBe("none");
  });

  it("assigns the source lazily on first play and resumes a suspended context", async () => {
    const audio = fakeAudio();
    const { ctx } = fakeContext();
    const engine = createAudioEngine(SRC, { audio, createContext: () => ctx as never });
    await engine.toggle();
    expect(audio.getAttribute("src")).toBe(SRC);
    expect(ctx.resume).toHaveBeenCalled();
    expect(engine.state.isPlaying).toBe(true);
  });

  it("creates the analyser graph once across repeated plays and routes to the speakers", async () => {
    const audio = fakeAudio();
    const { ctx, analyser, source } = fakeContext();
    const createContext = vi.fn(() => ctx as never);
    const engine = createAudioEngine(SRC, { audio, createContext });
    await engine.toggle();
    await engine.toggle();
    await engine.toggle();
    expect(createContext).toHaveBeenCalledTimes(1);
    expect(ctx.createMediaElementSource).toHaveBeenCalledTimes(1);
    expect(source.connect).toHaveBeenCalledWith(analyser);
    expect(analyser.connect).toHaveBeenCalledWith(ctx.destination);
    expect(analyser.fftSize).toBe(2048);
    expect(analyser.smoothingTimeConstant).toBe(0.45);
    expect(engine.frequencyBinWidth).toBe(48000 / 2048);
    expect(engine.readFrequencies()).toHaveLength(1024);
  });

  it("pauses while keeping the current position", async () => {
    const audio = fakeAudio();
    const engine = createAudioEngine(SRC, {
      audio,
      createContext: () => fakeContext().ctx as never,
    });
    await engine.toggle();
    audio.currentTime = 42;
    await engine.toggle();
    expect(engine.state.isPlaying).toBe(false);
    expect(audio.currentTime).toBe(42);
  });

  it("restarts from the beginning when played after the song ended", async () => {
    const audio = fakeAudio();
    const engine = createAudioEngine(SRC, {
      audio,
      createContext: () => fakeContext().ctx as never,
    });
    await engine.toggle();
    Object.defineProperty(audio, "ended", { value: true, configurable: true });
    audio.currentTime = 200;
    audio.dispatchEvent(new Event("ended"));
    expect(engine.state.ended).toBe(true);
    await engine.toggle();
    expect(audio.currentTime).toBe(0);
  });

  it("surfaces a load error instead of throwing", async () => {
    const audio = fakeAudio();
    const engine = createAudioEngine(SRC, {
      audio,
      createContext: () => fakeContext().ctx as never,
    });
    await engine.toggle();
    audio.dispatchEvent(new Event("error"));
    expect(engine.state.error).toBe(true);
    expect(engine.state.isPlaying).toBe(false);
  });

  it("still plays when Web Audio is unavailable", async () => {
    const audio = fakeAudio();
    const engine = createAudioEngine(SRC, { audio, createContext: () => null });
    await engine.toggle();
    expect(engine.state.isPlaying).toBe(true);
    expect(engine.readFrequencies()).toBeNull();
  });
});
