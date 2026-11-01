import { LevelCode, MeaningMatchQuestion } from "../../domain/models/content";
import { Copy } from "../../i18n/en";
import { formatTemplate } from "../../utils/formatters";
import { CollectedWord, SkillProgress } from "./home.types";

/** The vocabulary and listening skill rows of the Home view model. */
export function buildSkillProgress(copy: Copy["home"], level: LevelCode, solvedInLevel: number, vocabPercent: number): SkillProgress[] {
  const vocabMeta = solvedInLevel === 0
    ? `${level} · ${copy.vocabularyEmptyCta}`
    : formatTemplate(copy.vocabularyLearnedCount, { count: solvedInLevel });
  return [
    { id: "skill_vocab", title: copy.vocabulary, meta: vocabMeta, percent: vocabPercent, isReady: true, icon: "book-outline" },
    { id: "skill_listening", title: copy.listening, meta: copy.listeningMeta, percent: 0, isReady: false, icon: "headset-outline" },
  ];
}

/**
 * The newest learned words of the current level, newest first.
 * rewardedQuestionIds grows in the order words were learned, so its tail is
 * the newest; words from other levels are skipped.
 */
export function buildCollection(levelQuestions: MeaningMatchQuestion[], rewardedIds: string[], size: number): CollectedWord[] {
  const questionsById = new Map(levelQuestions.map((question) => [question.id, question]));
  const collection: CollectedWord[] = [];
  for (let i = rewardedIds.length - 1; i >= 0 && collection.length < size; i--) {
    const question = questionsById.get(rewardedIds[i]);
    if (!question) continue;
    collection.push({
      id: question.id,
      word: question.word || question.prompt || "",
      meaning: question.meaning || question.answer || "",
      level: question.level,
      topic: question.topic,
      phonetic: question.phonetic,
      pronunciation: question.pronunciation,
      exampleSentence: question.exampleSentence,
      exampleTranslation: question.exampleTranslation,
    });
  }
  return collection;
}
