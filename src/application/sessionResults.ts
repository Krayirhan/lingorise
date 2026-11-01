import { countExamCorrectAnswers, isExamPassed } from "../domain/learning/levelExam";
import { isTopicCheckpointPassed } from "../domain/learning/topicCheckpoint";
import { LevelCode, MeaningMatchQuestion } from "../domain/models/content";
import { TelemetryPort } from "./ports";

export interface CompletedSession {
  mode: "PRACTICE" | "EXAM" | "CHECKPOINT";
  completed: boolean;
  level: LevelCode;
  questions: MeaningMatchQuestion[];
  answers: Array<{ questionId: string; isCorrect: boolean }>;
}
export function createSessionResultRecorder(
  telemetry: TelemetryPort["track"],
  markLevelExamPassed: (level: LevelCode) => void,
  recordTopicAssessment: (topicId: string, correct: number, total: number) => void,
) {
  let examKey: string | null = null;
  let checkpointKey: string | null = null;
  return (session: CompletedSession) => {
    if (!session.completed) return;
    const questionKey = session.questions.map(question => question.id).join(",");
    if (!questionKey) return;
    const correctCount = countExamCorrectAnswers(session.answers);
    if (session.mode === "EXAM") {
      if (examKey === questionKey) return;
      examKey = questionKey;
      const passed = isExamPassed(correctCount);
      telemetry("level_exam_completed", { level: session.level, correctCount, totalCount: session.questions.length, passed });
      if (passed) markLevelExamPassed(session.level);
    }
    if (session.mode === "CHECKPOINT") {
      const topicId = session.questions[0]?.topicId;
      if (!topicId) return;
      const key = `${topicId}:${questionKey}`;
      if (checkpointKey === key) return;
      checkpointKey = key;
      const totalCount = session.questions.length;
      recordTopicAssessment(topicId, correctCount, totalCount);
      telemetry("topic_checkpoint_completed", { level: session.level, topicId, correctCount, totalCount, passed: isTopicCheckpointPassed(correctCount, totalCount) });
    }
  };
}
