import { DEFAULT_USER_DATA, normalizeUserData } from "../../src/domain/user/normalization";
import { UserData } from "../../src/domain/models/user";
import { assert } from "../support/assertions";

// 17. Practice session persistence schema
console.log("\n17. Practice Session Resume Schema:");
export const activeSession = {
  questionIds: ["a1-mm-01", "a1-mm-02"],
  currentIndex: 1,
  answers: [{ questionId: "a1-mm-01", isCorrect: true, xpEarned: 10 }],
  sessionMode: "PRACTICE" as const,
  startedAt: Date.now(),
};
export const resumableUser: UserData = { ...DEFAULT_USER_DATA, activeSession };
assert(resumableUser.activeSession?.questionIds.length === 2, "Active practice question IDs are persistable");
assert(resumableUser.activeSession?.currentIndex === 1, "Active practice cursor is persistable");
assert(resumableUser.activeSession?.answers.length === 1, "Active practice answers are persistable");
export const answeredExamSession = {
  ...activeSession,
  sessionId: "exam-session-001",
  sessionMode: "EXAM" as const,
  pickedAnswer: "sessiz",
  submitted: true,
};
export const resumableAnsweredExam: UserData = { ...DEFAULT_USER_DATA, activeSession: answeredExamSession };
assert(resumableAnsweredExam.activeSession?.pickedAnswer === "sessiz", "Answered session preserves the selected answer across restart");
assert(resumableAnsweredExam.activeSession?.submitted === true, "Answered session preserves submitted state across restart");
assert(resumableAnsweredExam.activeSession?.sessionId === "exam-session-001", "Active session preserves its stable idempotency identifier across restart");
export const normalizedBrokenSession = normalizeUserData({
  ...DEFAULT_USER_DATA,
  activeSession: {
    questionIds: ["q-1"],
    currentIndex: 99,
    answers: [{ questionId: "q-1", isCorrect: true, xpEarned: -10 }],
    sessionMode: "EXAM",
    startedAt: Number.NaN,
  } as any,
});
assert(normalizedBrokenSession.activeSession?.currentIndex === 0, "Corrupt active-session cursor is clamped during migration");
assert(normalizedBrokenSession.activeSession?.answers[0]?.xpEarned === 0, "Corrupt active-session XP is sanitized during migration");

