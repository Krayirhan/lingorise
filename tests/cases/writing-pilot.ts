import { B1_WRITING_TASKS } from "../../src/content/b1WritingPilot";
import { evaluateWriting, isWritingTaskReady, shouldOfferWriting, WritingTask } from "../../src/domain/learning/writing";
import { normalizeUserData } from "../../src/domain/user/normalization";
import { b1Questions } from "../../src/content/questions/b1";
import { assert } from "../support/assertions";
import { restoreSession } from "../../src/application/sessionRestoration";
import { createQuestionCatalogue } from "../../src/application/catalogue";
import { DEFAULT_USER_DATA } from "../../src/domain/user/normalization";

console.log("\nWriting pilot:");
const tasks = Object.values(B1_WRITING_TASKS);
assert(tasks.length === 20, "Pilot has exactly twenty tasks");
for (const task of tasks) {
  const q = b1Questions.find((item) => item.id === task.questionId);
  assert(Boolean(q && isWritingTaskReady(task, q.id, q.level, q.word)), `${task.questionId} is linked to the B1 catalogue`);
  const example = evaluateWriting(task, task.example);
  assert(example.target === "found" && example.enoughWords && example.punctuation, `${task.questionId} example satisfies its visible checks`);
}
const task = tasks[0];
const question = { id: task.questionId, level: "B1", word: task.target };
assert(shouldOfferWriting(task, question, "PRACTICE", true, false), "Correct B1 practice can offer writing");
assert(!shouldOfferWriting(task, question, "EXAM", true, false) && !shouldOfferWriting(task, question, "CHECKPOINT", true, false), "Exam and checkpoint do not offer writing");
assert(!shouldOfferWriting(task, question, "PRACTICE", false, false) && !shouldOfferWriting(task, question, "PRACTICE", true, true), "Wrong answers and already offered sessions do not offer writing");
assert(!isWritingTaskReady(task, task.questionId, "A2", task.target), "A2 does not offer writing");
assert(!isWritingTaskReady({ ...task, instruction: { ...task.instruction, tr: "" } }, task.questionId, "B1", task.target), "Missing localized instruction blocks writing");
const phraseTask: WritingTask = { ...task, target: "take part", acceptedForms: ["take part", "took part"], requiredPhrase: ["take part in"] };
assert(evaluateWriting(phraseTask, "I take part in the team.").phrase === "found", "A requested phrase is matched in order");
assert(evaluateWriting(phraseTask, "I take the team in part.").target === "unconfirmed", "Out-of-order multiword targets are not reported as recognized");
assert(evaluateWriting(phraseTask, "We took part in the event.").target === "found", "Explicitly approved inflections are recognized");
assert(!evaluateWriting(task, "We collaborate").enoughWords && !evaluateWriting(task, "We collaborate").punctuation, "Short text and missing punctuation are identified");
const restored = normalizeUserData({ activeSession: { questionIds: [task.questionId], currentIndex: 0, answers: [], sessionMode: "PRACTICE", startedAt: 1, writingOffer: { questionId: task.questionId, status: "done" } } });
assert(restored.activeSession?.writingOffer?.status === "done", "Writing offer status survives session normalization");
const sample = b1Questions.find((item) => item.id === task.questionId)!;
const reversed = normalizeUserData({ ...DEFAULT_USER_DATA, activeSession: { questionIds: [sample.id], currentIndex: 0, answers: [{ questionId: sample.id, isCorrect: true, xpEarned: 10 }], sessionMode: "PRACTICE", startedAt: 1, pickedAnswer: sample.word, submitted: true, reversedOptions: { [sample.id]: [sample.word, "other"] }, writingOffer: { questionId: sample.id, status: "open" } } });
const resumed = restoreSession(reversed, createQuestionCatalogue(b1Questions, "test"));
assert(resumed.questions[0]?.mode === "PICK_THE_WORD" && resumed.questions[0]?.meaning === sample.word && resumed.restored?.writingOffer?.status === "open", "Reversed question and open writing task survive session restoration");
