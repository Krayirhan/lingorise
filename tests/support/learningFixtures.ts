import { allQuestions, CONTENT_VERSION } from "../../src/content/questions";
import { createQuestionCatalogue } from "../../src/application/catalogue";
import { createSessionBuilder } from "../../src/application/sessionBuilder";
import { createLearningCatalogue } from "../../src/application/learningCatalogue";

const catalogue = createQuestionCatalogue(allQuestions, CONTENT_VERSION);
export const { buildDailySession, pickNewWords } = createSessionBuilder(catalogue, { next: Math.random });
export const { buildTopicCheckpoint, evaluatePromotion, assessLevelChoice, buildLevelExam, isExamAvailable } = createLearningCatalogue(catalogue);
export const DAY_MS = 24 * 60 * 60 * 1000;
