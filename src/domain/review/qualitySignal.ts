export type InferredQuality = 0 | 1 | 2 | 3 | 4 | 5;

/**
 * Roadmap Birim 3 §3.1 — infers an SM-2-style 0-5 quality signal from data
 * already being collected, without asking the learner a new question. This
 * is deliberately NOT wired into scheduleNextReview yet: §3.2 (using it to
 * actually drive the ease-factor formula) is deferred to S12, pending at
 * least 2 weeks of real usage data per §3.4 so the switch can be judged
 * against the current binary model rather than guessed at. For now this
 * only makes the signal measurable via telemetry.
 *
 * - Wrong answers score 0 (no hint) or 1 (used a hint but still missed) —
 *   the current binary model already treats every wrong answer the same
 *   way (resets the streak, shortens the interval), so this is purely
 *   observational for now.
 * - A hint or an earlier wrong attempt on the same question caps quality at
 *   3 even if the final answer was correct — it wasn't a clean recall.
 * - A clean, fast correct answer scores 5; clean but slow scores 4; still
 *   correct but slower still scores 3.
 */
export function inferQuality(
  responseTimeMs: number,
  usedHint: boolean,
  isCorrect: boolean,
  attemptNumber: number = 1
): InferredQuality {
  if (!isCorrect) return usedHint ? 1 : 0;
  if (usedHint || attemptNumber > 1) return 3;
  if (responseTimeMs < 3000) return 5;
  if (responseTimeMs < 8000) return 4;
  return 3;
}
