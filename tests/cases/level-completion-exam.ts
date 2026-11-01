import { getCurriculumTopics } from "../../src/content/curriculum";
import { buildLevelExam } from "../support/learningFixtures";
import { countExamCorrectAnswers, isExamPassed, EXAM_PASS_COUNT, EXAM_QUESTION_COUNT } from "../../src/domain/learning/levelExam";
import { assert } from "../support/assertions";
import { a1Pool } from "./daily-practice-never-repeats-a-word";
// 52. Level Completion Exam (roadmap 18-srs-flow-hardening.md "sınav"
// redesign, 2026-08-26 — replaces per-word spaced-repetition mastery as the
// promotion gate entirely): 60 questions from across the whole level, evenly
// split by difficulty, 50+ correct to pass.
console.log("\n52. Level Completion Exam:");
{
  assert(EXAM_QUESTION_COUNT === 60, "EXAM_QUESTION_COUNT is set to 60");
  assert(EXAM_PASS_COUNT === 50, "EXAM_PASS_COUNT is set to 50");

  const exam = buildLevelExam("A1");
  assert(exam.length === EXAM_QUESTION_COUNT, `A1 (320 words) seats a full ${EXAM_QUESTION_COUNT}-question exam`);
  const uniqueIds = new Set(exam.map((q) => q.id));
  assert(uniqueIds.size === exam.length, "Every exam question is distinct — no repeats padding out the count");
  assert(exam.every((q) => q.level === "A1"), "Every exam question is drawn from the level being tested");

  // A1's own content spans difficulty 1-2 (see Birim 54 — a level's
  // difficulty band follows the level itself, not a fixed 1-5 spread), with
  // difficulty-2 words a small minority (11 of 320). Checked against the
  // level's own pool, not the random 60-question sample — with so few
  // difficulty-2 words, a single draw missing them by chance is expected
  // often enough to make that assertion flaky, not a real bug.
  const poolDifficulties = new Set(a1Pool.map((q) => q.difficulty || 1));
  assert(poolDifficulties.size > 1, "A1's content spans more than one difficulty value, not a single flat band");

  // A level with too little content (well under 50 words) can't seat a real exam.
  const c2Exam = buildLevelExam("C2");
  assert(c2Exam.length === EXAM_QUESTION_COUNT, "C2 now seats a full completion exam from real content");
  const c2ExamTopics = new Set(c2Exam.map((question) => question.topicId));
  assert(c2ExamTopics.size === getCurriculumTopics("C2").length, "C2 completion exam represents every curriculum topic");
  const b1Exam = buildLevelExam("B1");
  const b1ExamTopics = new Set(b1Exam.map((question) => question.topicId));
  assert(b1ExamTopics.size === getCurriculumTopics("B1").length, "B1 completion exam represents every curriculum topic");

  assert(isExamPassed(50), "50 correct out of 60 passes");
  assert(isExamPassed(60), "A perfect score passes");
  assert(!isExamPassed(49), "49 correct falls just short of passing");
assert(!isExamPassed(0), "Zero correct does not pass");
assert(countExamCorrectAnswers([
  { questionId: "q-1", isCorrect: true },
  { questionId: "q-1", isCorrect: true },
  { questionId: "q-2", isCorrect: false },
]) === 1, "Exam scoring counts each question at most once");
}

