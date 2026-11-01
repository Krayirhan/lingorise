import { allQuestions } from "../support/bundledCatalogue";
import { applyPracticeAnswer } from "../../src/domain/practice/answer";
import { summarizeMastery } from "../../src/domain/learning/mastery";
import { DEFAULT_USER_DATA } from "../../src/domain/user/normalization";
import { UserData } from "../../src/domain/models/user";
import { assert } from "../support/assertions";

// 24. Answering wires straight into the recall record
console.log("\n24. Answer -> Learning Record Wiring:");
export const learnQuestion = allQuestions[0];
export const learnCorrect = learnQuestion.meaning || learnQuestion.answer || "";
export let learnState: UserData = { ...DEFAULT_USER_DATA, xp: 0, learningProgress: {} };

learnState = applyPracticeAnswer(learnState, learnQuestion, learnCorrect, 10, "PRACTICE");
assert(learnState.learningProgress[learnQuestion.id]?.repetitions === 1, "A correct practice answer is recorded against the word");
assert(summarizeMastery(learnState.learningProgress, [learnQuestion.id]).masteredPercent === 0, "One correct answer does not move the mastery percentage");

learnState = applyPracticeAnswer(learnState, learnQuestion, "yanlış-cevap", 10, "PRACTICE");
assert(learnState.learningProgress[learnQuestion.id]?.wrongCount === 1, "A wrong answer is recorded against the word");
assert(learnState.learningProgress[learnQuestion.id]?.repetitions === 0, "A wrong answer resets the word's recall streak");

