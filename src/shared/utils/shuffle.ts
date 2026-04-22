/**
 * Deterministic shuffle — same seed produces same order.
 * Used for randomizing quiz options reproducibly.
 */
export function shuffle<T>(arr: readonly T[], seed: number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = (seed * (i + 1) * 9301 + 49297) % 233280;
    const k = Math.floor((j / 233280) * (i + 1));
    [a[i], a[k]] = [a[k], a[i]];
  }
  return a;
}

/**
 * Shuffle MCQ options and track where the correct answer moved.
 * Returns new options array and the new correct index.
 */
export function shuffleOptions(
  opts: readonly string[],
  correctIndex: number,
  seed: number,
): { opts: string[]; correctIndex: number } {
  const indices = opts.map((_, i) => i);
  const shuffled = shuffle(indices, seed);
  return {
    opts: shuffled.map((i) => opts[i]),
    correctIndex: shuffled.indexOf(correctIndex),
  };
}
