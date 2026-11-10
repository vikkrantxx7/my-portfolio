interface FrequencyBand {
  readonly start: number;
  readonly end: number;
}

export function logarithmicBands(
  binCount: number,
  binWidth: number,
  count: number,
): FrequencyBand[] {
  const maximum = Math.min(16000, binCount * binWidth);
  const minimum = Math.min(60, maximum);
  return Array.from({ length: count }, (_, i) => {
    const start = Math.min(
      binCount - 1,
      Math.floor((minimum * (maximum / minimum) ** (i / count)) / binWidth),
    );
    const end = Math.min(
      binCount,
      Math.max(
        start + 1,
        Math.ceil((minimum * (maximum / minimum) ** ((i + 1) / count)) / binWidth),
      ),
    );
    return { start, end };
  });
}

export function spectrumLevel(bins: Uint8Array, band: FrequencyBand): number {
  let sum = 0;
  for (let i = band.start; i < band.end; i++) sum += bins[i] ?? 0;
  // Byte magnitudes are already logarithmic; preserve contrast instead of boosting every band.
  return (sum / ((band.end - band.start) * 255)) ** 1.6;
}
