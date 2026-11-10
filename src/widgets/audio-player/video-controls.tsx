import { Maximize, Minimize, Pause, Play, Volume2, VolumeX } from "lucide-react";
import { useVideoControls, type VideoControlsOptions } from "./use-video-controls";

function timestamp(seconds: number) {
  const total = Number.isFinite(seconds) ? Math.max(0, Math.floor(seconds)) : 0;
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, "0")}`;
}

export function VideoControls(props: Readonly<VideoControlsOptions>) {
  const {
    media: { playing, time, duration, volume, muted },
    fullscreen,
    error,
    touchVisible,
    togglePlayback,
    toggleFullscreen,
    seek,
    toggleMute,
    changeVolume,
  } = useVideoControls(props);

  return (
    <>
      <fieldset
        aria-label="Video controls"
        data-touch-visible={touchVisible}
        className="video-controls"
      >
        <button
          type="button"
          className="video-control-button"
          aria-label={playing ? "Pause video" : "Play video"}
          onClick={() => void togglePlayback()}
        >
          {playing ? <Pause aria-hidden /> : <Play aria-hidden />}
        </button>
        <span className="video-time">
          {timestamp(time)} / {timestamp(duration)}
        </span>
        <div className="video-seek">
          <div aria-hidden className="video-seek-track">
            <div
              className="video-seek-fill"
              style={{ width: `${duration > 0 ? Math.min(100, (time / duration) * 100) : 0}%` }}
            />
          </div>
          <input
            type="range"
            aria-label="Video progress"
            aria-valuetext={`${timestamp(time)} of ${timestamp(duration)}`}
            min={0}
            max={duration || 1}
            step={0.1}
            value={Math.min(time, duration)}
            disabled={duration <= 0}
            onChange={(event) => seek(Number(event.currentTarget.value))}
          />
        </div>
        <button
          type="button"
          className="video-control-button"
          aria-label={muted || volume === 0 ? "Unmute video" : "Mute video"}
          onClick={toggleMute}
        >
          {muted || volume === 0 ? <VolumeX aria-hidden /> : <Volume2 aria-hidden />}
        </button>
        <input
          className="video-volume"
          type="range"
          aria-label="Video volume"
          min={0}
          max={1}
          step={0.05}
          value={muted ? 0 : volume}
          onChange={(event) => changeVolume(Number(event.currentTarget.value))}
        />
        {fullscreen.supported && (
          <button
            type="button"
            className="video-control-button"
            aria-label={fullscreen.active ? "Exit fullscreen" : "Enter fullscreen"}
            onClick={() => void toggleFullscreen()}
          >
            {fullscreen.active ? <Minimize aria-hidden /> : <Maximize aria-hidden />}
          </button>
        )}
      </fieldset>
      {error && <output className="video-control-error">{error}</output>}
    </>
  );
}
