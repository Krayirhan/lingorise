import { MeaningMatchQuestion } from "../../types/content";

/**
 * Replaces a question's wrongOptions with a fresh random sample from a wider
 * meaning pool, drawn at session-build time rather than fixed once at
 * content-authoring time (roadmap Birim 10.1). Content used to pair "wife"
 * with the same two decoys ("öğretmen", "isim") in every single session —
 * a learner can memorize that pairing without ever reasoning about what
 * "wife" actually means. Sampling fresh decoys per session breaks that
 * shortcut without touching a single word of content.
 *
 * PICK_THE_WORD questions are left untouched — reverseMode.ts already draws
 * their decoys fresh from the session pool at build time, which is exactly
 * this same principle applied one sprint earlier.
 */
export function randomizeDistractors(
  question: MeaningMatchQuestion,
  levelPool: MeaningMatchQuestion[]
): MeaningMatchQuestion {
  if (question.mode === "PICK_THE_WORD") return question;

  const correctMeaning = question.meaning || question.answer || "";
  const count = question.wrongOptions?.length || 2;

  const candidatePool = Array.from(
    new Set(
      levelPool
        .map((q) => q.meaning || q.answer || "")
        .filter((meaning) => meaning && meaning !== correctMeaning)
    )
  );

  // Too little variety in the pool to safely resample — keep the authored
  // decoys rather than risk duplicates or an emptier-than-authored set.
  if (candidatePool.length < count) return question;

  const shuffled = [...candidatePool].sort(() => Math.random() - 0.5);
  return { ...question, wrongOptions: shuffled.slice(0, count), options: undefined };
}
