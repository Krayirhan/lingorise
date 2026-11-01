import {
  EditorialStatus,
  EditorialReviewEvidence,
  LanguageRegister,
  LearningItemKind,
  LevelCode,
  MeaningMatchQuestion,
  PartOfSpeech,
} from "../types/content";

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

const GENERIC_CONTEXT = [
  /(?:ifades?i?|kelimes?i?|sözcük|sözcüğ?ü?) .* bağlamında kullanılır/i,
  /için [abc][12] öğesi/i,
  /düzeyi kelime veya ifade/i,
];

const IRREGULAR_EXAMPLE_FORMS: Record<string, string[]> = {
  apply: ["applied", "applying"],
  spend: ["spent", "spending"],
  lend: ["lent", "lending"],
  forgive: ["forgave", "forgiven", "forgiving"],
  confident: ["confidently"],
};

const PHRASE_FUNCTION_WORDS = new Set([
  "a", "an", "the", "to", "for", "of", "in", "on", "with", "my", "your", "someone", "be",
]);
const IRREGULAR_PHRASE_FORMS: Record<string, string[]> = {
  meet: ["met"],
  make: ["made"],
  have: ["had"],
};

const KNOWN_FAULTY_COLLOCATIONS = [
  /fresh water and/i,
  /small seed and/i,
  /this year i\b/i,
  /new job last\b/i,
  /today morning/i,
  /yesterday night/i,
  /lot yesterday/i,
  /our home is/i,
  /our office is/i,
  /the salary is/i,
  /a useful app and/i,
  /this plan is/i,
  /the trip was/i,
  /the person is/i,
  /persist with effort/i,
  /travel journey/i,
];

const TRAILING_FUNCTION_WORDS = /\b(and|is|i|the|last|of|to|in|on|for|a|an|with|by|from|into|onto|this|that|or|but)$/i;


function normaliseExample(question: Pick<MeaningMatchQuestion, "word" | "exampleSentence">): string {
  const sentence = (question.exampleSentence || "").toLocaleLowerCase("en").trim();
  const target = question.word.toLocaleLowerCase("en");
  const targetIndex = sentence.lastIndexOf(target);
  const withTarget = targetIndex >= 0
    ? `${sentence.slice(0, targetIndex)}{target}${sentence.slice(targetIndex + target.length)}`
    : sentence;
  return withTarget
    .replace(/\bin case\s+\d+\b/gi, "in case {number}")
    .replace(/\s+/g, " ")
    .replace(/[.!?]+$/, "");
}

function templateSignature(normalised: string): string {
  if (/^(?:the team|they) will \{target\} during /.test(normalised)) return "subject will {target} during {context}";
  if (/^the \{target\} (?:affected|shaped) /.test(normalised)) return "the {target} verb {context}";
  if (/^(?:their|the) response to .+ was \{target\}$/.test(normalised)) return "response to {context} was {target}";
  if (/^the report uses \{target\} in its central analysis$/.test(normalised)) return "report uses {target} in central analysis";
  if (/^the specialist presentation addressed \{target\} with precision$/.test(normalised)) return "presentation addressed {target} with precision";
  return normalised;
}

function normaliseTranslation(question: Pick<MeaningMatchQuestion, "meaning" | "exampleTranslation">): string {
  const translation = (question.exampleTranslation || "").toLocaleLowerCase("tr").trim();
  const meaning = question.meaning.toLocaleLowerCase("tr");
  const index = translation.lastIndexOf(meaning);
  const withMeaning = index >= 0 ? `${translation.slice(0, index)}{meaning}${translation.slice(index + meaning.length)}` : translation;
  return withMeaning
    .replace(/\bin case\s+\d+\b/gi, "in case {number}")
    .replace(/\s+/g, " ")
    .replace(/[.!?]+$/, "");
}

function translationTemplateSignature(normalised: string): string {
  if (/^ekip .+ sırasında \{meaning\}$/.test(normalised)) return "ekip {context} sırasında {meaning}";
  if (/^.+ karşısındaki yanıt(?:ları)? \{meaning\}$/.test(normalised)) return "{context} karşısındaki yanıt {meaning}";
  if (/^\{meaning\}, .+ (?:üzerinde etkili oldu|sürecini şekillendirdi)$/.test(normalised)) return "{meaning}, {context} etkiledi";
  if (/^rapor merkezi analizinde \{meaning\} ifadesini kullanır$/.test(normalised)) return "rapor merkezi analizinde {meaning} kullanır";
  if (/^uzman sunumu \{meaning\} konusunu kesin biçimde ele aldı$/.test(normalised)) return "uzman sunumu {meaning} konusunu ele aldı";
  return normalised;
}

/**
 * Checks IPA transcription and its editorial source provenance.
 * Kaynaksız veya şüpheli IPA'yı verified saymaz.
 */
export function auditIpaProvenance(question: MeaningMatchQuestion): IpaProvenance {
  const rawIpa = (question.phonetic || "").trim();
  const source = (question.source || "").trim();

  if (!rawIpa) {
    return {
      value: "",
      dialect: "unknown",
      source,
      verificationStatus: "failed",
    };
  }

  // Dialect heuristics
  let dialect: "AmE" | "BrE" | "both" | "unknown" = "unknown";
  const lowerIpa = rawIpa.toLowerCase();
  const lowerSource = source.toLowerCase();

  const hasAmEMarkers = /ɑːr|ɜːr|ɔːr|ɪr|ʊr|eər|ɝ|ɚ/.test(rawIpa) || lowerSource.includes("ame") || lowerSource.includes("american");
  const hasBrEMarkers = /ɒ|əʊ|iə|eə/.test(rawIpa) || lowerSource.includes("bre") || lowerSource.includes("british") || lowerSource.includes("cambridge");

  if (hasAmEMarkers && hasBrEMarkers) {
    dialect = "both";
  } else if (hasAmEMarkers) {
    dialect = "AmE";
  } else if (hasBrEMarkers) {
    dialect = "BrE";
  } else if (lowerSource.includes("oxford") || lowerSource.includes("webster") || /^\/[^/]+\/$/.test(rawIpa)) {
    dialect = "both";
  }

  // Verification status
  let verificationStatus: "verified" | "pending" | "failed" = "pending";
  const isValidIpaSyntax = /^[\/\[]?[a-zA-Z0-9ˈˌːæɑɒɔəɛɪʊʌθðʃʒŋʔɜɡ\u0250-\u02AF\u02B0-\u02FF():. \-,\/\]]+[\/\]]?$/.test(rawIpa);

  if (!isValidIpaSyntax) {
    verificationStatus = "failed";
  } else {
    // Requires verified source provenance
    const hasAuthoritativeSource =
      source.length > 0 &&
      !lowerSource.includes("synthetic") &&
      !lowerSource.includes("unverified") &&
      !lowerSource.includes("template") &&
      (lowerSource.includes("oxford") ||
        lowerSource.includes("cambridge") ||
        lowerSource.includes("corpus") ||
        lowerSource.includes("word list") ||
        lowerSource.includes("proficiency") ||
        lowerSource.includes("editorial review") ||
        lowerSource.includes("editorial rewrite") ||
        lowerSource.includes("cefr"));

    if (hasAuthoritativeSource) {
      verificationStatus = "verified";
    } else {
      verificationStatus = "pending";
    }
  }

  return {
    value: rawIpa,
    dialect,
    source,
    verificationStatus,
  };
}

/**
 * Checks target word presence in example sentence including inflected forms and phrase gaps.
 */
function checkTargetInExample(word: string, exampleSentence: string, kind?: LearningItemKind): boolean {
  const example = exampleSentence.toLocaleLowerCase("en");
  const target = word.toLocaleLowerCase("en").trim();
  if (!target || !example) return false;

  const phraseParts = target.split(/…|\.\.\./).map((part) => part.trim()).filter(Boolean);
  if (phraseParts.length > 1) {
    return phraseParts.reduce((lastIndex, part) => (lastIndex < 0 ? -1 : example.indexOf(part, lastIndex)), 0) >= 0;
  }

  const wordForms = new Set<string>([target]);
  (IRREGULAR_EXAMPLE_FORMS[target] || []).forEach((form) => wordForms.add(form));
  if (target.endsWith("y")) {
    wordForms.add(`${target.slice(0, -1)}ies`);
    wordForms.add(`${target.slice(0, -1)}ied`);
  }
  wordForms.add(`${target}s`);
  wordForms.add(`${target}es`);
  wordForms.add(`${target}ed`);
  wordForms.add(`${target}ing`);
  if (target.endsWith("e")) {
    wordForms.add(`${target}d`);
    wordForms.add(`${target.slice(0, -1)}ing`);
  }
  wordForms.add(`${target}ly`);

  if ([...wordForms].some((form) => example.includes(form))) {
    return true;
  }

  if (kind === "phrase") {
    const targetWords = target.match(/[a-z]+/g)?.filter((w) => !PHRASE_FUNCTION_WORDS.has(w)) || [];
    const exampleWords = example.match(/[a-z]+/g) || [];
    return (
      targetWords.length > 0 &&
      targetWords.every((w) =>
        exampleWords.some(
          (candidate) =>
            candidate === w ||
            candidate.startsWith(w) ||
            (w.endsWith("e") && candidate.startsWith(w.slice(0, -1))) ||
            (IRREGULAR_PHRASE_FORMS[w] || []).includes(candidate)
        )
      )
    );
  }

  return false;
}

export interface CatalogueAuditContext {
  templateExampleIds?: Set<string>;
  templateTranslationIds?: Set<string>;
  overusedDistractorPairs?: Set<string>;
  duplicateSenseIds?: Set<string>;
  overusedPromptIds?: Set<string>;
  overusedCollocations?: Set<string>;
}

/**
 * Comprehensive S2 Item Audit Engine
 * Inspects all 23 fields without auto-filling or modifying content.
 * Classifies each finding as P0, P1, P2, or P3 and sets field-level status.
 */
export function auditItemDetailed(
  question: MeaningMatchQuestion,
  context?: CatalogueAuditContext
): ItemAuditResult {
  const errors: AuditFinding[] = [];
  const warnings: AuditFinding[] = [];
  const informational: string[] = [];

  const fieldResults: Record<string, FieldAuditStatus> = {};
  for (const field of MANDATORY_AUDIT_FIELDS) {
    fieldResults[field] = "pass";
  }

  function flagFinding(priority: AuditPriority, field: MandatoryAuditField, message: string, ruleId?: string) {
    const finding: AuditFinding = { priority, message, field, ruleId };
    if (priority === "P0") {
      errors.push(finding);
      fieldResults[field] = "blocked";
    } else if (priority === "P1") {
      errors.push(finding);
      if (fieldResults[field] !== "blocked") {
        fieldResults[field] = "revision_required";
      }
    } else if (priority === "P2") {
      warnings.push(finding);
      if (fieldResults[field] === "pass") {
        fieldResults[field] = "revision_required";
      }
    } else if (priority === "P3") {
      warnings.push(finding);
    }
  }

  // 1. id
  if (!question.id || typeof question.id !== "string" || question.id.trim().length === 0) {
    flagFinding("P0", "id", "id is missing or empty");
  }

  // 2. level
  const validLevels: LevelCode[] = ["A1", "A2", "B1", "B2", "C1", "C2"];
  if (!question.level || !validLevels.includes(question.level)) {
    flagFinding("P0", "level", "level missing or invalid LevelCode");
  }

  // 3. topic
  if (!question.topic || typeof question.topic !== "string" || question.topic.trim().length === 0) {
    flagFinding("P0", "topic", "topic missing or empty");
  }

  // 4. topicId
  if (!question.topicId || typeof question.topicId !== "string" || question.topicId.trim().length === 0) {
    flagFinding("P1", "topicId", "topicId missing for stable curriculum tracking");
  }

  // 5. unitId
  if (!question.unitId || typeof question.unitId !== "string" || question.unitId.trim().length === 0) {
    flagFinding("P1", "unitId", "unitId missing for lesson unit mapping");
  }

  // 6. lessonId
  if (!question.lessonId || typeof question.lessonId !== "string" || question.lessonId.trim().length === 0) {
    flagFinding("P1", "lessonId", "lessonId missing for lesson unit mapping");
  }

  // 7. word
  if (!question.word || typeof question.word !== "string" || question.word.trim().length === 0) {
    flagFinding("P0", "word", "word target missing or empty");
  }

  // 8. meaning
  if (!question.meaning || typeof question.meaning !== "string" || question.meaning.trim().length === 0) {
    flagFinding("P0", "meaning", "meaning translation missing or empty");
  }

  // 9. wrongOptions
  if (!Array.isArray(question.wrongOptions) || question.wrongOptions.length !== 2) {
    flagFinding("P0", "wrongOptions", "wrongOptions count must be exactly 2 distractors");
  } else {
    const d0 = (question.wrongOptions[0] || "").trim();
    const d1 = (question.wrongOptions[1] || "").trim();
    const meaning = (question.meaning || "").trim();

    if (!d0 || !d1) {
      flagFinding("P0", "wrongOptions", "wrongOptions elements must be non-empty");
    } else if (d0 === d1) {
      flagFinding("P0", "wrongOptions", "wrongOptions contains duplicate distractors");
    } else if (d0 === meaning || d1 === meaning) {
      flagFinding("P0", "wrongOptions", "wrongOptions cannot equal correct meaning");
    }

    // Check POS suitability of distractors
    if (question.partOfSpeech === "verb") {
      const isTurkishVerb = (str: string) => /mak$|mek$|etmek$|yapmak$/i.test(str.trim());
      if ((d0.endsWith("ce") || d0.endsWith("ca") || d0.includes("şekilde")) && !isTurkishVerb(d0)) {
        flagFinding("P1", "wrongOptions", "distractor part of speech mismatch: adverb/adjective supplied for verb target");
      }
    }

    // Overused distractor pair
    const pairSignature = [d0.toLocaleLowerCase("tr"), d1.toLocaleLowerCase("tr")].sort().join("|");
    if (context?.overusedDistractorPairs?.has(pairSignature)) {
      flagFinding("P1", "wrongOptions", `repeated distractor pair '${pairSignature}' overused in catalogue`);
    }
  }

  // 10. options
  if (question.options) {
    if (!Array.isArray(question.options) || question.options.length !== 3) {
      flagFinding("P0", "options", "options must have exactly 3 options");
    } else if (new Set(question.options).size !== 3) {
      flagFinding("P0", "options", "options contains duplicate entries");
    } else if (!question.options.includes(question.meaning)) {
      flagFinding("P0", "options", "options must include correct meaning");
    }
  }

  // 11. partOfSpeech
  const validPos: PartOfSpeech[] = ["noun", "verb", "adjective", "adverb", "phrase"];
  if (!question.partOfSpeech || !validPos.includes(question.partOfSpeech)) {
    flagFinding("P0", "partOfSpeech", "partOfSpeech missing or invalid");
  }

  // 12. learningItemKind
  const validKinds: LearningItemKind[] = ["word", "phrase", "collocation", "grammar_pattern"];
  if (!question.learningItemKind || !validKinds.includes(question.learningItemKind)) {
    flagFinding("P0", "learningItemKind", "learningItemKind missing or invalid");
  }

  // 13. cefr
  if (!question.cefr || !validLevels.includes(question.cefr)) {
    flagFinding("P0", "cefr", "cefr level missing");
  } else if (question.cefr !== question.level) {
    flagFinding("P0", "cefr", `CEFR level mismatched with item level (${question.cefr} !== ${question.level})`);
  }

  // 14. senseId
  if (!question.senseId || typeof question.senseId !== "string" || question.senseId.trim().length === 0) {
    flagFinding("P0", "senseId", "senseId missing");
  } else if (context?.duplicateSenseIds?.has(question.senseId)) {
    flagFinding("P1", "senseId", `duplicate senseId '${question.senseId}' repeated across items`);
  }

  // 15. register
  const validRegisters: LanguageRegister[] = [
    "neutral", "informal", "formal", "academic", "professional", "literary", "technical"
  ];
  if (!question.register || !validRegisters.includes(question.register)) {
    flagFinding("P0", "register", "register missing or invalid");
  } else {
    // Advanced levels require formal/academic/professional register
    if (question.level === "C2" && question.register === "informal") {
      flagFinding("P1", "register", "C2 item register should be formal, academic, or professional");
    } else if (question.level === "B2" && question.topicId?.includes("fiscal") && question.register === "neutral") {
      flagFinding("P2", "register", "register should be academic or professional for B2 upper-intermediate topic");
    }
  }

  // 16. exampleSentence
  const example = (question.exampleSentence || "").trim();
  if (!example) {
    flagFinding("P0", "exampleSentence", "exampleSentence missing or empty");
  } else {
    // Artificial numbered markers
    if (/\bin case\s+\d+\b/i.test(example) || /\breview panel\s+\d+\b/i.test(example)) {
      flagFinding("P0", "exampleSentence", "example contains artificial numbered context marker");
    }

    // Incompatible grammatical slot
    const lowerEx = example.toLowerCase();
    if (
      (/^the report uses\b/.test(lowerEx) || /^the specialist presentation addressed\b/.test(lowerEx)) &&
      question.partOfSpeech !== "noun"
    ) {
      flagFinding("P0", "exampleSentence", "example places target in an incompatible grammatical slot");
    }

    // Target word presence
    const hasTarget = checkTargetInExample(question.word, example, question.learningItemKind);
    if (!hasTarget) {
      flagFinding("P0", "exampleSentence", "example does not contain target word or valid inflected form");
    }

    // Template repetition
    if (context?.templateExampleIds?.has(question.id)) {
      flagFinding("P1", "exampleSentence", "example belongs to repeated sentence template skeleton");
    }

    // Double punctuation styling
    if (/\.\.$|\?\?|!!/.test(example)) {
      flagFinding("P3", "exampleSentence", "example sentence terminal punctuation style suggestion");
    }

    // A1 overly advanced support vocabulary check
    if (question.level === "A1") {
      const advancedSupportWords = /\b(vibrant|essential nutrients|photosynthesis|sophisticated|environmental|memorable|professional)\b/i;
      if (advancedSupportWords.test(example) || advancedSupportWords.test(question.contextNote || "")) {
        flagFinding("P2", "exampleSentence", "A1 sentence or note contains overly advanced support vocabulary");
      }
    } else if (question.level === "A2") {
      const b2AcademicWords = /\b(sophisticated|environmental)\b/i;
      const targetLower = question.word.toLowerCase();
      if (b2AcademicWords.test(example) && !targetLower.includes("environmental") && !targetLower.includes("sophisticated")) {
        flagFinding("P2", "exampleSentence", "A2 sentence contains overly advanced support vocabulary");
      }
    }
  }


  // 17. exampleTranslation
  const translation = (question.exampleTranslation || "").trim();
  if (!translation) {
    flagFinding("P0", "exampleTranslation", "exampleTranslation missing or empty");
  } else {
    if (GENERIC_CONTEXT.some((regex) => regex.test(translation))) {
      flagFinding("P0", "exampleTranslation", "generic, artificial, or missing Turkish example translation");
    }
    if (/\bin case\s+\d+\b/i.test(translation) || /\bilgili inceleme dosyası/i.test(translation) || /\bvaka\s+\d+\b/i.test(translation)) {
      flagFinding("P0", "exampleTranslation", "artificial numbered context in Turkish translation");
    }
    if (context?.templateTranslationIds?.has(question.id)) {
      flagFinding("P1", "exampleTranslation", "translation belongs to repeated translation template skeleton");
    }
    // Minor Turkish capitalization style check
    if (/^[a-zçğıöşü]/.test(translation)) {
      flagFinding("P3", "exampleTranslation", "example translation initial letter casing suggestion");
    }
  }

  // 18. phonetic (IPA)
  const phonetic = (question.phonetic || "").trim();
  if (!phonetic) {
    flagFinding("P0", "phonetic", "phonetic missing or empty");
  } else {
    const ipaProv = auditIpaProvenance(question);
    informational.push(`IPA: ${ipaProv.value} (${ipaProv.dialect}) [${ipaProv.verificationStatus}]`);

    if (ipaProv.verificationStatus === "failed") {
      flagFinding("P0", "phonetic", "phonetic is not a valid IPA transcription");
    } else if (ipaProv.verificationStatus === "pending") {
      flagFinding("P2", "phonetic", "IPA phonetic source provenance unverified or pending dictionary reference");
    }

    if (ipaProv.dialect === "unknown" || phonetic.includes("?")) {
      flagFinding("P2", "phonetic", "IPA dialect notation ambiguous or unverified");
    }
  }

  // 19. collocation
  const collocation = (question.collocation || "").trim();
  if (question.level === "C2" && !collocation) {
    flagFinding("P0", "collocation", "C2 items strictly require collocation");
  } else if (!collocation) {
    flagFinding("P1", "collocation", "collocation missing");
  } else {
    const colWords = collocation.split(/\s+/).filter(Boolean);

    // Minimum words
    if (colWords.length < 2) {
      flagFinding("P1", "collocation", "collocation must consist of at least two meaningful words");
    }

    // Trailing function words / conjunctions
    if (TRAILING_FUNCTION_WORDS.test(collocation)) {
      flagFinding("P1", "collocation", "collocation ends with conjunction/function word (e.g. and, is, I, the, last)");
    }

    // Known faulty collocations
    if (KNOWN_FAULTY_COLLOCATIONS.some((r) => r.test(collocation))) {
      flagFinding("P1", "collocation", "unnatural or faulty collocation pattern (e.g. today morning, fresh water and, etc.)");
    }

    // Target inclusion
    const colLower = collocation.toLowerCase();
    const targetLower = question.word.toLowerCase();
    const colHasTarget =
      colLower.includes(targetLower) ||
      (IRREGULAR_EXAMPLE_FORMS[targetLower] || []).some((f) => colLower.includes(f)) ||
      (question.learningItemKind === "phrase" && colWords.some((cw) => targetLower.includes(cw)));

    if (!colHasTarget) {
      flagFinding("P1", "collocation", "collocation does not contain target word or valid inflected form");
    }

    // Check appearance in example or productionPrompt
    const exampleLower = (question.exampleSentence || "").toLowerCase().replace(/[^a-z0-9 ]/g, " ");
    const promptLower = (question.productionPrompt || "").toLowerCase().replace(/[^a-z0-9 ]/g, " ");
    const colCleanWords = collocation.toLowerCase().replace(/[^a-z0-9 ]/g, " ").split(/\s+/).filter(Boolean);

    const inExample = colCleanWords.every((w) => exampleLower.includes(w));
    const inPrompt = colCleanWords.every((w) => promptLower.includes(w));

    if (!inExample && !inPrompt) {
      if (question.level === "C2") {
        flagFinding("P1", "collocation", "C2 collocation does not appear in example sentence or production prompt");
      } else {
        flagFinding("P2", "collocation", "collocation not directly illustrated in example or prompt");
      }
    }

    if (context?.overusedCollocations?.has(colLower)) {
      flagFinding("P2", "collocation", `collocation '${collocation}' repeated across 5 or more items in catalogue`);
    }

    // Collocation casing recommendation
    if (/[A-Z]/.test(collocation) && !collocation.includes("I") && !/^[A-Z][a-z]+ [A-Z]/.test(collocation) === false) {
      flagFinding("P3", "collocation", "collocation lowercase formatting recommendation");
    }
  }

  // 20. productionPrompt
  const prompt = (question.productionPrompt || "").trim();
  if (question.level === "C2" && !prompt) {
    flagFinding("P0", "productionPrompt", "C2 items strictly require productionPrompt");
  } else if (!prompt) {
    flagFinding("P1", "productionPrompt", "productionPrompt missing");
  } else {
    const promptLower = prompt.toLowerCase();
    const targetLower = question.word.toLowerCase();
    const wordsInPrompt = prompt.split(/\s+/).filter(Boolean);

    // Broken grammar: "Explain how to + noun phrase" without verb
    if (/explain how to the\b|explain how to a\b/i.test(prompt)) {
      flagFinding("P1", "productionPrompt", "production prompt syntax broken: 'Explain how to' requires base verb");
    }

    // Check if target is enforced
    const targetInQuotes =
      promptLower.includes(`"${targetLower}"`) ||
      promptLower.includes(`'${targetLower}'`) ||
      promptLower.includes(`‘${targetLower}’`) ||
      promptLower.includes(`“${targetLower}”`);

    const hasTargetMention = promptLower.includes(targetLower) || targetInQuotes;

    if (!hasTargetMention) {
      flagFinding("P1", "productionPrompt", "productionPrompt does not enforce the target word");
    } else {
      // Check if target is ONLY in quotes without production requirement
      const hasProductionInstruction =
        /use\s+['"‘“]?[a-z0-9 -]+['"’”]?/i.test(promptLower) ||
        /answer using/i.test(promptLower) ||
        /include\s+['"‘“]?[a-z0-9 -]+['"’”]?/i.test(promptLower) ||
        /write\s+(?:a|using|with)/i.test(promptLower) ||
        /explain/i.test(promptLower) ||
        /describe/i.test(promptLower) ||
        /critique/i.test(promptLower) ||
        /synthesize/i.test(promptLower) ||
        /discuss/i.test(promptLower) ||
        /evaluate/i.test(promptLower);

      if (targetInQuotes && /what does\s+['"‘“]?[a-z]+['"’”]?\s+mean|do you know what\s+['"‘“]?[a-z]+/i.test(promptLower) && !hasProductionInstruction) {
        flagFinding("P1", "productionPrompt", "target word only mentioned in quotes without production requirement");
      }
    }

    // Level-specific communicative goal checks
    if (question.level === "A1") {
      if (wordsInPrompt.length < 3) {
        flagFinding("P2", "productionPrompt", "A1 production prompt should have at least 3 words");
      }
      const hasLengthOrProductionRequirement =
        /at least 3 words|at least three words|minimum 3 words|minimum three words|in your answer|in a sentence|answer using|write using|response using/i.test(promptLower);
      if (!hasLengthOrProductionRequirement) {
        flagFinding("P1", "productionPrompt", "A1 production prompt must explicitly require at least 3 words or production in answer");
      }
    } else if (question.level === "A2") {
      if (wordsInPrompt.length < 4) {
        flagFinding("P1", "productionPrompt", "A2 production prompt should have at least 4 words");
      }
      const hasLengthRequirement =
        /at least 4 words|at least four words|minimum 4 words|minimum four words|at least four english words|at least 4 english words/i.test(promptLower);
      if (!hasLengthRequirement) {
        flagFinding("P1", "productionPrompt", "A2 production prompt must explicitly demand at least four words");
      }
      const hasCommunicativeIntent =
        /explain|describe|tell|ask|invite|remind|advise|congratulate|suggest|express|instruct|thank|talk about|give advice|share|list|name|call|wish|promise|recommend|warn|complain|discuss|direct|encourage|hurry|check/i.test(promptLower);
      if (!hasCommunicativeIntent) {
        flagFinding("P1", "productionPrompt", "A2 production prompt lacks communicative functional goal");
      }
      if (/suggest a helpful download an app action/i.test(promptLower) || /write a sentence using/i.test(promptLower)) {
        flagFinding("P1", "productionPrompt", "A2 production prompt contains broken or naive template phrasing");
      }
    } else if (question.level === "B1") {
      const isBrokenExplainHowTo =
        /explain how to\s+(?:heavy|key|meeting|efficient|flexible|reliable|top|staff|respectful|famous|remote|crowded|train|delay|insurance|departure|arrival|destination|memorable|authentic|cultural|custom|guidebook|journey|adventure|souvenir|hospitality|broadcast|source|accurate|biased|audience|trend|access|community|inequality|opportunity|volunteer|protest|regulation|public|debate|responsible|diverse|option|consequence|advantage|drawback|strategy|practical|realistic|ambitious|independent|alternative|outcome|the\b|a\b|an\b)/i.test(promptLower);
      if (isBrokenExplainHowTo) {
        flagFinding("P0", "productionPrompt", "B1 production prompt syntax broken: 'Explain how to' requires base verb, not noun phrase or adjective");
      }
      if (wordsInPrompt.length < 5) {
        flagFinding("P2", "productionPrompt", "production prompt word count borderline for level progression (B1 min 5 words)");
      }
      const hasLengthReq =
        /at least 5 words|at least five words|minimum 5 words|minimum five words|at least five english words|at least 5 english words/i.test(promptLower);
      if (!hasLengthReq) {
        flagFinding("P1", "productionPrompt", "B1 production prompt must explicitly demand at least five words");
      }
      const hasCommunicativeIntent =
        /explain|describe|tell|ask|invite|remind|advise|congratulate|suggest|express|instruct|thank|talk about|give advice|share|list|name|call|wish|promise|recommend|warn|complain|discuss|direct|encourage|hurry|check|outline|summarize|reflect|state|give|provide/i.test(promptLower);
      if (!hasCommunicativeIntent) {
        flagFinding("P1", "productionPrompt", "B1 production prompt lacks communicative functional goal");
      }
    } else if (question.level === "B2") {
      const hasRationaleOrRegister =
        /rationale|formal|professional|register|policy|merger|in a formal|explain why|argue why/i.test(promptLower);
      if (!hasRationaleOrRegister) {
        flagFinding("P1", "productionPrompt", "B2 production requires rationale or register specification");
      }
    } else if (question.level === "C1") {
      const hasCriticalOrEvidence =
        /critical|critically|evidence|synthesize|analytical|analyze|evaluate|disclosures|geopolitical/i.test(promptLower);
      if (!hasCriticalOrEvidence) {
        flagFinding("P1", "productionPrompt", "C1 production requires critical analysis, evidence, or synthesis");
      }
    } else if (question.level === "C2") {
      const isNaive =
        /^(?:write a (?:short )?sentence|explain the word|use the word in a sentence|tell a (?:simple )?story|write about|use .* in an? (?:easy|daily|simple))\b/i.test(promptLower.trim());
      const hasSpecialistDomainOrNuance =
        /critique|evaluate|assess|analyze|analysis|argue|discuss|describe|explain|draft|detail|formulate|summarize|contrast|demonstrate|outline|how (?:can|should|does|do|would)|why|what|defend|defence|defense|justify|provide|question|propose|examine|investigate|decision|evidence|nuance|specialist|framework|policy|model|protocol|register|recommend|synthesize|diplomatic|appeal/i.test(promptLower);
      if (isNaive || !hasSpecialistDomainOrNuance) {
        flagFinding("P1", "productionPrompt", "C2 production prompt requires specialist domain or nuanced critical task");
      }
    }

    if (context?.overusedPromptIds?.has(question.id)) {
      flagFinding("P1", "productionPrompt", "production prompt template repeated across 5 or more items in catalogue");
    }

    // Trailing whitespace styling
    if (/\s+$/.test(question.productionPrompt || "")) {
      flagFinding("P3", "productionPrompt", "prompt punctuation or whitespace formatting suggestion");
    }
  }

  // 21. source
  if (!question.source || typeof question.source !== "string" || question.source.trim().length === 0) {
    flagFinding("P0", "source", "source provenance missing or empty");
  }

  // 22. status
  const validStatus = ["published", "draft", "archived"];
  if (!question.status || !validStatus.includes(question.status)) {
    flagFinding("P0", "status", "status missing or invalid");
  }

  // 23. editorialStatus & human review evidence
  const validEditorialStatus = ["approved", "needs_review", "rejected"];
  if (!question.editorialStatus || !validEditorialStatus.includes(question.editorialStatus)) {
    flagFinding("P0", "editorialStatus", "editorialStatus missing or invalid");
  } else if (question.editorialStatus === "approved") {
    // Release-blocking: approved item MUST have valid review evidence
    const review = question.editorialReview;
    if (
      !review?.reviewId ||
      !review.reviewerId ||
      !review.reviewedAt ||
      !review.rubricVersion ||
      review.decision !== "approved"
    ) {
      flagFinding("P0", "editorialStatus", "approved item lacks verifiable human review evidence");
    } else if (review.reviewedAt !== question.reviewedAt || review.reviewerId !== question.reviewer) {
      flagFinding("P0", "editorialStatus", "approved item review evidence does not match reviewer provenance");
    }
  }

  // Context note check for polysemous words
  if (!question.contextNote && question.level === "C1" && question.word === "sanction") {
    flagFinding("P2", "meaning", "polysemous advanced word recommended to provide contextNote");
  }

  return {
    itemId: question.id,
    level: question.level,
    errors,
    warnings,
    informational,
    fieldResults,
  };
}

function auditOne(question: MeaningMatchQuestion): string[] {
  const errors: string[] = [];
  const options = question.options || [question.meaning, ...(question.wrongOptions || [])];
  if (!question.senseId) errors.push("senseId missing");
  if (!question.cefr || question.cefr !== question.level) errors.push("CEFR level missing or mismatched");
  if (!question.learningItemKind) errors.push("learningItemKind missing");
  if (!question.register) errors.push("register missing");
  if (!question.phonetic) errors.push("IPA phonetic missing");
  if (question.level === "C2" && !question.collocation) errors.push("collocation missing");
  if (question.level === "C2" && !question.productionPrompt) errors.push("production prompt missing");
  if (question.level === "B1") {
    if (/explain how to\s+(?:heavy|key|meeting|efficient|flexible|reliable|top|staff|respectful|famous|remote|crowded|train|delay|insurance|departure|arrival|destination|memorable|authentic|cultural|custom|guidebook|journey|adventure|souvenir|hospitality|broadcast|source|accurate|biased|audience|trend|access|community|inequality|opportunity|volunteer|protest|regulation|public|debate|responsible|diverse|option|consequence|advantage|drawback|strategy|practical|realistic|ambitious|independent|alternative|outcome|the\b|a\b|an\b)/i.test(question.productionPrompt || "")) {
      errors.push("broken production prompt syntax: 'Explain how to' requires base verb, not noun phrase or adjective");
    }
  }
  if (!question.source) errors.push("editorial provenance missing");
  if (question.editorialStatus === "approved") {
    const review = question.editorialReview;
    if (!review?.reviewId || !review.reviewerId || !review.reviewedAt || !review.rubricVersion || review.decision !== "approved") {
      errors.push("approved item lacks verifiable human review evidence");
    } else if (review.reviewedAt !== question.reviewedAt || review.reviewerId !== question.reviewer) {
      errors.push("approved item review evidence does not match reviewer provenance");
    }
  }
  const example = question.exampleSentence?.toLocaleLowerCase("en") || "";
  if (/\bin case\s+\d+\b/i.test(example)) errors.push("example contains artificial numbered context marker");
  if (
    (/^the report uses\b/.test(example) || /^the specialist presentation addressed\b/.test(example)) &&
    question.partOfSpeech !== "noun"
  ) errors.push("example places target in an incompatible grammatical slot");
  const target = (question.word || "").toLocaleLowerCase("en").trim();
  const phraseParts = target.split(/…|\.\.\./).map((part) => part.trim()).filter(Boolean);
  const wordForms = new Set([target]);
  if (phraseParts.length === 1) {
    (IRREGULAR_EXAMPLE_FORMS[target] || []).forEach((form) => wordForms.add(form));
    if (target.endsWith("y")) {
      wordForms.add(`${target.slice(0, -1)}ies`);
      wordForms.add(`${target.slice(0, -1)}ied`);
    }
    wordForms.add(`${target}s`);
    wordForms.add(`${target}es`);
    wordForms.add(`${target}ed`);
    wordForms.add(`${target}ing`);
    if (target.endsWith("e")) {
      wordForms.add(`${target}d`);
      wordForms.add(`${target.slice(0, -1)}ing`);
    }
    wordForms.add(`${target}ly`);
  }
  const phraseContentMatches = () => {
    const targetWords = target.match(/[a-z]+/g)?.filter((word) => !PHRASE_FUNCTION_WORDS.has(word)) || [];
    const exampleWords = example.match(/[a-z]+/g) || [];
    return targetWords.length > 0 && targetWords.every((word) => exampleWords.some((candidate) =>
      candidate === word || candidate.startsWith(word) || (word.endsWith("e") && candidate.startsWith(word.slice(0, -1))) || (IRREGULAR_PHRASE_FORMS[word] || []).includes(candidate)
    ));
  };
  const targetInExample = phraseParts.length > 1
    ? phraseParts.reduce((lastIndex, part) => lastIndex < 0 ? -1 : example.indexOf(part, lastIndex), 0) >= 0
    : [...wordForms].some((form) => example.includes(form)) || (question.learningItemKind === "phrase" && phraseContentMatches());
  if (!targetInExample) errors.push("example does not contain target");
  const translation = question.exampleTranslation || "";
  if (!translation || GENERIC_CONTEXT.some((rule) => rule.test(translation)) || /\bin case\s+\d+\b/i.test(translation)) errors.push("generic, artificial, or missing Turkish example");
  if (!question.wrongOptions || question.wrongOptions.length !== 2 || new Set(question.wrongOptions).size !== 2 || question.wrongOptions.includes(question.meaning)) errors.push("invalid distractors");
  if (options.length !== 3 || new Set(options).size !== 3 || !options.includes(question.meaning)) errors.push("invalid answer options");
  return errors;
}

/**
 * Runs the non-negotiable publication checks across multiple questions.
 * Preserves backward compatibility with existing tests.
 */
export function auditEditorialQuestions(questions: MeaningMatchQuestion[]): EditorialAudit {
  const errors = questions.flatMap((question) => auditOne(question).map((error) => `${question.id}: ${error}`));
  const byExample = new Map<string, string[]>();
  const byTranslation = new Map<string, string[]>();
  const byDistractorPair = new Map<string, string[]>();
  questions.forEach((question) => {
    const normalisedExample = normaliseExample(question);
    if (normalisedExample) {
      const signature = templateSignature(normalisedExample);
      byExample.set(signature, [...(byExample.get(signature) || []), question.id]);
    }
    const normalisedTranslation = normaliseTranslation(question);
    if (normalisedTranslation) {
      const signature = translationTemplateSignature(normalisedTranslation);
      byTranslation.set(signature, [...(byTranslation.get(signature) || []), question.id]);
    }
    const pair = [...(question.wrongOptions || [])].map((option) => option.trim().toLocaleLowerCase("tr")).sort().join("|");
    if (pair) byDistractorPair.set(pair, [...(byDistractorPair.get(pair) || []), question.id]);
  });
  const templateExampleIds = [...byExample.values()].filter((ids) => ids.length >= 3).flat();
  if (templateExampleIds.length) errors.push(`Repeated example skeletons: ${templateExampleIds.join(", ")}`);
  const templateTranslationIds = [...byTranslation.values()].filter((ids) => ids.length >= 3).flat();
  if (templateTranslationIds.length) errors.push(`Repeated Turkish translation skeletons: ${templateTranslationIds.join(", ")}`);
  const overusedDistractorIds = [...byDistractorPair.values()].filter((ids) => ids.length >= 5).flat();
  if (overusedDistractorIds.length) errors.push(`Overused distractor pairs: ${overusedDistractorIds.join(", ")}`);
  const warnings = questions
    .filter((question) => question.editorialStatus !== "approved")
    .map((question) => `${question.id}: editorialStatus is ${question.editorialStatus || "missing"}`);
  return { approved: errors.length === 0 && warnings.length === 0, errors, warnings, templateExampleIds, templateTranslationIds, overusedDistractorIds };
}

/**
 * Audits an entire catalogue and generates multi-dimensional metrics.
 */
export function auditCatalogueQuality(questions: MeaningMatchQuestion[]) {
  const byExample = new Map<string, string[]>();
  const byTranslation = new Map<string, string[]>();
  const byDistractorPair = new Map<string, string[]>();
  const senseMap = new Map<string, string[]>();
  const byPrompt = new Map<string, string[]>();
  const byCollocation = new Map<string, string[]>();

  questions.forEach((q) => {
    const normEx = normaliseExample(q);
    if (normEx) {
      const sig = templateSignature(normEx);
      byExample.set(sig, [...(byExample.get(sig) || []), q.id]);
    }
    const normTr = normaliseTranslation(q);
    if (normTr) {
      const sig = translationTemplateSignature(normTr);
      byTranslation.set(sig, [...(byTranslation.get(sig) || []), q.id]);
    }
    const pair = [...(q.wrongOptions || [])].map((o) => o.trim().toLocaleLowerCase("tr")).sort().join("|");
    if (pair) byDistractorPair.set(pair, [...(byDistractorPair.get(pair) || []), q.id]);

    if (q.senseId) {
      senseMap.set(q.senseId, [...(senseMap.get(q.senseId) || []), q.id]);
    }

    if (q.productionPrompt) {
      const pNorm = q.productionPrompt.toLowerCase().replace(/['"‘“][a-z0-9 -]+['"’”]/gi, "{TARGET}").trim();
      byPrompt.set(pNorm, [...(byPrompt.get(pNorm) || []), q.id]);
    }

    if (q.collocation) {
      const cNorm = q.collocation.toLowerCase().trim();
      byCollocation.set(cNorm, [...(byCollocation.get(cNorm) || []), q.id]);
    }
  });

  const templateExampleIds = new Set([...byExample.values()].filter((ids) => ids.length >= 3).flat());
  const templateTranslationIds = new Set([...byTranslation.values()].filter((ids) => ids.length >= 3).flat());
  const overusedDistractorPairs = new Set(
    [...byDistractorPair.entries()].filter(([, ids]) => ids.length >= 5).map(([pair]) => pair)
  );
  const duplicateSenseIds = new Set(
    [...senseMap.entries()].filter(([, ids]) => ids.length > 1).map(([senseId]) => senseId)
  );
  const overusedPromptIds = new Set(
    [...byPrompt.values()].filter((ids) => ids.length >= 5).flat()
  );
  const overusedCollocations = new Set(
    [...byCollocation.entries()].filter(([, ids]) => ids.length >= 5).map(([col]) => col)
  );

  const context: CatalogueAuditContext = {
    templateExampleIds,
    templateTranslationIds,
    overusedDistractorPairs,
    duplicateSenseIds,
    overusedPromptIds,
    overusedCollocations,
  };

  const itemResults = questions.map((q) => auditItemDetailed(q, context));
  return {
    itemResults,
    context,
    templateExampleCount: templateExampleIds.size,
    templateTranslationCount: templateTranslationIds.size,
    overusedDistractorPairCount: overusedDistractorPairs.size,
    duplicateSenseCount: duplicateSenseIds.size,
  };
}

/** Creates a publishable question only after all required editorial data is supplied. */
export function createEditorialQuestion(draft: EditorialQuestionDraft): MeaningMatchQuestion {
  const question: MeaningMatchQuestion = {
    ...draft,
    mode: "MEANING_MATCH",
    prompt: draft.word,
    answer: draft.meaning,
    options: [draft.meaning, ...draft.wrongOptions],
    status: "published",
    editorialStatus: "approved" as EditorialStatus,
    editorialReview: draft.editorialReview,
  };
  const audit = auditEditorialQuestions([question]);
  if (!audit.approved) throw new Error(`Editorial question rejected: ${audit.errors.join("; ")}`);
  return question;
}

export interface ItemDoDValidationResult {
  passed: boolean;
  failures: string[];
}

/**
 * Validates the strict Item Definition of Done (S2 contract).
 * Applies to release-ready items.
 */
export function validateItemDefinitionOfDone(question: MeaningMatchQuestion): ItemDoDValidationResult {
  const failures: string[] = [];

  // 1. Example sentence & translation
  if (!question.exampleSentence || question.exampleSentence.trim().length === 0) {
    failures.push("exampleSentence is missing or empty");
  }
  if (!question.exampleTranslation || question.exampleTranslation.trim().length === 0) {
    failures.push("exampleTranslation is missing or empty");
  }

  // 2. IPA phonetic
  if (!question.phonetic || !/^\/?[a-zA-Z0-9ˈˌːæɑɔəɛɪʊʌθðʃʒŋʔ:. -]+\/?$/.test(question.phonetic.trim())) {
    failures.push("phonetic is missing or not a valid IPA transcription");
  }

  // 3. Unique senseId
  if (!question.senseId || question.senseId.trim().length === 0) {
    failures.push("senseId is missing");
  }

  // 4. Collocation
  if (!question.collocation || question.collocation.trim().length === 0) {
    failures.push("collocation is missing");
  } else {
    const collowNorm = question.collocation.toLowerCase().replace(/[^a-z0-9 ]/g, " ").trim();
    const exampleNorm = (question.exampleSentence || "").toLowerCase().replace(/[^a-z0-9 ]/g, " ");
    const promptNorm = (question.productionPrompt || "").toLowerCase().replace(/[^a-z0-9 ]/g, " ");
    const colWords = collowNorm.split(/\s+/).filter(Boolean);
    const appearsInExample = colWords.every((w) => exampleNorm.includes(w));
    const appearsInPrompt = colWords.every((w) => promptNorm.includes(w));
    if (!appearsInExample && !appearsInPrompt) {
      failures.push("collocation does not appear in example sentence or production prompt");
    }
  }

  // 5. Production prompt enforces target
  if (!question.productionPrompt || question.productionPrompt.trim().length === 0) {
    failures.push("productionPrompt is missing");
  } else {
    const promptLower = question.productionPrompt.toLowerCase();
    const targetLower = question.word.toLowerCase();
    const hasTargetMention =
      promptLower.includes(targetLower) ||
      promptLower.includes(`"${targetLower}"`) ||
      promptLower.includes(`'${targetLower}'`);
    if (!hasTargetMention) {
      failures.push("productionPrompt does not enforce the target word/phrase");
    }
  }

  // 6. Exactly 2 distractors with different values
  if (!question.wrongOptions || question.wrongOptions.length !== 2) {
    failures.push("exactly 2 distractors required");
  } else if (new Set(question.wrongOptions).size !== 2 || question.wrongOptions.includes(question.meaning)) {
    failures.push("distractors must be distinct and cannot equal the correct meaning");
  }

  // 7. Automated audit errors must be 0
  const audit = auditEditorialQuestions([question]);
  if (audit.errors.length > 0) {
    failures.push(...audit.errors);
  }

  // 8. Editorial review evidence
  const records = question.editorialReviews || [];
  const approvedRoles = records
    .filter((r) => r.decision === "approved" && r.reviewerId && r.reviewedAt)
    .map((r) => r.role);
  const requiredRoles = ["english_usage_editor", "turkish_translation_editor", "cefr_curriculum_expert", "final_decider"];
  const missingRoles = requiredRoles.filter((role) => !approvedRoles.includes(role as any));
  if (missingRoles.length > 0) {
    failures.push(`missing human reviewer approvals for: ${missingRoles.join(", ")}`);
  }

  return {
    passed: failures.length === 0,
    failures,
  };
}

/**
 * Formats a question into the 23-field item delivery form specified in Sprint Plan 36 Section 6.
 */
export function formatItemDeliveryForm(question: MeaningMatchQuestion): string {
  const records = question.editorialReviews || [];
  const getDecision = (role: string) => records.find((r) => r.role === role)?.decision || "pending";
  const finalReview = question.editorialReview;

  return [
    `itemId: ${question.id}`,
    `level: ${question.level}`,
    `topic: ${question.topic}`,
    `word: ${question.word}`,
    `meaning: ${question.meaning}`,
    `partOfSpeech: ${question.partOfSpeech || ""}`,
    `senseId: ${question.senseId || ""}`,
    `exampleSentence: ${question.exampleSentence || ""}`,
    `exampleTranslation: ${question.exampleTranslation || ""}`,
    `phonetic: ${question.phonetic || ""}`,
    `collocation: ${question.collocation || ""}`,
    `productionPrompt: ${question.productionPrompt || ""}`,
    `wrongOptions: ${(question.wrongOptions || []).join(" | ")}`,
    `register: ${question.register || ""}`,
    `cefr: ${question.cefr || question.level}`,
    `source: ${question.source || ""}`,
    `automaticAudit: ${auditEditorialQuestions([question]).errors.length === 0 ? "pass" : "fail"}`,
    `englishUsageReview: ${getDecision("english_usage_editor") === "approved" ? "pass" : "revision_required"}`,
    `turkishTranslationReview: ${getDecision("turkish_translation_editor") === "approved" ? "pass" : "revision_required"}`,
    `cefrReview: ${getDecision("cefr_curriculum_expert") === "approved" ? "pass" : "revision_required"}`,
    `finalDecision: ${finalReview?.decision || "blocked"}`,
    `reviewId: ${finalReview?.reviewId || ""}`,
    `reviewerId: ${finalReview?.reviewerId || ""}`,
    `reviewedAt: ${finalReview?.reviewedAt || ""}`,
    `rubricVersion: ${finalReview?.rubricVersion || ""}`,
  ].join("\n");
}

/**
 * Calibration dataset for validating the automated audit gate (S2 exit criteria).
 */
export const CALIBRATION_FIXTURES = {
  positives: [
    {
      id: "calib-pos-a1",
      mode: "MEANING_MATCH" as const,
      level: "A1" as const,
      cefr: "A1" as const,
      topic: "Daily Routine",
      topicId: "a1-daily",
      unitId: "u1",
      lessonId: "l1",
      word: "breakfast",
      meaning: "kahvaltı",
      partOfSpeech: "noun" as const,
      learningItemKind: "word" as const,
      register: "neutral" as const,
      senseId: "breakfast-meal-morning",
      phonetic: "/ˈbrekfəst/",
      exampleSentence: "I usually have a quick breakfast before school.",
      exampleTranslation: "Okula gitmeden önce genellikle hızlı bir kahvaltı yaparım.",
      collocation: "have breakfast",
      productionPrompt: "What do you usually eat for breakfast? Use 'breakfast' in your answer.",
      wrongOptions: ["akşam yemeği", "öğle yemeği"] as [string, string],
      xp: 10,
      source: "Oxford 3000 / Cambridge A1",
      status: "draft" as const,
      editorialStatus: "needs_review" as const,
    },
    {
      id: "calib-pos-c2",
      mode: "MEANING_MATCH" as const,
      level: "C2" as const,
      cefr: "C2" as const,
      topic: "Precise Expression",
      topicId: "c2-precise",
      unitId: "u1",
      lessonId: "l1",
      word: "ubiquitous",
      meaning: "her yerde bulunan",
      partOfSpeech: "adjective" as const,
      learningItemKind: "word" as const,
      register: "formal" as const,
      senseId: "ubiquitous-present-everywhere",
      phonetic: "/juːˈbɪkwɪtəs/",
      exampleSentence: "Smartphones have become ubiquitous across modern urban society.",
      exampleTranslation: "Akıllı telefonlar modern kent toplumunda her yerde bulunur hale geldi.",
      collocation: "become ubiquitous",
      productionPrompt: "Describe a modern technology that has become ubiquitous in daily life. Use 'ubiquitous'.",
      wrongOptions: ["nadir görülen", "tartışmalı"] as [string, string],
      xp: 15,
      source: "Academic Word List / C2 Corpus",
      status: "draft" as const,
      editorialStatus: "needs_review" as const,
    },
  ],
  negatives: [
    {
      id: "calib-neg-numbered",
      mode: "MEANING_MATCH" as const,
      level: "C2" as const,
      cefr: "C2" as const,
      topic: "Precise Expression",
      topicId: "c2-precise",
      unitId: "u1",
      lessonId: "l1",
      word: "nuance",
      meaning: "ince fark",
      partOfSpeech: "noun" as const,
      learningItemKind: "word" as const,
      register: "academic" as const,
      senseId: "nuance-subtle-distinction",
      phonetic: "/ˈnjuːɑːns/",
      exampleSentence: "In case 42, the analysis showed a subtle nuance in tone.",
      exampleTranslation: "Vaka 42 bağlamında analiz tonlamada ince bir fark gösterdi.",
      collocation: "subtle nuance",
      productionPrompt: "Explain the nuance in your decision.",
      wrongOptions: ["büyük hata", "kesin sonuç"] as [string, string],
      xp: 15,
      source: "synthetic",
      status: "draft" as const,
      editorialStatus: "needs_review" as const,
      expectedError: "artificial numbered context marker",
    },
    {
      id: "calib-neg-generic-tr",
      mode: "MEANING_MATCH" as const,
      level: "B2" as const,
      cefr: "B2" as const,
      topic: "Business",
      topicId: "b2-biz",
      unitId: "u1",
      lessonId: "l1",
      word: "negotiate",
      meaning: "müzakere etmek",
      partOfSpeech: "verb" as const,
      learningItemKind: "word" as const,
      register: "professional" as const,
      senseId: "negotiate-deal",
      phonetic: "/nɪˈɡəʊʃieɪt/",
      exampleSentence: "We need to negotiate the contract terms with the supplier.",
      exampleTranslation: "Bu kelime müzakere etmek bağlamında kullanılır.",
      collocation: "negotiate terms",
      productionPrompt: "Describe how you negotiate terms with partners.",
      wrongOptions: ["iptal etmek", "onaylamak"] as [string, string],
      xp: 10,
      source: "synthetic",
      status: "draft" as const,
      editorialStatus: "needs_review" as const,
      expectedError: "generic, artificial, or missing Turkish example",
    },
    {
      id: "calib-neg-pos-slot",
      mode: "MEANING_MATCH" as const,
      level: "C2" as const,
      cefr: "C2" as const,
      topic: "Discourse",
      topicId: "c2-disc",
      unitId: "u1",
      lessonId: "l1",
      word: "mitigate",
      meaning: "hafifletmek",
      partOfSpeech: "verb" as const,
      learningItemKind: "word" as const,
      register: "formal" as const,
      senseId: "mitigate-risk",
      phonetic: "/ˈmɪtɪɡeɪt/",
      exampleSentence: "The report uses mitigate in its central analysis.",
      exampleTranslation: "Rapor merkezi analizinde hafifletmek ifadesini kullanır.",
      collocation: "mitigate risk",
      productionPrompt: "Use mitigate to explain risk reduction.",
      wrongOptions: ["artırmak", "yok saymak"] as [string, string],
      xp: 15,
      source: "template",
      status: "draft" as const,
      editorialStatus: "needs_review" as const,
      expectedError: "incompatible grammatical slot",
    },
  ],
};
