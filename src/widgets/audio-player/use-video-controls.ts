import { type RefObject, useEffect, useState } from "react";

export interface VideoControlsOptions {
  readonly open: boolean;
  readonly videoRef: RefObject<HTMLVideoElement | null>;
  readonly frameRef: RefObject<HTMLDivElement | null>;
}

interface MediaState {
  playing: boolean;
  time: number;
  duration: number;
  volume: number;
  muted: boolean;
}

interface FullscreenState {
  active: boolean;
  supported: boolean;
}

type FullscreenVideo = HTMLVideoElement & {
  webkitEnterFullscreen?: () => void;
};

function readMedia(video: HTMLVideoElement): MediaState {
  return {
    playing: !video.paused && !video.ended,
    time: Number.isFinite(video.currentTime) ? video.currentTime : 0,
    duration: Number.isFinite(video.duration) ? Math.max(0, video.duration) : 0,
    volume: video.volume,
    muted: video.muted,
  };
}

export function useVideoControls({ open, videoRef, frameRef }: VideoControlsOptions) {
  const [media, setMedia] = useState<MediaState>({
    playing: false,
    time: 0,
    duration: 0,
    volume: 1,
    muted: false,
  });
  const [fullscreen, setFullscreen] = useState<FullscreenState>({
    active: false,
    supported: false,
  });
  const [error, setError] = useState("");
  const [touchVisible, setTouchVisible] = useState(false);

  useEffect(() => {
    if (!open) setTouchVisible(false);
  }, [open]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const onTap = (event: PointerEvent) => {
      if (event.pointerType !== "touch") return;
      const focused = document.activeElement;
      if (focused instanceof HTMLElement && frameRef.current?.contains(focused)) {
        focused.blur();
      }
      setTouchVisible((visible) => !visible);
    };
    video.addEventListener("pointerup", onTap);
    return () => video.removeEventListener("pointerup", onTap);
  }, [videoRef, frameRef]);

  useEffect(() => {
    if (!open && document.fullscreenElement === frameRef.current) {
      void document.exitFullscreen().catch((cause: unknown) => {
        console.error("Unable to exit video fullscreen", cause);
        setError("Unable to exit fullscreen. Use your browser's fullscreen control.");
      });
    }
  }, [open, frameRef]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const sync = () => setMedia(readMedia(video));
    const onError = () => setError("Unable to load this video. Close and reopen to retry.");
    const onPlaying = () => setError("");
    const syncFullscreen = () =>
      setFullscreen({
        active: document.fullscreenElement === frameRef.current,
        supported:
          (document.fullscreenEnabled && !!frameRef.current?.requestFullscreen) ||
          typeof (video as FullscreenVideo).webkitEnterFullscreen === "function",
      });
    const events = [
      "play",
      "pause",
      "ended",
      "timeupdate",
      "durationchange",
      "loadedmetadata",
      "volumechange",
    ];
    for (const event of events) video.addEventListener(event, sync);
    video.addEventListener("error", onError);
    video.addEventListener("playing", onPlaying);
    document.addEventListener("fullscreenchange", syncFullscreen);
    sync();
    syncFullscreen();
    return () => {
      for (const event of events) video.removeEventListener(event, sync);
      video.removeEventListener("error", onError);
      video.removeEventListener("playing", onPlaying);
      document.removeEventListener("fullscreenchange", syncFullscreen);
    };
  }, [videoRef, frameRef]);

  const togglePlayback = async () => {
    const video = videoRef.current;
    if (!video) return;
    setError("");
    if (!video.paused && !video.ended) {
      video.pause();
      return;
    }
    try {
      await video.play();
    } catch {
      setError("Unable to play this video. Please try again.");
    }
  };

  const toggleFullscreen = async () => {
    const frame = frameRef.current;
    const video = videoRef.current as FullscreenVideo | null;
    if (!frame || !video) return;
    try {
      if (document.fullscreenElement === frame) await document.exitFullscreen();
      else if (document.fullscreenEnabled && frame.requestFullscreen)
        await frame.requestFullscreen();
      else if (video.webkitEnterFullscreen) video.webkitEnterFullscreen();
      else setError("Fullscreen is not supported in this browser.");
    } catch {
      setError("Unable to enter fullscreen. Please try again.");
    }
  };

  const seek = (time: number) => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = time;
    setMedia(readMedia(video));
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.muted || video.volume === 0) {
      video.muted = false;
      if (video.volume === 0) video.volume = 1;
    } else video.muted = true;
    setMedia(readMedia(video));
  };

  const changeVolume = (volume: number) => {
    const video = videoRef.current;
    if (!video) return;
    video.volume = volume;
    video.muted = false;
    setMedia(readMedia(video));
  };

  return {
    media,
    fullscreen,
    error,
    touchVisible,
    togglePlayback,
    toggleFullscreen,
    seek,
    toggleMute,
    changeVolume,
  };
}
