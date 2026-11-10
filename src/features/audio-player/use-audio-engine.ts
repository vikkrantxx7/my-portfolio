import { useCallback, useEffect, useRef, useSyncExternalStore } from "react";
import { type AudioEngine, type AudioState, createAudioEngine } from "./audio-engine";

const IDLE: AudioState = { isPlaying: false, isLoading: false, ended: false, error: false };

/** Creates the engine once after hydration; render state updates only on media events. */
export function useAudioEngine(src: string) {
  const ref = useRef<AudioEngine | null>(null);
  const get = useCallback(() => {
    if (!ref.current && typeof window !== "undefined") ref.current = createAudioEngine(src);
    return ref.current;
  }, [src]);
  const state = useSyncExternalStore(
    (fn) => get()?.subscribe(fn) ?? (() => {}),
    () => ref.current?.state ?? IDLE,
    () => IDLE,
  );
  useEffect(
    () => () => {
      const a = ref.current?.audio;
      if (a && !a.paused) a.pause();
    },
    [],
  );
  return { engine: get, state };
}
