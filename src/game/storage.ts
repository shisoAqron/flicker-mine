export function loadBestScore(): number {
  try {
    const stored = localStorage.getItem("flicker-mine-best-score");
    if (stored === null) return 0;
    const parsed = parseInt(stored, 10);
    return isNaN(parsed) ? 0 : parsed;
  } catch {
    return 0;
  }
}

export function saveBestScore(score: number): void {
  try {
    localStorage.setItem("flicker-mine-best-score", String(score));
  } catch {
    // localStorage unavailable — ignore
  }
}
