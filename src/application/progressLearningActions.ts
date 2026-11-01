import { LevelCode, MeaningMatchQuestion } from "../domain/models/content";
import { ProductionAttempt, ProductionRubricResult } from "../domain/models/user";
import { bringForward } from "../domain/review/spacedRepetition";
import { ApplicationDependencies } from "./ports";
import { UpdateAndPersist } from "./progressActionTypes";

export function createProgressLearningActions(updateAndPersist: UpdateAndPersist, deps: Pick<ApplicationDependencies, "clock" | "random" | "telemetry">) {
  const completeOnboarding = () => {
    updateAndPersist(previous => ({ ...previous, onboardingCompleted: true }));
  };

  const markLevelExamPassed = (level: LevelCode) => {
    updateAndPersist(previous => previous.passedLevelExams.includes(level)
      ? previous
      : { ...previous, passedLevelExams: [...previous.passedLevelExams, level] });
  };

  const recordTopicAssessment = (topicId: string, correctCount: number, totalCount: number) => {
    const passed = totalCount > 0 && correctCount / totalCount >= 0.8;
    updateAndPersist(previous => {
      const priorAssessment = previous.topicAssessments?.[topicId];
      return {
        ...previous,
        topicAssessments: {
          ...(previous.topicAssessments || {}),
          [topicId]: {
            attempts: (priorAssessment?.attempts || 0) + 1,
            bestScore: Math.max(priorAssessment?.bestScore || 0, correctCount),
            passed: Boolean(priorAssessment?.passed) || passed,
            lastAttemptAt: deps.clock.wallNow(),
          },
        },
      };
    });
  };

  const recordProductionAttempt = (attempt: ProductionAttempt) => {
    updateAndPersist(previous => ({
      ...previous,
      productionAttempts: [...(previous.productionAttempts || []), attempt].slice(-500),
    }));
    deps.telemetry.track("production_attempt_recorded", {
      questionId: attempt.questionId,
      level: attempt.level,
      sessionMode: attempt.sessionMode,
      score: attempt.result.score,
      targetWordUsed: attempt.targetWordUsed,
      collocationAccurate: attempt.collocationAccurate,
    });
  };

  const recordProductionResponse = (question: MeaningMatchQuestion, sessionMode: ProductionAttempt["sessionMode"], response: string, result: ProductionRubricResult) => {
    const timestamp = deps.clock.wallNow();
    recordProductionAttempt({
      attemptId: `production-${timestamp}-${deps.random.next().toString(36).slice(2, 8)}`,
      questionId: question.id,
      level: question.level,
      sessionMode,
      response,
      result,
      targetWordUsed: result.targetUsed,
      collocationAccurate: result.collocationUsed,
      createdAt: timestamp,
    });
  };

  const bookmarkQuestion = (questionId: string) => {
    updateAndPersist(previous => {
      const item = previous.learningProgress?.[questionId];
      if (!item) return previous;
      return {
        ...previous,
        learningProgress: {
          ...previous.learningProgress,
          [questionId]: bringForward(item, deps.clock.now()),
        },
      };
    });
  };

  return { completeOnboarding, markLevelExamPassed, recordTopicAssessment, recordProductionAttempt, recordProductionResponse, bookmarkQuestion };
}
