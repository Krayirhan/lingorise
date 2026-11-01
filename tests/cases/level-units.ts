import { tr } from "../../src/i18n/en";
import { getQuestionsByLevel, getLevelUnitInfo, getCurrentLevelUnitQuestions } from "../support/bundledCatalogue";
import { auditCurriculumLevel, getCurriculumTopics, getPendingTopicCheckpoint, getTopicProgressSummaries } from "../../src/content/curriculum";
import { buildTopicCheckpoint } from "../support/learningFixtures";
import { isTopicCheckpointPassed, TOPIC_CHECKPOINT_PASS_COUNT, TOPIC_CHECKPOINT_QUESTION_COUNT } from "../../src/domain/learning/topicCheckpoint";
import { assert } from "../support/assertions";

// 28. Units break the level into finishable chunks
console.log("\n28. Level Units:");
export const a1Total = getQuestionsByLevel("A1").length;
export const freshUnit = getLevelUnitInfo("A1", []);
assert(freshUnit.unitIndex === 0, "A new learner starts in the first unit");
assert(freshUnit.unitCount >= 16, `A1 is split into ${freshUnit.unitCount} semantic units`);
assert(freshUnit.questions.length <= 15, "A semantic unit never exceeds 15 words");
assert(new Set(freshUnit.questions.map((q) => q.topicId)).size === 1, "A semantic unit contains exactly one canonical topic");
assert(freshUnit.learnedInUnit === 0, "Nothing is learned in a fresh unit");

export const firstUnitIds = freshUnit.questions.map((q) => q.id);
export const midUnit = getLevelUnitInfo("A1", firstUnitIds.slice(0, 10));
assert(midUnit.unitIndex === 0, "A partly finished unit is still the current unit");
assert(midUnit.learnedInUnit === 10, "Progress inside the current unit is reported");

export const secondUnit = getLevelUnitInfo("A1", firstUnitIds);
assert(secondUnit.unitIndex === 1, "Finishing a unit advances to the next one");

// Publishing metadata is stamped rather than left blank
export const stampedQuestions = getQuestionsByLevel("A1");
assert(stampedQuestions.every((q) => !!q.unitId), "Every A1 question carries a unit id");
assert(stampedQuestions.every((q) => !!q.topicId && !!q.lessonId), "Every A1 question carries canonical topic and lesson ids");
assert(stampedQuestions.every((q) => q.status === "published"), "Every A1 question carries a publish status");
assert(Boolean(stampedQuestions[0]?.unitId?.startsWith("a1.")), "Unit ids are namespaced under their canonical topic");

export const a1Topics = getCurriculumTopics("A1");
export const a2Topics = getCurriculumTopics("A2");
assert(a1Topics.length === 8 && a2Topics.length === 7, "A1 and A2 each expose their authored canonical topic maps");
export const freshTopicProgress = getTopicProgressSummaries("A1", stampedQuestions, [], {}, "tr");
assert(freshTopicProgress[0].state === "available", "The first A1 topic is available to a new learner");
assert(freshTopicProgress.slice(1).every((topic) => topic.state === "locked"), "Later A1 topics are sequenced behind the first topic");
export const completedFirstTopicIds = stampedQuestions.filter((q) => q.topicId === freshTopicProgress[0].topicId).map((q) => q.id);
export const waitingForAssessment = getTopicProgressSummaries("A1", stampedQuestions, completedFirstTopicIds, {}, "tr");
assert(waitingForAssessment[0].state === "assessment_due", "A completed topic requires its short checkpoint before progression");
assert(getPendingTopicCheckpoint("A1", stampedQuestions, completedFirstTopicIds, {}, "tr")?.topicId === freshTopicProgress[0].topicId, "The completed topic is offered as the pending checkpoint");
export const unlockedTopicProgress = getTopicProgressSummaries("A1", stampedQuestions, completedFirstTopicIds, {}, "tr", {
  [freshTopicProgress[0].topicId]: { attempts: 1, bestScore: 8, passed: true },
});
assert(unlockedTopicProgress[1].state === "available", "Completing a topic unlocks the next topic");
assert(getCurrentLevelUnitQuestions("A1", []).every((q) => q.unitId === freshUnit.questions[0].unitId), "Daily practice uses the current semantic unit");

export const a1Audit = auditCurriculumLevel("A1", stampedQuestions);
export const a2Audit = auditCurriculumLevel("A2", getQuestionsByLevel("A2"));
export const b1Audit = auditCurriculumLevel("B1", getQuestionsByLevel("B1"));
export const b2Audit = auditCurriculumLevel("B2", getQuestionsByLevel("B2"));
assert([...a1Audit, ...a2Audit].every((topic) => topic.questionCount >= 30), "Every active A1/A2 topic has at least 30 authored items");
assert([...a1Audit, ...a2Audit].every((topic) => topic.unitCount >= 2 && topic.lessonCount >= 3), "Every active A1/A2 topic has multiple semantic units and lessons");
assert([...a1Audit, ...a2Audit].every((topic) => topic.missingRequiredMetadataIds.length === 0), "A1/A2 topic audit finds no missing teaching metadata");
assert(b1Audit.length === 4 && b1Audit.every((topic) => topic.questionCount === 30), "B1 has four balanced 30-item curriculum topics");
assert(b1Audit.every((topic) => topic.missingRequiredMetadataIds.length === 0), "B1 topic audit finds no missing teaching metadata");
assert(b2Audit.length === 3 && b2Audit.every((topic) => topic.questionCount === 36), "B2 has three balanced 36-item curriculum topics");
assert(b2Audit.every((topic) => topic.missingRequiredMetadataIds.length === 0), "B2 topic audit finds no missing teaching metadata");
export const peopleCheckpoint = buildTopicCheckpoint("A1", freshTopicProgress[0].topicId);
assert(peopleCheckpoint.length === TOPIC_CHECKPOINT_QUESTION_COUNT, "A topic checkpoint seats exactly 10 questions when the topic has enough content");
assert(peopleCheckpoint.every((question) => question.topicId === freshTopicProgress[0].topicId), "A topic checkpoint never leaks questions from another topic");
assert(isTopicCheckpointPassed(TOPIC_CHECKPOINT_PASS_COUNT), "Eight correct answers pass the topic checkpoint");
assert(!isTopicCheckpointPassed(TOPIC_CHECKPOINT_PASS_COUNT - 1), "Seven correct answers do not pass the topic checkpoint");

