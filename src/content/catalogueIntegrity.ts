import { MeaningMatchQuestion } from "../domain/models/content";

export interface CatalogueIntegritySnapshot {
  itemCount: number;
  itemIds: string[];
  contentHash: string;
  statusDistribution: Record<string, number>;
  editorialStatusDistribution: Record<string, number>;
  ipaCount: number;
  exampleSentenceCount: number;
}

function stableValue(value: unknown): string {
  if (value === null || value === undefined) return "null";
  if (Array.isArray(value)) return "[" + value.map(stableValue).join(",") + "]";
  if (typeof value === "object") {
    return "{" + Object.entries(value as Record<string, unknown>)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, item]) => JSON.stringify(key) + ":" + stableValue(item))
      .join(",") + "}";
  }
  return JSON.stringify(value);
}

function fnv1a(input: string): string {
  let hash = 2166136261;
  for (let index = 0; index < input.length; index += 1) {
    hash ^= input.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(16).padStart(8, "0");
}

export function createCatalogueIntegritySnapshot(questions: MeaningMatchQuestion[]): CatalogueIntegritySnapshot {
  const sorted = [...questions].sort((left, right) => left.id.localeCompare(right.id));
  const contentRows = sorted.map((question) => ({
    id: question.id,
    level: question.level,
    topicId: question.topicId,
    word: question.word,
    meaning: question.meaning,
    wrongOptions: question.wrongOptions,
    phonetic: question.phonetic,
    partOfSpeech: question.partOfSpeech,
    exampleSentence: question.exampleSentence,
    exampleTranslation: question.exampleTranslation,
    productionPrompt: question.productionPrompt,
    collocation: question.collocation,
    senseId: question.senseId,
    cefr: question.cefr,
    register: question.register,
    status: question.status,
    editorialStatus: question.editorialStatus,
  }));
  const distribution = (values: string[]) => values.reduce<Record<string, number>>((result, value) => {
    result[value || "missing"] = (result[value || "missing"] || 0) + 1;
    return result;
  }, {});
  return {
    itemCount: sorted.length,
    itemIds: sorted.map((question) => question.id),
    contentHash: fnv1a(stableValue(contentRows)),
    statusDistribution: distribution(sorted.map((question) => question.status || "missing")),
    editorialStatusDistribution: distribution(sorted.map((question) => question.editorialStatus || "missing")),
    ipaCount: sorted.filter((question) => Boolean(question.phonetic)).length,
    exampleSentenceCount: sorted.filter((question) => Boolean(question.exampleSentence)).length,
  };
}

export function compareCatalogueIntegrity(expected: CatalogueIntegritySnapshot, actual: CatalogueIntegritySnapshot): string[] {
  const errors: string[] = [];
  if (expected.itemCount !== actual.itemCount) errors.push("item count differs (" + expected.itemCount + " != " + actual.itemCount + ")");
  if (expected.contentHash !== actual.contentHash) errors.push("content hash differs (" + expected.contentHash + " != " + actual.contentHash + ")");
  if (stableValue(expected.itemIds) !== stableValue(actual.itemIds)) errors.push("item ID set differs");
  if (stableValue(expected.statusDistribution) !== stableValue(actual.statusDistribution)) errors.push("status distribution differs");
  if (stableValue(expected.editorialStatusDistribution) !== stableValue(actual.editorialStatusDistribution)) errors.push("editorialStatus distribution differs");
  if (expected.ipaCount !== actual.ipaCount) errors.push("IPA coverage differs (" + expected.ipaCount + " != " + actual.ipaCount + ")");
  if (expected.exampleSentenceCount !== actual.exampleSentenceCount) errors.push("example sentence coverage differs (" + expected.exampleSentenceCount + " != " + actual.exampleSentenceCount + ")");
  return errors;
}
