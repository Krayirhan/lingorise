import * as cataloguePolicy from "../domain/learning/cataloguePolicy";
import { enrichQuestionsWithCurriculum } from "../domain/learning/curriculum";
import { LevelCode, MeaningMatchQuestion } from "../domain/models/content";
export function createQuestionCatalogue(allQuestions: MeaningMatchQuestion[], contentVersion: string) {
  let activeQuestions: MeaningMatchQuestion[] = allQuestions;

  function setRuntimeQuestions(questions: MeaningMatchQuestion[]): void {
    if (questions.length === 0) {
      activeQuestions = allQuestions;
      return;
    }

    // Remote content overrides the matching bundled item. Keeping other bundled
    // levels available preserves overdue review sessions while only the active
    // level has been downloaded and cached for this launch.
    //
    // Teaching-enrichment fields (example sentences, hints, context notes, ...)
    // are backfilled from the bundled item when the remote one lacks them —
    // the published Firestore catalogue has lagged behind bundled content
    // enrichment before, and a thin remote row should never blank out a
    // hand-written example sentence that already ships in the app.
    const remoteById = new Map(questions.map((question) => [question.id, question]));
    const merged = allQuestions.map((question) => {
      const remote = remoteById.get(question.id);
      if (!remote) return question;
      return {
        ...remote,
        exampleSentence: remote.exampleSentence || question.exampleSentence,
        exampleTranslation: remote.exampleTranslation || question.exampleTranslation,
        contextNote: remote.contextNote || question.contextNote,
        hint: remote.hint || question.hint,
        phonetic: remote.phonetic || question.phonetic,
        pronunciation: remote.pronunciation || question.pronunciation,
        partOfSpeech: remote.partOfSpeech || question.partOfSpeech,
        cefr: remote.cefr || question.cefr,
        senseId: remote.senseId || question.senseId,
        learningItemKind: remote.learningItemKind || question.learningItemKind,
        register: remote.register || question.register,
        source: remote.source || question.source,
        reviewer: remote.reviewer || question.reviewer,
        reviewedAt: remote.reviewedAt || question.reviewedAt,
        editorialReview: remote.editorialReview || question.editorialReview,
        editorialStatus: remote.editorialStatus || question.editorialStatus,
      };
    });
    const remoteOnly = questions.filter((question) => !allQuestions.some((fallback) => fallback.id === question.id));
    activeQuestions = enrichQuestionsWithCurriculum([...merged, ...remoteOnly]);
  }

  function getAllQuestions(): MeaningMatchQuestion[] {
    return activeQuestions;
  }

  const questionsByLevel: Record<LevelCode, MeaningMatchQuestion[]> = {
    A1: allQuestions.filter((question) => question.level === "A1"),
    A2: allQuestions.filter((question) => question.level === "A2"),
    B1: allQuestions.filter((question) => question.level === "B1"),
    B2: allQuestions.filter((question) => question.level === "B2"),
    C1: allQuestions.filter((question) => question.level === "C1"),
    C2: allQuestions.filter((question) => question.level === "C2"),
  };

  // A curriculum migration changes the stable unit/lesson membership, so an
  // interrupted session created against the former positional units must be
  // rebuilt from the current catalogue on the next launch.
  // 2.3 quarantines B1–C2 from the remotely published catalogue until their
  // rewritten content has evidence-backed editorial approval.
  const CONTENT_VERSION = contentVersion;

  function getQuestionById(id: string): MeaningMatchQuestion | undefined {
    return activeQuestions.find((q) => q.id === id);
  }

  function findQuestionByWord(word: string): MeaningMatchQuestion | undefined {
    const norm = word.toLowerCase().trim();
    return activeQuestions.find(
      (q) =>
        (q.word && q.word.toLowerCase().trim() === norm) ||
        (q.prompt && q.prompt.toLowerCase().trim() === norm)
    );
  }

  function searchQuestions(query: string, level?: LevelCode): MeaningMatchQuestion[] {
    const norm = query.toLowerCase().trim();
    const pool = level ? getQuestionsByLevel(level) : activeQuestions;
    if (!norm) return pool;
    return pool.filter(
      (q) =>
        (q.word && q.word.toLowerCase().includes(norm)) ||
        (q.meaning && q.meaning.toLowerCase().includes(norm)) ||
        (q.prompt && q.prompt.toLowerCase().includes(norm)) ||
        (q.topic && q.topic.toLowerCase().includes(norm))
    );
  }

  function getQuestionsByLevel(level: LevelCode): MeaningMatchQuestion[] {
    const matches = activeQuestions.filter((question) => question.level === level);
    return matches.length > 0 ? matches : questionsByLevel[level] || questionsByLevel.A1;
  }

  const LEVEL_READY_MIN_QUESTIONS = cataloguePolicy.LEVEL_READY_MIN_QUESTIONS;
  function isLevelReady(level: LevelCode): boolean {
    return cataloguePolicy.isLevelReady(level, getQuestionsByLevel(level));
  }

  /** Editorial readiness is intentionally separate from whether a learner can enter a level. */
  function isLevelEditoriallyApproved(level: LevelCode): boolean {
    return cataloguePolicy.isLevelEditoriallyApproved(getQuestionsByLevel(level));
  }

  const getNextLevel = cataloguePolicy.getNextLevel;
  const getLevelOrder = cataloguePolicy.getLevelOrder;

  /** Where the learner stands inside the level: which unit, and how far into it. */
  function getLevelUnitInfo(level: LevelCode, solvedQuestionIds: string[]): cataloguePolicy.LevelUnitInfo {
    return cataloguePolicy.getLevelUnitInfo(level, getQuestionsByLevel(level), solvedQuestionIds);
  }

  /**
   * Detects whether `nextSolvedIds` just finished the unit `prevSolvedIds` was
   * still working through — the exact moment worth logging for roadmap Birim
   * 2's "days to finish a unit" signal. Checked against the SAME unit rather
   * than comparing getLevelUnitInfo's unitIndex before/after, because that
   * function falls back to the last unit's index once a level is fully
   * finished — a naive index comparison would miss a level's final unit.
   */
  function detectUnitJustCompleted(
    level: LevelCode,
    prevSolvedIds: string[],
    nextSolvedIds: string[]
  ): { unitIndex: number; wordsInUnit: number } | null {
    return cataloguePolicy.detectUnitJustCompleted(level, getQuestionsByLevel(level), prevSolvedIds, nextSolvedIds);
  }

  /** Returns the first unfinished unit for the current runtime catalogue. */
  function getCurrentLevelUnitQuestions(level: LevelCode, solvedQuestionIds: string[]): MeaningMatchQuestion[] {
    return getLevelUnitInfo(level, solvedQuestionIds).questions;
  }

  function getQuestionsByTopic(topic: string, level?: LevelCode): MeaningMatchQuestion[] {
    const pool = level ? getQuestionsByLevel(level) : activeQuestions;
    return pool.filter((q) => q.topic.toLowerCase() === topic.toLowerCase());
  }

  return { allQuestions, setRuntimeQuestions, getAllQuestions, questionsByLevel, CONTENT_VERSION, getQuestionById, findQuestionByWord, searchQuestions, getQuestionsByLevel, LEVEL_READY_MIN_QUESTIONS, isLevelReady, isLevelEditoriallyApproved, getNextLevel, getLevelOrder, getLevelUnitInfo, detectUnitJustCompleted, getCurrentLevelUnitQuestions, getQuestionsByTopic };
}
export type QuestionCatalogue = ReturnType<typeof createQuestionCatalogue>;
