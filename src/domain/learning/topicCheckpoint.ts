import { MeaningMatchQuestion } from "../models/content";

export const TOPIC_CHECKPOINT_QUESTION_COUNT = 10;
export const TOPIC_CHECKPOINT_PASS_COUNT = 8;

function shuffle<T>(items: T[], random: () => number): T[] {
  const output = [...items];
  for (let index = output.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [output[index], output[swapIndex]] = [output[swapIndex], output[index]];
  }
  return output;
}

function withProductionTask(question: MeaningMatchQuestion): MeaningMatchQuestion {
  return {
    ...question,
    collocation: question.collocation || question.word,
    productionPrompt: question.productionPrompt || "Use the target word in a short sentence about this topic.",
  };
}

/**
 * Creates a short, mixed-difficulty check for one canonical topic. The
 * selection never leaves the topic and never pads a thin source with copies.
 */
export function buildTopicCheckpoint(questions: MeaningMatchQuestion[], topicId: string, random: () => number = Math.random): MeaningMatchQuestion[] {
  const pool = questions.filter((question) => question.topicId === topicId);
  const easy = shuffle(pool.filter((question) => (question.difficulty || 1) <= 2), random).slice(0, 4);
  const medium = shuffle(pool.filter((question) => question.difficulty === 3), random).slice(0, 3);
  const hard = shuffle(pool.filter((question) => (question.difficulty || 1) >= 4), random).slice(0, 3);
  const selected = [...easy, ...medium, ...hard];
  const selectedIds = new Set(selected.map((question) => question.id));
  return shuffle([
    ...selected,
    ...shuffle(pool.filter((question) => !selectedIds.has(question.id)), random).slice(0, TOPIC_CHECKPOINT_QUESTION_COUNT - selected.length),
  ], random).slice(0, TOPIC_CHECKPOINT_QUESTION_COUNT).map(withProductionTask);
}

export function isTopicCheckpointPassed(correctCount: number, totalCount = TOPIC_CHECKPOINT_QUESTION_COUNT): boolean {
  return totalCount > 0 && correctCount / totalCount >= TOPIC_CHECKPOINT_PASS_COUNT / TOPIC_CHECKPOINT_QUESTION_COUNT;
}
