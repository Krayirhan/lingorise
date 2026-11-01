import {
  EditorialReviewEvidence,
  LanguageRegister,
  LearningItemKind,
  LevelCode,
  PartOfSpeech
} from "../models/content";


export interface EditorialQuestionDraft {
  id: string;
  level: LevelCode;
  cefr: LevelCode;
  topic: string;
  topicId: string;
  unitId: string;
  lessonId: string;
  senseId: string;
  word: string;
  meaning: string;
  partOfSpeech: PartOfSpeech;
  learningItemKind: LearningItemKind;
  register: LanguageRegister;
  exampleSentence: string;
  exampleTranslation: string;
  contextNote: string;
  hint: string;
  pronunciation: string;
  phonetic: string;
  wrongOptions: [string, string];
  reviewer: string;
  reviewedAt: string;
  editorialReview: EditorialReviewEvidence;
  source: string;
  difficulty: 1 | 2 | 3 | 4 | 5;
  xp: number;
}

export interface EditorialAudit {
  approved: boolean;
  errors: string[];
  warnings: string[];
  templateExampleIds: string[];
  templateTranslationIds: string[];
  overusedDistractorIds: string[];
}

export type AuditPriority = "P0" | "P1" | "P2" | "P3";

export type FieldAuditStatus = "pass" | "revision_required" | "blocked" | "not_applicable";

export interface AuditFinding {
  priority: AuditPriority;
  message: string;
  field?: string;
  ruleId?: string;
}

export interface ItemAuditResult {
  itemId: string;
  level: LevelCode;
  errors: AuditFinding[];
  warnings: AuditFinding[];
  informational: string[];
  fieldResults: Record<string, FieldAuditStatus>;
}

export interface IpaProvenance {
  value: string;
  dialect: "AmE" | "BrE" | "both" | "unknown";
  source: string;
  verificationStatus: "verified" | "pending" | "failed";
}

export interface LevelQualityMetrics {
  level: LevelCode;
  totalItems: number;
  posDistribution: Record<PartOfSpeech, number>;
  exampleCoverage: number;
  translationCoverage: number;
  senseCoverage: number;
  ipaCoverage: number;
  ipaProvenanceDistribution: {
    verified: number;
    pending: number;
    failed: number;
  };
  ipaDialectDistribution: {
    AmE: number;
    BrE: number;
    both: number;
    unknown: number;
  };
  collocationCoverage: number;
  productionCoverage: number;
  targetEnforcedProductionRate: number;
  distractorSuitability: number;
  repeatedDistractorPairCount: number;
  repeatedExampleTemplateCount: number;
  repeatedTranslationTemplateCount: number;
  cefrMismatchCount: number;
  registerMismatchCount: number;
  p0Count: number;
  p1Count: number;
  p2Count: number;
  p3Count: number;
  humanReviewRate: number;
  approvedRate: number;
  localFirestoreDiffCount: number;
  auditErrors: number;
  auditWarnings: number;
  fieldCoverageRate: number;
  structuralPassRate: number;
  editoriallyVerifiedRate: number;
}

export const MANDATORY_AUDIT_FIELDS = [
  "id",
  "level",
  "topic",
  "topicId",
  "unitId",
  "lessonId",
  "word",
  "meaning",
  "wrongOptions",
  "options",
  "partOfSpeech",
  "learningItemKind",
  "cefr",
  "senseId",
  "register",
  "exampleSentence",
  "exampleTranslation",
  "phonetic",
  "collocation",
  "productionPrompt",
  "source",
  "status",
  "editorialStatus",
] as const;

export type MandatoryAuditField = (typeof MANDATORY_AUDIT_FIELDS)[number];

export interface CatalogueAuditContext {
  templateExampleIds?: Set<string>;
  templateTranslationIds?: Set<string>;
  overusedDistractorPairs?: Set<string>;
  duplicateSenseIds?: Set<string>;
  overusedPromptIds?: Set<string>;
  overusedCollocations?: Set<string>;
}

export interface ItemDoDValidationResult {
  passed: boolean;
  failures: string[];
}

export type FindingReporter = (priority: AuditPriority, field: MandatoryAuditField, message: string, ruleId?: string) => void;
