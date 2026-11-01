import * as curriculum from "../domain/learning/curriculum";
import * as exam from "../domain/learning/levelExam";
import * as promotion from "../domain/learning/promotion";
import * as checkpoint from "../domain/learning/topicCheckpoint";
import { Locale } from "../domain/models/locale";
import { LevelCode } from "../domain/models/content";
import { LearningItemProgress, TopicAssessmentProgress } from "../domain/models/user";
import { QuestionCatalogue } from "./catalogue";
import { RandomSource } from "./ports";
export * from "../domain/learning/levelExam";
export * from "../domain/learning/promotion";
export * from "../domain/learning/topicCheckpoint";

export function createLearningCatalogue(catalogue: QuestionCatalogue, random: RandomSource = { next: Math.random }) {
  const { getQuestionsByLevel, getNextLevel, isLevelReady } = catalogue;
  const buildLevelExam = (level: LevelCode) => exam.buildLevelExam(getQuestionsByLevel(level), random.next);
  const isExamAvailable = (level: LevelCode) => exam.isExamAvailable(getQuestionsByLevel(level));
  const buildTopicCheckpoint = (level: LevelCode, topicId: string) => checkpoint.buildTopicCheckpoint(getQuestionsByLevel(level), topicId, random.next);
  function evaluatePromotion(level: LevelCode, passed: LevelCode[] = [], celebrated: string[] = []) {
    const next = getNextLevel(level);
    return promotion.evaluatePromotion(level, passed, celebrated, next, next ? isLevelReady(next) : false);
  }
  const assessLevelChoice = (target: LevelCode, current: LevelCode, passed: LevelCode[] = []) => promotion.assessLevelChoice(target, current, passed, isLevelReady(target));

  function getTopicProgressSummaries(
    level: LevelCode,
    solvedIds: string[],
    learningProgress: Record<string, LearningItemProgress> | undefined,
    locale: Locale,
    topicAssessments?: Record<string, TopicAssessmentProgress>
  ) {
    return curriculum.getTopicProgressSummaries(level, getQuestionsByLevel(level), solvedIds, learningProgress, locale, topicAssessments);
  }

  function getNextCurriculumLesson(
    level: LevelCode,
    solvedIds: string[],
    learningProgress: Record<string, LearningItemProgress> | undefined,
    locale: Locale,
    topicAssessments?: Record<string, TopicAssessmentProgress>
  ) {
    return curriculum.getNextCurriculumLesson(level, getQuestionsByLevel(level), solvedIds, learningProgress, locale, topicAssessments);
  }

  function getPendingTopicCheckpoint(
    level: LevelCode,
    solvedIds: string[],
    learningProgress: Record<string, LearningItemProgress> | undefined,
    locale: Locale,
    topicAssessments?: Record<string, TopicAssessmentProgress>
  ) {
    return curriculum.getPendingTopicCheckpoint(level, getQuestionsByLevel(level), solvedIds, learningProgress, locale, topicAssessments);
  }

  return {
    buildLevelExam,
    isExamAvailable,
    buildTopicCheckpoint,
    evaluatePromotion,
    assessLevelChoice,
    getTopicProgressSummaries,
    getNextCurriculumLesson,
    getPendingTopicCheckpoint,
  };
}
