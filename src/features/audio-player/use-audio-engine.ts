import { useEffect, useRef, useSyncExternalStore } from "react";
import { AudioEngine, type AudioState } from "./audio-engine";

const IDLE: AudioState = { isPlaying: false, isLoading: false, ended: false, error: false };

/** Creates the engine once after hydration; render state updates only on media events. */
export function useAudioEngine(src: string) {
  const ref = useRef<AudioEngine | null>(null);
  const get = () => {
    if (!ref.current && typeof window !== "undefined") ref.current = new AudioEngine(src);
    return ref.current;
  };
  const state = useSyncExternalStore(
    (fn) => get()?.subscribe(fn) ?? (() => {}),
    () => ref.current?.state ?? IDLE,
    () => IDLE,
  );
  useEffect(
    () => () => {
      ref.current?.audio.pause();
    },
    [],
  );
  return { engine: get, state };
}
