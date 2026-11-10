import { fireEvent, render, screen } from "@testing-library/react";
import { createRef } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { VideoPopup } from "./video-popup";

describe("VideoPopup", () => {
  beforeEach(() => {
    vi.spyOn(HTMLMediaElement.prototype, "play").mockResolvedValue();
    vi.spyOn(HTMLMediaElement.prototype, "pause").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  const props = {
    anchorRef: createRef<HTMLElement>(),
    engine: () => null,
    videoUrl: "/music-video.mp4",
    posterUrl: "/poster.webp",
    title: "Music",
    onOpenChange: vi.fn(),
  };

  it("uses the profile popup backdrop only while open and retains the video on close", () => {
    const { rerender } = render(<VideoPopup {...props} open={false} />);
    expect(screen.queryByTestId("video-backdrop")).not.toBeInTheDocument();

    rerender(<VideoPopup {...props} open />);
    expect(screen.getByTestId("video-backdrop")).toHaveClass(
      "fixed",
      "inset-0",
      "z-60",
      "bg-background/60",
      "backdrop-blur-md",
    );
    const video = screen.getByTestId("music-video");

    rerender(<VideoPopup {...props} open={false} />);
    expect(screen.queryByTestId("video-backdrop")).not.toBeInTheDocument();
    expect(screen.getByTestId("music-video")).toBe(video);
    expect(HTMLMediaElement.prototype.pause).toHaveBeenCalled();
  });

  it("hides native download controls and prevents the video context menu", () => {
    render(<VideoPopup {...props} open />);
    const video = screen.getByTestId("music-video");
    expect(video).not.toHaveAttribute("controls");
    expect(video).toHaveAttribute("controlslist", "nodownload");
    expect(fireEvent.contextMenu(video)).toBe(false);
  });

  it("retains the close control", () => {
    render(<VideoPopup {...props} open />);
    fireEvent.click(screen.getByRole("button", { name: "Close video" }));
    expect(props.onOpenChange).toHaveBeenCalledWith(false);
  });

  it("locks document scrolling only while open and restores existing styles", () => {
    document.documentElement.style.overflow = "auto";
    document.body.style.setProperty("overflow", "scroll", "important");
    try {
      const { rerender, unmount } = render(<VideoPopup {...props} open={false} />);
      expect(document.body.style.overflow).toBe("scroll");

      rerender(<VideoPopup {...props} open />);
      expect(document.documentElement.style.overflow).toBe("hidden");
      expect(document.body.style.overflow).toBe("hidden");

      rerender(<VideoPopup {...props} open={false} />);
      expect(document.documentElement.style.overflow).toBe("auto");
      expect(document.body.style.overflow).toBe("scroll");
      expect(document.body.style.getPropertyPriority("overflow")).toBe("important");

      rerender(<VideoPopup {...props} open />);
      unmount();
      expect(document.documentElement.style.overflow).toBe("auto");
      expect(document.body.style.overflow).toBe("scroll");
    } finally {
      document.documentElement.style.removeProperty("overflow");
      document.body.style.removeProperty("overflow");
    }
  });

  it("uses the Explore my work animated gradient frame", () => {
    render(<VideoPopup {...props} open />);
    expect(screen.getByTestId("video-frame")).toHaveClass("gradient-frame");
  });

  it("toggles controls on touch taps without toggling when a control is used", () => {
    const { rerender } = render(<VideoPopup {...props} open />);
    const controls = screen.getByRole("group", { name: "Video controls" });
    const video = screen.getByTestId("music-video");
    const tap = () => {
      const event = new Event("pointerup", { bubbles: true });
      Object.defineProperty(event, "pointerType", { value: "touch" });
      fireEvent(video, event);
    };
    expect(controls).toHaveAttribute("data-touch-visible", "false");
    tap();
    expect(controls).toHaveAttribute("data-touch-visible", "true");
    fireEvent.click(screen.getByRole("button", { name: "Mute video" }));
    expect(controls).toHaveAttribute("data-touch-visible", "true");
    tap();
    expect(controls).toHaveAttribute("data-touch-visible", "false");
    tap();
    rerender(<VideoPopup {...props} open={false} />);
    rerender(<VideoPopup {...props} open />);
    expect(controls).toHaveAttribute("data-touch-visible", "false");
  });

  it("provides themed playback, seek, and mute controls synced with the video", () => {
    render(<VideoPopup {...props} open />);
    const video = screen.getByTestId<HTMLVideoElement>("music-video");
    Object.defineProperty(video, "duration", { configurable: true, value: 208 });
    fireEvent.loadedMetadata(video);
    expect(screen.getByText("0:00 / 3:28")).toBeInTheDocument();
    fireEvent.change(screen.getByRole("slider", { name: "Video progress" }), {
      target: { value: "42" },
    });
    expect(video.currentTime).toBe(42);
    fireEvent.timeUpdate(video);
    expect(screen.getByText("0:42 / 3:28")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Mute video" }));
    expect(video.muted).toBe(true);
    fireEvent.volumeChange(video);
    expect(screen.getByRole("button", { name: "Unmute video" })).toBeInTheDocument();
    Object.defineProperty(video, "paused", { configurable: true, value: false });
    fireEvent.play(video);
    fireEvent.click(screen.getByRole("button", { name: "Pause video" }));
    expect(video.pause).toHaveBeenCalled();
  });

  it("reports playback failures and disables seeking before metadata loads", async () => {
    render(<VideoPopup {...props} open />);
    expect(screen.getByRole("slider", { name: "Video progress" })).toBeDisabled();
    vi.mocked(HTMLMediaElement.prototype.play).mockRejectedValueOnce(new Error("Playback"));
    fireEvent.click(screen.getByRole("button", { name: "Play video" }));
    expect(await screen.findByRole("status")).toHaveTextContent("Unable to play");
  });

  it("syncs volume changes and shows media loading errors", () => {
    render(<VideoPopup {...props} open />);
    const video = screen.getByTestId<HTMLVideoElement>("music-video");
    fireEvent.change(screen.getByRole("slider", { name: "Video volume" }), {
      target: { value: "0.35" },
    });
    expect(video.volume).toBe(0.35);
    expect(video.muted).toBe(false);
    video.muted = true;
    fireEvent.volumeChange(video);
    expect(screen.getByRole("slider", { name: "Video volume" })).toHaveValue("0");
    fireEvent.error(video);
    expect(screen.getByRole("status")).toHaveTextContent("Unable to load");
  });

  it("requests fullscreen for the entire frame, including custom controls", () => {
    const requestFullscreen = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(document, "fullscreenEnabled", {
      configurable: true,
      value: true,
    });
    Object.defineProperty(HTMLElement.prototype, "requestFullscreen", {
      configurable: true,
      value: requestFullscreen,
    });
    try {
      render(<VideoPopup {...props} open />);
      fireEvent.click(screen.getByRole("button", { name: "Enter fullscreen" }));
      expect(requestFullscreen).toHaveBeenCalled();
      expect(requestFullscreen.mock.contexts[0]).toBe(screen.getByTestId("video-frame"));
    } finally {
      Reflect.deleteProperty(document, "fullscreenEnabled");
      Reflect.deleteProperty(HTMLElement.prototype, "requestFullscreen");
    }
  });
});
