import { MeaningMatchQuestion } from "../models/content";

export interface CatalogueValidationResult {
  valid: boolean;
  duplicateIds: string[];
  invalidQuestions: string[];
}

/** Validates the minimum structural guarantees required by the bundled question dataset. */
export function validateQuestionCatalogue(questions: MeaningMatchQuestion[]): CatalogueValidationResult {
  const seenIds = new Set<string>();
  const duplicateIds: string[] = [];
  const invalidQuestions: string[] = [];

  for (const question of questions) {
    if (seenIds.has(question.id)) duplicateIds.push(question.id);
    seenIds.add(question.id);

    const answer = question.meaning || question.answer;
    const word = question.word || question.prompt;
    const options = question.options || [answer, ...question.wrongOptions];
    const hasLearningMetadata = Boolean(
      question.partOfSpeech && question.exampleSentence && question.exampleTranslation && question.contextNote && question.pronunciation && question.hint
    );

    if (!word || !answer || !options.includes(answer) || options.length < 2 || !hasLearningMetadata) {
      invalidQuestions.push(question.id);
    }
  }

  return { valid: duplicateIds.length === 0 && invalidQuestions.length === 0, duplicateIds, invalidQuestions };
}
