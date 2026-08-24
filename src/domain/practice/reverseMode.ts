import { MeaningMatchQuestion } from "../../types/content";

/**
 * Turns a normal English-word→Turkish-meaning session into "Pick the Word":
 * the Turkish meaning is shown, and the learner picks the English word.
 *
 * No new content is needed — every field this reads already exists on the
 * question, and the decoy words are drawn from the other questions already
 * in the session. The word/meaning fields are swapped so the existing
 * MEANING_MATCH rendering and scoring pipeline (WordPrompt, AnswerList,
 * applyPracticeAnswer) handles it without any branching on question.mode.
 *
 * The question id is untouched, so mastery tracking for a word answered in
 * either direction accumulates on the same learningProgress entry.
 */
export function toPickTheWordSession(questions: MeaningMatchQuestion[]): MeaningMatchQuestion[] {
  const allWords = questions.map((q) => q.word || q.prompt || "").filter(Boolean);

  return questions.map((question) => {
    const correctWord = question.word || question.prompt || "";
    const correctMeaning = question.meaning || question.answer || "";

    const decoyPool = Array.from(new Set(allWords)).filter((w) => w !== correctWord);
    const decoys = [...decoyPool].sort(() => Math.random() - 0.5).slice(0, 2);

    return {
      ...question,
      mode: "PICK_THE_WORD" as const,
      word: correctMeaning,
      prompt: correctMeaning,
      meaning: correctWord,
      answer: correctWord,
      wrongOptions: decoys,
      options: [correctWord, ...decoys].sort(() => Math.random() - 0.5),
    };
  });
}

/** Pick the Word needs at least two other words in the session to draw decoys from. */
export function canUsePickTheWord(sessionSize: number): boolean {
  return sessionSize >= 3;
}
