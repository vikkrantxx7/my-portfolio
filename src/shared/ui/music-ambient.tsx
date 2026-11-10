/** Purely decorative; the audio widget supplies shared CSS energy values. */
export function MusicAmbient({ kind }: { readonly kind: "header" | "dock" }) {
  return (
    <div
      aria-hidden="true"
      data-music-light={kind}
      className={`music-ambient music-ambient-${kind}`}
      onAnimationEnd={(event) => {
        if (event.animationName === "music-dock-start") {
          event.currentTarget.removeAttribute("data-music-start");
        }
      }}
    >
      <span className="music-wash music-wash-cyan" />
      <span className="music-wash music-wash-violet" />
      {kind === "header" && <span className="music-header-top-glow" />}
      <span className="music-activation" />
    </div>
  );
}
