import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { BAR_COUNT, FloatingAudioPlayer } from "./floating-audio-player";

describe("FloatingAudioPlayer", () => {
  it("renders the artwork as a single play button with no other controls", () => {
    render(<FloatingAudioPlayer />);
    expect(screen.getAllByRole("button")).toHaveLength(1);
    expect(screen.getByRole("button", { name: "Play From URL to Pixels" })).toBeInTheDocument();
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
