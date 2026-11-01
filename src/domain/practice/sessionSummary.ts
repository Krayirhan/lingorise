import { EXAM_PASS_COUNT, isExamPassed } from "../learning/levelExam";
import { isTopicCheckpointPassed, TOPIC_CHECKPOINT_PASS_COUNT } from "../learning/topicCheckpoint";

export function summarizeSession(
  mode: "PRACTICE" | "EXAM" | "CHECKPOINT",
  answers: ReadonlyArray<{ isCorrect: boolean; xpEarned: number }>,
  totalQuestions: number,
) {
  const correctCount = answers.filter(answer => answer.isCorrect).length;
  return {
    totalXpEarned: answers.reduce((total, answer) => total + answer.xpEarned, 0),
    totalQuestions: answers.length || totalQuestions,
    correctCount,
    mistakesCount: answers.filter(answer => !answer.isCorrect).length,
    examResult: mode === "EXAM" ? { passed: isExamPassed(correctCount), passCount: EXAM_PASS_COUNT } : undefined,
    checkpointResult: mode === "CHECKPOINT" ? { passed: isTopicCheckpointPassed(correctCount, totalQuestions), passCount: TOPIC_CHECKPOINT_PASS_COUNT } : undefined,
  };
}
