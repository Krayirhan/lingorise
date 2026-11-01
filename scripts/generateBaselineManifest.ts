import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { allQuestions } from "../src/content/questions";
import { auditEditorialQuestions } from "../src/content/editorialQuality";
import {
  buildEditorialReviewQueue,
  EDITORIAL_RUBRIC_VERSION,
  hasVerifiableHumanApproval,
} from "../src/content/editorialReviewWorkflow";
import { LevelCode, MeaningMatchQuestion } from "../src/domain/models/content";

function computeItemHash(item: MeaningMatchQuestion): string {
  const normalized = {
    id: item.id,
    level: item.level,
    topic: item.topic,
    word: item.word,
    meaning: item.meaning,
    partOfSpeech: item.partOfSpeech,
    senseId: item.senseId || null,
    exampleSentence: item.exampleSentence || null,
    exampleTranslation: item.exampleTranslation || null,
    phonetic: item.phonetic || null,
    collocation: item.collocation || null,
    productionPrompt: item.productionPrompt || null,
    wrongOptions: [...(item.wrongOptions || [])].sort(),
    status: item.status || "draft",
    editorialStatus: item.editorialStatus || "needs_review",
  };
  return crypto.createHash("sha256").update(JSON.stringify(normalized)).digest("hex");
}

export interface BaselineItemSummary {
  id: string;
  level: LevelCode;
  topic: string;
  word: string;
  partOfSpeech?: string;
  senseId?: string;
  hasExample: boolean;
  hasTranslation: boolean;
  hasPhonetic: boolean;
  hasCollocation: boolean;
  hasProductionPrompt: boolean;
  distractorCount: number;
  status: string;
  editorialStatus: string;
  humanApprovalPresent: boolean;
  itemHash: string;
}

export interface BaselineManifest {
  manifestVersion: string;
  contentVersion: string;
  rubricVersion: string;
  generatedAt: string;
  totalItems: number;
  aggregateContentHash: string;
  readinessSummary: {
    automatedAuditErrors: number;
    automatedAuditWarnings: number;
    humanApprovedItems: number;
    pendingHumanApproval: number;
    editorialReadiness: "NOT_READY" | "READY";
    releaseDecision: "BLOCKED" | "OPEN";
  };
  levelSummaries: Record<
    LevelCode,
    {
      totalItems: number;
      humanApproved: number;
      pendingReview: number;
      auditErrors: number;
      auditWarnings: number;
      collocationCoverage: number;
      productionCoverage: number;
      exampleCoverage: number;
      levelHash: string;
    }
  >;
  items: BaselineItemSummary[];
}

export function generateBaselineManifest(): BaselineManifest {
  const sortedQuestions = [...allQuestions].sort((a, b) => a.id.localeCompare(b.id));
  const queue = buildEditorialReviewQueue(sortedQuestions);
  const auditAll = auditEditorialQuestions(sortedQuestions);

  const itemSummaries: BaselineItemSummary[] = sortedQuestions.map((q) => {
    const queueItem = queue.find((item) => item.questionId === q.id);
    return {
      id: q.id,
      level: q.level,
      topic: q.topic,
      word: q.word,
      partOfSpeech: q.partOfSpeech,
      senseId: q.senseId,
      hasExample: Boolean(q.exampleSentence),
      hasTranslation: Boolean(q.exampleTranslation),
      hasPhonetic: Boolean(q.phonetic),
      hasCollocation: Boolean(q.collocation),
      hasProductionPrompt: Boolean(q.productionPrompt),
      distractorCount: q.wrongOptions ? q.wrongOptions.length : 0,
      status: q.status || "draft",
      editorialStatus: q.editorialStatus || "needs_review",
      humanApprovalPresent: queueItem?.humanApprovalPresent || hasVerifiableHumanApproval(q),
      itemHash: computeItemHash(q),
    };
  });

  const levels: LevelCode[] = ["A1", "A2", "B1", "B2", "C1", "C2"];
  const levelSummaries: BaselineManifest["levelSummaries"] = {} as any;

  for (const lvl of levels) {
    const lvlQuestions = sortedQuestions.filter((q) => q.level === lvl);
    const lvlAudit = auditEditorialQuestions(lvlQuestions);
    const lvlApproved = itemSummaries.filter((i) => i.level === lvl && i.humanApprovalPresent).length;
    const lvlHashes = itemSummaries.filter((i) => i.level === lvl).map((i) => i.itemHash).join(";");
    const levelHash = crypto.createHash("sha256").update(lvlHashes).digest("hex");

    levelSummaries[lvl] = {
      totalItems: lvlQuestions.length,
      humanApproved: lvlApproved,
      pendingReview: lvlQuestions.length - lvlApproved,
      auditErrors: lvlAudit.errors.length,
      auditWarnings: lvlAudit.warnings.length,
      collocationCoverage: lvlQuestions.filter((q) => Boolean(q.collocation)).length,
      productionCoverage: lvlQuestions.filter((q) => Boolean(q.productionPrompt)).length,
      exampleCoverage: lvlQuestions.filter((q) => Boolean(q.exampleSentence && q.exampleTranslation)).length,
      levelHash,
    };
  }

  const allItemHashes = itemSummaries.map((i) => i.itemHash).join(";");
  const aggregateContentHash = crypto.createHash("sha256").update(allItemHashes).digest("hex");
  const totalApproved = itemSummaries.filter((i) => i.humanApprovalPresent).length;

  return {
    manifestVersion: "1.0.0",
    contentVersion: "2026.09.p1",
    rubricVersion: EDITORIAL_RUBRIC_VERSION,
    generatedAt: new Date().toISOString(),
    totalItems: sortedQuestions.length,
    aggregateContentHash,
    readinessSummary: {
      automatedAuditErrors: auditAll.errors.length,
      automatedAuditWarnings: auditAll.warnings.length,
      humanApprovedItems: totalApproved,
      pendingHumanApproval: sortedQuestions.length - totalApproved,
      editorialReadiness: totalApproved === sortedQuestions.length ? "READY" : "NOT_READY",
      releaseDecision: totalApproved === sortedQuestions.length && auditAll.errors.length === 0 ? "OPEN" : "BLOCKED",
    },
    levelSummaries,
    items: itemSummaries,
  };
}

if (require.main === module) {
  const manifest = generateBaselineManifest();
  const outputPath = path.join(process.cwd(), "docs", "36-baseline-manifest.json");
  fs.writeFileSync(outputPath, JSON.stringify(manifest, null, 2), "utf8");
  console.log(`Baseline manifest successfully generated: ${outputPath}`);
  console.log(`Total Items: ${manifest.totalItems}`);
  console.log(`Aggregate Hash: ${manifest.aggregateContentHash}`);
  console.log(`Human Approved: ${manifest.readinessSummary.humanApprovedItems}/${manifest.totalItems}`);
  console.log(`Release Decision: ${manifest.readinessSummary.releaseDecision}`);
}
