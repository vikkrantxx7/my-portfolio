import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { BAR_COUNT, FloatingAudioPlayer } from "./floating-audio-player";

describe("FloatingAudioPlayer", () => {
  it("renders the artwork as a single play button with no other controls", () => {
    render(<FloatingAudioPlayer />);
    const buttons = screen
      .getAllByRole("button", { hidden: true })
      .filter((b) => b.getAttribute("aria-label") !== "Close video");
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

  it("shows the waveform bars", () => {
    render(<FloatingAudioPlayer />);
    expect(screen.getByTestId("audio-wave").children).toHaveLength(BAR_COUNT);
  });

  it("makes no audio request before interaction", () => {
    render(<FloatingAudioPlayer />);
    expect(document.querySelector("audio[src]")).toBeNull();
  });
});
