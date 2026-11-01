import { getQuestionsByLevel, isLevelReady, isLevelEditoriallyApproved } from "../support/bundledCatalogue";
import { LevelCode } from "../../src/domain/models/content";
import { auditEditorialQuestions, createEditorialQuestion } from "../../src/content/editorialQuality";
import { A2_B1_PROGRESSION, getA2B1Progression } from "../../src/content/a2B1Progression";
import { assert } from "../support/assertions";

// 8. Progress Level Mastery Calculation Test
console.log("\n8. Progress & Level Breakdown:");
export const levels: LevelCode[] = ["A1", "A2", "B1", "B2", "C1", "C2"];
export const totalQuestionsAll = levels.reduce((acc, l) => acc + getQuestionsByLevel(l).length, 0);
assert(totalQuestionsAll === 1105, `All 6 levels verified with total ${totalQuestionsAll} curated questions`);
assert(isLevelReady("A1") && isLevelReady("A2"), "Only the reviewed-release baseline levels are selectable");
assert(["B1", "B2", "C1", "C2"].every((level) => !isLevelReady(level as LevelCode)), "B1–C2 are withheld during editorial remediation");
assert(
  levels.every((level) => getQuestionsByLevel(level).every((question) => Boolean(question.topicId && question.unitId && question.lessonId))),
  "Every published question has semantic curriculum identifiers"
);

console.log("\n9b. Editorial Content Quality Gate:");
export const editorialFixture = createEditorialQuestion({
  id: "editorial-fixture-consolidate",
  level: "B2",
  cefr: "B2",
  topic: "Tartışma ve İkna",
  topicId: "b2.argumentation",
  unitId: "b2.argumentation.u01",
  lessonId: "b2.argumentation.l01",
  senseId: "consolidate.v.combine",
  word: "consolidate",
  meaning: "birleştirmek",
  partOfSpeech: "verb",
  learningItemKind: "word",
  register: "professional",
  exampleSentence: "The team consolidated the survey findings before presenting its recommendation.",
  exampleTranslation: "Ekip, önerisini sunmadan önce anket bulgularını birleştirdi.",
  contextNote: "Raporlama bağlamında ayrı bilgileri tek, kullanılabilir bir bütünde toplamak.",
  hint: "Dağınık bilgileri tek bir bütün hâline getirmek.",
  pronunciation: "consolidate",
  phonetic: "/kənˈsɒl.ɪ.deɪt/",
  wrongOptions: ["ertelemek", "itiraz etmek"],
  reviewer: "LingoRise editorial QA",
  reviewedAt: "2026-09-11",
  editorialReview: { reviewId: "ED-1001", reviewerId: "LingoRise editorial QA", reviewedAt: "2026-09-11", rubricVersion: "2026.09", decision: "approved" },
  source: "Cambridge Dictionary + internal editorial review",
  difficulty: 3,
  xp: 25,
});
assert(editorialFixture.editorialStatus === "approved", "A fully authored editorial question can be published");
export const generatedB1Audit = auditEditorialQuestions(getQuestionsByLevel("B1"));
assert(!generatedB1Audit.approved, "The templated B1 catalogue cannot receive editorial approval");
assert(generatedB1Audit.templateExampleIds.length === 0, "Every B1 unit has independently authored example sentences");
assert(generatedB1Audit.templateTranslationIds.length === 0, "Every B1 unit has independently authored Turkish translations");
assert(generatedB1Audit.overusedDistractorIds.length === 0, "Every B1 unit avoids batch-wide recycled distractor pairs");
export const artificialMarkerAudit = auditEditorialQuestions([{ ...editorialFixture, id: "editorial-fixture-numbered-marker", exampleSentence: "The team will consolidate the report in case 42." }]);
assert(artificialMarkerAudit.errors.some((error) => error.includes("artificial numbered context marker")), "Numbered 'in case N' text is rejected as artificial context");
export const workplaceB1 = getQuestionsByLevel("B1").filter((question) => question.topic === "İş ve İş Birliği");
export const workplaceB1Audit = auditEditorialQuestions(workplaceB1);
assert(workplaceB1Audit.errors.length === 0, "B1 Workplace & Collaboration has no automated quality-gate errors");
assert(workplaceB1.every((question) => Boolean(question.productionPrompt && question.collocation)), "Every rewritten B1 workplace item teaches a collocation and prompts production");
export const travelB1 = getQuestionsByLevel("B1").filter((question) => question.topic === "Deneyimler ve Seyahat");
export const travelB1Audit = auditEditorialQuestions(travelB1);
assert(travelB1Audit.errors.length === 0, "B1 Experiences & Travel has no automated quality-gate errors");
assert(travelB1.every((question) => Boolean(question.productionPrompt && question.collocation)), "Every rewritten B1 travel item teaches a collocation and prompts production");
export const mediaB1 = getQuestionsByLevel("B1").filter((question) => question.topic === "Medya ve Toplum");
export const mediaB1Audit = auditEditorialQuestions(mediaB1);
assert(mediaB1Audit.errors.length === 0, "B1 Media & Society has no automated quality-gate errors");
assert(mediaB1.every((question) => Boolean(question.productionPrompt && question.collocation)), "Every rewritten B1 media item teaches a collocation and prompts production");
export const goalsB1 = getQuestionsByLevel("B1").filter((question) => question.topic === "Hedefler ve Kararlar");
export const goalsB1Audit = auditEditorialQuestions(goalsB1);
assert(goalsB1Audit.errors.length === 0, "B1 Goals & Decisions has no automated quality-gate errors");
assert(goalsB1.every((question) => Boolean(question.productionPrompt && question.collocation)), "Every rewritten B1 goals item teaches a collocation and prompts production");
export const generatedB2Audit = auditEditorialQuestions(getQuestionsByLevel("B2"));
assert(generatedB2Audit.templateExampleIds.length === 0, "Every B2 unit has independently authored example sentences");
assert(generatedB2Audit.templateTranslationIds.length === 0, "Every B2 unit has independently authored Turkish translations");
assert(generatedB2Audit.overusedDistractorIds.length === 0, "Every B2 unit avoids batch-wide recycled distractor pairs");
export const abstractB2 = getQuestionsByLevel("B2").filter((question) => question.topic === "Soyut Konular");
export const abstractB2Audit = auditEditorialQuestions(abstractB2);
assert(abstractB2Audit.errors.length === 0, "B2 Abstract Topics has no automated quality-gate errors");
assert(abstractB2.every((question) => Boolean(question.productionPrompt && question.collocation)), "Every rewritten B2 abstract item teaches a collocation and prompts production");
export const argumentB2 = getQuestionsByLevel("B2").filter((question) => question.topic === "Tartışma ve İkna");
export const argumentB2Audit = auditEditorialQuestions(argumentB2);
assert(argumentB2Audit.errors.length === 0, "B2 Argumentation & Persuasion has no automated quality-gate errors");
assert(argumentB2.every((question) => Boolean(question.productionPrompt && question.collocation)), "Every rewritten B2 argumentation item teaches a collocation and prompts production");
export const professionalB2 = getQuestionsByLevel("B2").filter((question) => question.topic === "Profesyonel İletişim");
export const professionalB2Audit = auditEditorialQuestions(professionalB2);
assert(professionalB2Audit.errors.length === 0, "B2 Professional Communication has no automated quality-gate errors");
assert(professionalB2.every((question) => Boolean(question.productionPrompt && question.collocation)), "Every rewritten B2 professional item teaches a collocation and prompts production");
export const generatedC1Audit = auditEditorialQuestions(getQuestionsByLevel("C1"));
assert(generatedC1Audit.templateExampleIds.length === 0, "Every C1 unit has independently authored example sentences");
assert(generatedC1Audit.templateTranslationIds.length === 0, "Every C1 unit has independently authored Turkish translations");
assert(generatedC1Audit.overusedDistractorIds.length === 0, "Every C1 unit avoids batch-wide recycled distractor pairs");
export const academicC1 = getQuestionsByLevel("C1").filter((question) => question.topic === "Akademik ve Profesyonel Dil");
export const academicC1Audit = auditEditorialQuestions(academicC1);
assert(academicC1Audit.errors.length === 0, "C1 Academic & Professional Language has no automated quality-gate errors");
assert(academicC1.every((question) => Boolean(question.phonetic && question.productionPrompt && question.collocation)), "Every rewritten C1 academic item has IPA, a collocation, and a production prompt");
export const nuanceC1 = getQuestionsByLevel("C1").filter((question) => question.topic === "Nüans ve Üslup");
export const nuanceC1Audit = auditEditorialQuestions(nuanceC1);
assert(nuanceC1Audit.errors.length === 0, "C1 Nuance & Register has no automated quality-gate errors");
assert(nuanceC1.every((question) => Boolean(question.phonetic && question.productionPrompt && question.collocation)), "Every rewritten C1 nuance item has IPA, a collocation, and a production prompt");
export const criticalC1 = getQuestionsByLevel("C1").filter((question) => question.topic === "Eleştirel Analiz");
export const criticalC1Audit = auditEditorialQuestions(criticalC1);
assert(criticalC1Audit.errors.length === 0, "C1 Critical Analysis has no automated quality-gate errors");
assert(criticalC1.every((question) => Boolean(question.phonetic && question.productionPrompt && question.collocation)), "Every rewritten C1 critical item has IPA, a collocation, and a production prompt");
export const incompatibleC1Audit = auditEditorialQuestions([{ ...criticalC1.find((question) => question.word === "scrutinize")!, exampleSentence: "The report uses scrutinize in its central analysis." }]);
assert(incompatibleC1Audit.errors.some((error) => error.includes("incompatible grammatical slot")), "C1 target words in incompatible report slots are rejected");
export const generatedC2Audit = auditEditorialQuestions(getQuestionsByLevel("C2"));
assert(generatedC2Audit.templateExampleIds.length === 0, "C2 has no repeated example skeletons");
assert(generatedC2Audit.templateTranslationIds.length === 0, "C2 has no repeated Turkish translation skeletons");
assert(generatedC2Audit.overusedDistractorIds.length === 0, "C2 has no repeated distractor pairs");
assert(generatedC2Audit.errors.length === 0, "C2's complete rewrite has zero automated audit errors");
assert(getQuestionsByLevel("C2").every((question) => Boolean(question.phonetic && question.collocation && question.productionPrompt && question.senseId && question.cefr && question.register)), "Every C2 item has IPA, collocation, production prompt, sense, CEFR and register metadata");
assert(getQuestionsByLevel("C2").length === 100, "C2 contains 50 items in each of its two rewritten sets");
export const generatedA2Audit = auditEditorialQuestions(getQuestionsByLevel("A2"));
assert(generatedA2Audit.overusedDistractorIds.length === 0, "A2 phrase distractors no longer use a batch-wide filler pair");
export const a2PhrasePairs = getQuestionsByLevel("A2").filter((question) => question.learningItemKind === "phrase").map((question) => question.wrongOptions.slice().sort().join("|"));
assert(new Set(a2PhrasePairs).size === a2PhrasePairs.length, "Every A2 phrase carries its own distractor pair");
assert(A2_B1_PROGRESSION.length === 22 && A2_B1_PROGRESSION.every((entry) => entry.releaseAction === "rewrite_before_release"), "Every known A2→B1 duplicate has a release-blocking progression contract");
assert(Boolean(getA2B1Progression("deadline")?.b1RequiredUseTr.includes("gecikme")), "A2→B1 progression records a genuinely new use target");
export const a2ProductionTopics = new Set(["Seyahat", "Seyahat & Keşif", "Teknoloji", "Sosyal Yaşam"]);
assert(getQuestionsByLevel("A2").filter((question) => a2ProductionTopics.has(question.topic)).every((question) => Boolean(question.productionPrompt)), "Travel, technology, and social A2 items carry a visible production prompt");
assert(!isLevelEditoriallyApproved("B1"), "B1 has no evidence-backed editorial approval");
assert(!isLevelEditoriallyApproved("A1"), "Legacy provenance fields alone are not human-review evidence");
assert(getQuestionsByLevel("A1").filter((question) => question.learningItemKind === "phrase").length >= 45, "A1 includes at least 45 independently learnable phrase items");
assert(getQuestionsByLevel("A1").every((question) => Boolean(question.phonetic && question.senseId && question.cefr && question.reviewer)), "Every A1 item has IPA, sense, CEFR, and review metadata");

