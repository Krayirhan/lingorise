import { LevelCode, MeaningMatchQuestion } from "../models/content";
import { LearningItemProgress, TopicAssessmentProgress } from "../models/user";
import { A1_TOPICS, A2_TOPICS, B1_TOPICS, B2_TOPICS, C1_TOPICS, C2_TOPICS } from "./curriculumTopics";
import { CurriculumLesson, CurriculumTopic, CurriculumTopicAudit, CurriculumTopicState, CurriculumUnit, TopicProgressSummary } from "./curriculumTypes";
export type { CurriculumLesson, CurriculumTopic, CurriculumTopicAudit, CurriculumTopicState, CurriculumUnit, TopicProgressSummary } from "./curriculumTypes";

export const CURRICULUM_VERSION = "2.2.0";

export function getCurriculumTopics(level: LevelCode): CurriculumTopic[] {
  if (level === "A1") return A1_TOPICS;
  if (level === "A2") return A2_TOPICS;
  if (level === "B1") return B1_TOPICS;
  if (level === "B2") return B2_TOPICS;
  if (level === "C1") return C1_TOPICS;
  return C2_TOPICS;
}

export function getCurriculumTopic(topicId: string): CurriculumTopic | undefined {
  return [A1_TOPICS, A2_TOPICS, B1_TOPICS, B2_TOPICS, C1_TOPICS, C2_TOPICS]
    .flat()
    .find((topic) => topic.id === topicId);
}

function findTopic(level: LevelCode, legacyTopic: string): CurriculumTopic | undefined {
  return getCurriculumTopics(level).find((topic) => topic.legacyTopics.includes(legacyTopic));
}

/** Adds stable curriculum identifiers to bundled and remote A1/A2 content. */
export function enrichQuestionsWithCurriculum(questions: MeaningMatchQuestion[]): MeaningMatchQuestion[] {
  const positionByTopic = new Map<string, number>();
  return questions.map((question) => {
    const topic = findTopic(question.level, question.topic);
    if (!topic) return question;
    const position = positionByTopic.get(topic.id) || 0;
    positionByTopic.set(topic.id, position + 1);
    const unitNumber = Math.floor(position / 15) + 1;
    const lessonNumber = Math.floor(position / 10) + 1;
    return {
      ...question,
      topicId: topic.id,
      unitId: `${topic.id}.u${String(unitNumber).padStart(2, "0")}`,
      lessonId: `${topic.id}.l${String(lessonNumber).padStart(2, "0")}`,
      order: question.order ?? topic.order * 1000 + position,
      status: question.status ?? "published",
      // Existing catalogue rows are available to learners, but they are not
      // silently promoted to human-reviewed editorial content. New authoring
      // must explicitly set these fields through editorialQuality.ts.
      editorialStatus: question.editorialStatus ?? "needs_review",
    };
  });
}

export function getCurriculumUnits(level: LevelCode, questions: MeaningMatchQuestion[]): CurriculumUnit[] {
  const topicOrder = new Map(getCurriculumTopics(level).map((topic) => [topic.id, topic.order]));
  const groups = new Map<string, MeaningMatchQuestion[]>();
  questions.filter((question) => question.topicId && question.unitId).forEach((question) => {
    const group = groups.get(question.unitId!) || [];
    group.push(question);
    groups.set(question.unitId!, group);
  });
  return [...groups.entries()]
    .map(([id, items]) => ({
      id,
      topicId: items[0].topicId!,
      order: Math.min(...items.map((item) => item.order || 0)),
      titleTr: `Ünite ${id.split(".u")[1]}`,
      titleEn: `Unit ${id.split(".u")[1]}`,
      questionIds: items.sort((a, b) => (a.order || 0) - (b.order || 0)).map((item) => item.id),
    }))
    .sort((a, b) => (topicOrder.get(a.topicId) || Number.MAX_SAFE_INTEGER) - (topicOrder.get(b.topicId) || Number.MAX_SAFE_INTEGER) || a.order - b.order);
}

export function getCurriculumLessons(level: LevelCode, questions: MeaningMatchQuestion[]): CurriculumLesson[] {
  const groups = new Map<string, MeaningMatchQuestion[]>();
  questions.filter((question) => question.lessonId && question.unitId && question.topicId).forEach((question) => {
    const group = groups.get(question.lessonId!) || [];
    group.push(question);
    groups.set(question.lessonId!, group);
  });
  return [...groups.entries()]
    .map(([id, items]) => ({
      id,
      unitId: items[0].unitId!,
      topicId: items[0].topicId!,
      order: Math.min(...items.map((item) => item.order || 0)),
      titleTr: `Ders ${id.split(".l")[1]}`,
      titleEn: `Lesson ${id.split(".l")[1]}`,
      questionIds: items.sort((a, b) => (a.order || 0) - (b.order || 0)).map((item) => item.id),
    }))
    .sort((a, b) => a.order - b.order);
}

export function getTopicProgressSummaries(
  level: LevelCode,
  questions: MeaningMatchQuestion[],
  solvedIds: string[],
  learningProgress: Record<string, LearningItemProgress> | undefined,
  locale: "tr" | "en",
  topicAssessments: Record<string, TopicAssessmentProgress> | undefined = {}
): TopicProgressSummary[] {
  const solved = new Set(solvedIds);
  const topics = getCurriculumTopics(level);
  let previousCompleted = true;
  return topics.map((topic) => {
    const items = questions.filter((question) => question.topicId === topic.id);
    const seen = items.filter((item) => solved.has(item.id)).length;
    const reliable = items.filter((item) => learningProgress?.[item.id]?.status === "mastered").length;
    const assessmentPassed = Boolean(topicAssessments?.[topic.id]?.passed);
    const allItemsSeen = items.length > 0 && seen === items.length;
    const completed = allItemsSeen && assessmentPassed;
    const mastered = completed && reliable === items.length;
    const state: CurriculumTopicState = items.length === 0
      ? "locked"
      : mastered
        ? "mastered"
        : completed
          ? "completed"
          : allItemsSeen
            ? "assessment_due"
            : seen > 0
              ? "in_progress"
              : previousCompleted
                ? "available"
                : "locked";
    previousCompleted = completed;
    return {
      topicId: topic.id,
      title: locale === "tr" ? topic.titleTr : topic.titleEn,
      objective: locale === "tr" ? topic.objectiveTr : topic.objectiveEn,
      total: items.length,
      seen,
      reliable,
      assessmentPassed,
      state,
      percent: items.length ? Math.round((seen / items.length) * 100) : 0,
    };
  });
}

/** The first unfinished curriculum lesson, used by the primary learning CTA. */
export function getNextCurriculumLesson(
  level: LevelCode,
  questions: MeaningMatchQuestion[],
  solvedIds: string[],
  learningProgress?: Record<string, LearningItemProgress>,
  locale: "tr" | "en" = "tr",
  topicAssessments?: Record<string, TopicAssessmentProgress>
): CurriculumLesson | null {
  const solved = new Set(solvedIds);
  const openTopicIds = new Set(
    getTopicProgressSummaries(level, questions, solvedIds, learningProgress, locale, topicAssessments)
      .filter((topic) => topic.state === "available" || topic.state === "in_progress")
      .map((topic) => topic.topicId)
  );
  return getCurriculumLessons(level, questions).find(
    (lesson) => openTopicIds.has(lesson.topicId) && lesson.questionIds.some((id) => !solved.has(id))
  ) || null;
}

/** First fully-seen topic that still needs its short mastery checkpoint. */
export function getPendingTopicCheckpoint(
  level: LevelCode,
  questions: MeaningMatchQuestion[],
  solvedIds: string[],
  learningProgress?: Record<string, LearningItemProgress>,
  locale: "tr" | "en" = "tr",
  topicAssessments?: Record<string, TopicAssessmentProgress>
): TopicProgressSummary | null {
  return getTopicProgressSummaries(level, questions, solvedIds, learningProgress, locale, topicAssessments)
    .find((topic) => topic.state === "assessment_due") || null;
}

/** Content quality gate used by CI and editorial reviews for an authored level. */
export function auditCurriculumLevel(level: LevelCode, questions: MeaningMatchQuestion[]): CurriculumTopicAudit[] {
  return getCurriculumTopics(level).map((topic) => {
    const items = questions.filter((question) => question.topicId === topic.id);
    return {
      topicId: topic.id,
      questionCount: items.length,
      unitCount: new Set(items.map((question) => question.unitId)).size,
      lessonCount: new Set(items.map((question) => question.lessonId)).size,
      missingRequiredMetadataIds: items
        .filter((question) => !question.word || !question.meaning || !question.exampleSentence || !question.exampleTranslation || !question.hint || !question.pronunciation)
        .map((question) => question.id),
    };
  });
}
