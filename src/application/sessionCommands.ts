import { LevelCode, MeaningMatchQuestion } from "../domain/models/content";
import { canUsePickTheWord, toPickTheWordSession } from "../domain/practice/reverseMode";
import { createLearningCatalogue } from "./learningCatalogue";
import { RandomSource, TelemetryPort } from "./ports";
import { createSessionBuilder } from "./sessionBuilder";

export function createSessionCommands(
  builder: ReturnType<typeof createSessionBuilder>,
  learning: ReturnType<typeof createLearningCatalogue>,
  track: TelemetryPort["track"], random: RandomSource,
) {
  return {
    practice(user: Parameters<typeof builder.buildDailySession>[0], custom?: MeaningMatchQuestion[], reverse?: boolean) {
      let questions = custom && custom.length > 0 ? builder.withFreshDistractors(custom) : builder.buildDailySession(user);
      if (!questions.length) return null;
      if (!custom) track("practice_session_started", { freshCount: questions.length, reverseMode: Boolean(reverse) });
      if (reverse && canUsePickTheWord(questions.length)) questions = toPickTheWordSession(questions, random.next);
      return questions;
    },
    exam(level: LevelCode) {
      const questions = builder.withFreshDistractors(learning.buildLevelExam(level));
      if (!questions.length) return null;
      track("level_exam_started", { level, questionCount: questions.length });
      return questions;
    },
    checkpoint(level: LevelCode, topicId: string) {
      const questions = builder.withFreshDistractors(learning.buildTopicCheckpoint(level, topicId));
      if (!questions.length) return null;
      track("topic_checkpoint_started", { level, topicId, questionCount: questions.length });
      return questions;
    },
    complete(answers: Array<{ isCorrect: boolean }>, questionCount: number, sessionMode: string) {
      track("practice_session_completed", {
        questionsAnswered: answers.length, questionsTotal: questionCount,
        correctCount: answers.filter(answer => answer.isCorrect).length, sessionMode
      });
    },
  };
}
