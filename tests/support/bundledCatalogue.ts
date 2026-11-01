import { createQuestionCatalogue } from "../../src/application/catalogue";
import { allQuestions, CONTENT_UNIT_SIZE, CONTENT_VERSION } from "../../src/content/questions";
import { validateQuestionCatalogue } from "../../src/domain/editorial/catalogueValidation";

const catalogue = createQuestionCatalogue(allQuestions, CONTENT_VERSION);

export { allQuestions, CONTENT_UNIT_SIZE, CONTENT_VERSION };
export const validateQuestionDatabase = () => validateQuestionCatalogue(allQuestions);
export const {
  getAllQuestions,
  questionsByLevel,
  getQuestionById,
  findQuestionByWord,
  searchQuestions,
  getQuestionsByLevel,
  LEVEL_READY_MIN_QUESTIONS,
  isLevelReady,
  isLevelEditoriallyApproved,
  getNextLevel,
  getLevelOrder,
  getLevelUnitInfo,
  detectUnitJustCompleted,
  getCurrentLevelUnitQuestions,
  getQuestionsByTopic,
} = catalogue;

export type LevelUnitInfo = ReturnType<typeof catalogue.getLevelUnitInfo>;
