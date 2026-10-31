import { calculateGardenProgress } from "../domain/gamification/xp";
import { deriveStatus, isLeech } from "../domain/learning/mastery";
import { MeaningMatchQuestion } from "../domain/models/content";
import { TelemetryEvent } from "../domain/models/telemetry";
import { UserData } from "../domain/models/user";
import { applyPracticeAnswer, PracticeSessionMode } from "../domain/practice/answer";
import { AnswerQualityMeta, inferQuality } from "../domain/review/qualitySignal";
import { QuestionCatalogue } from "./catalogue";
import { Clock, RandomSource } from "./ports";
export function createAnswerTransition(catalogue: QuestionCatalogue, clock: Clock, random: RandomSource) {
  const detectUnitJustCompleted = catalogue.detectUnitJustCompleted;
  return (prev: UserData, question: MeaningMatchQuestion, picked: string, xpReward: number, sessionMode: PracticeSessionMode, quality?: AnswerQualityMeta) => {
    const events: TelemetryEvent[] = [];
    function track<E extends TelemetryEvent>(name: E["name"], params: E["params"]) { events.push({ name, params } as TelemetryEvent); }
    const next = applyPracticeAnswer(prev, question, picked, xpReward, sessionMode, clock.now(), clock.todayISO(), random.next);
    const correctAnswer = question.meaning || question.answer;
    const isCorrect = picked === correctAnswer;

    const wasDue = Boolean(prev.learningProgress?.[question.id]?.attempts);
    const usedHint = xpReward < (question.xp || 10);
    track("question_answered", {
      questionId: question.id,
      isCorrect,
      isFirstEncounter: !prev.rewardedQuestionIds.includes(question.id),
      wasDue,
      usedHint,
      level: question.level,
      // roadmap Birim 3 §3.1 — observational only; not yet consumed by
      // scheduleNextReview (that's §3.2, deferred to S12).
      responseTimeMs: quality?.responseTimeMs ?? null,
      inferredQuality: quality
        ? inferQuality(quality.responseTimeMs, usedHint, isCorrect, quality.attemptNumber)
        : null,
    });

    const completedUnit = detectUnitJustCompleted(
      question.level,
      prev.solvedQuestionIds || [],
      next.solvedQuestionIds || []
    );
    if (completedUnit) {
      track("unit_completed", { level: question.level, ...completedUnit });
    }

    const prevItem = prev.learningProgress?.[question.id];
    const nextItem = next.learningProgress?.[question.id];
    if (nextItem) {
      const fromStatus = prevItem ? deriveStatus(prevItem) : "new";
      const toStatus = deriveStatus(nextItem);
      if (fromStatus !== toStatus) {
        track("word_mastery_changed", { fromStatus, toStatus, questionId: question.id });
      }

      const wasLeech = isLeech(prevItem);
      const nowLeech = isLeech(nextItem);
      if (!wasLeech && nowLeech) {
        track("word_marked_leech", {
          questionId: question.id,
          consecutiveWrongCount: nextItem.consecutiveWrongCount || 0,
        });
      }
    }

    // The garden grows with words genuinely learned (answered correctly
    // at least once), matching the exact metric useHomeViewModel.ts
    // renders — not a repetition-based mastery count, which would no
    // longer track real progress once daily practice never repeats a
    // word (roadmap 18-srs-flow-hardening.md "sınav" redesign).
    const fromStage = calculateGardenProgress((prev.rewardedQuestionIds || []).length).stage;
    const toStage = calculateGardenProgress((next.rewardedQuestionIds || []).length).stage;
    if (fromStage !== toStage) {
      track("garden_stage_changed", {
        fromStage,
        toStage,
        masteredWords: (next.rewardedQuestionIds || []).length,
      });
    }

    for (const quest of next.dailyQuests) {
      const prevQuest = prev.dailyQuests.find((q) => q.id === quest.id);
      if (quest.completed && prevQuest && !prevQuest.completed) {
        track("daily_quest_completed", { questId: quest.id, xpEarned: quest.xpReward });
      }
    }


    return { data: next, isCorrect, events };
  };
}
