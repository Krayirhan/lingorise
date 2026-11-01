import { en } from "../../src/i18n/en";
import { allQuestions } from "../support/bundledCatalogue";
import { auditEditorialQuestions } from "../../src/content/editorialQuality";
import { C } from "../../src/theme/colors";
import { assert } from "../support/assertions";

// 62. Item Definition of Done, 23-Field Delivery Form & Quality Calibration (Sprint Plan S2):
console.log("\n62. Item Definition of Done, Delivery Form & Calibration (Sprint Plan S2):");
{
  const {
    validateItemDefinitionOfDone,
    formatItemDeliveryForm,
    CALIBRATION_FIXTURES,
    auditEditorialQuestions,
  } = require("../../src/content/editorialQuality");

  // A. Item Definition of Done
  const incompleteItem = {
    ...allQuestions[0],
    collocation: "invalid collocation not in example",
    productionPrompt: "Write a sentence without target.",
    editorialReviews: [],
  };
  const dodFail = validateItemDefinitionOfDone(incompleteItem);
  assert(!dodFail.passed, "Incomplete item fails Item Definition of Done");
  assert(dodFail.failures.some((f: string) => f.includes("collocation does not appear")), "DoD catches collocation mismatch");
  assert(dodFail.failures.some((f: string) => f.includes("productionPrompt does not enforce")), "DoD catches target-lacking production prompt");
  assert(dodFail.failures.some((f: string) => f.includes("missing human reviewer approvals")), "DoD catches missing 4-role approvals");

  // Valid complete item
  const validCompleteItem = {
    id: "dod-valid-item-01",
    mode: "MEANING_MATCH",
    level: "A1",
    cefr: "A1",
    topic: "Food",
    topicId: "a1-food",
    unitId: "u1",
    lessonId: "l1",
    word: "apple",
    meaning: "elma",
    partOfSpeech: "noun",
    learningItemKind: "word",
    register: "neutral",
    senseId: "apple-fruit",
    phonetic: "/ˈæpl/",
    exampleSentence: "I eat a fresh red apple every morning.",
    exampleTranslation: "Her sabah taze bir kırmızı elma yerim.",
    collocation: "red apple",
    productionPrompt: "Do you like to eat an apple? Use 'apple' in your answer.",
    wrongOptions: ["armut", "portakal"],
    xp: 10,
    source: "Oxford 3000",
    status: "published",
    editorialStatus: "approved",
    editorialReviews: [
      { reviewId: "r1", reviewerId: "ed_en", role: "english_usage_editor", reviewedAt: "2026-09-12T10:00:00Z", rubricVersion: "2026.09.p1", decision: "approved" },
      { reviewId: "r2", reviewerId: "ed_tr", role: "turkish_translation_editor", reviewedAt: "2026-09-12T10:00:00Z", rubricVersion: "2026.09.p1", decision: "approved" },
      { reviewId: "r3", reviewerId: "ed_cefr", role: "cefr_curriculum_expert", reviewedAt: "2026-09-12T10:00:00Z", rubricVersion: "2026.09.p1", decision: "approved" },
      { reviewId: "r4", reviewerId: "ed_final", role: "final_decider", reviewedAt: "2026-09-12T10:00:00Z", rubricVersion: "2026.09.p1", decision: "approved" },
    ],
    editorialReview: {
      reviewId: "r4",
      reviewerId: "ed_final",
      reviewedAt: "2026-09-12T10:00:00Z",
      rubricVersion: "2026.09.p1",
      decision: "approved",
    },
    reviewer: "ed_final",
    reviewedAt: "2026-09-12T10:00:00Z",
  };
  const dodPass = validateItemDefinitionOfDone(validCompleteItem as any);
  assert(dodPass.passed, "Fully compliant item passes Item Definition of Done");

  // B. 23-Field Delivery Form
  const formattedForm = formatItemDeliveryForm(validCompleteItem);
  const requiredKeys = [
    "itemId:", "level:", "topic:", "word:", "meaning:", "partOfSpeech:", "senseId:",
    "exampleSentence:", "exampleTranslation:", "phonetic:", "collocation:", "productionPrompt:",
    "wrongOptions:", "register:", "cefr:", "source:", "automaticAudit:", "englishUsageReview:",
    "turkishTranslationReview:", "cefrReview:", "finalDecision:", "reviewId:", "reviewerId:",
    "reviewedAt:", "rubricVersion:"
  ];
  const allKeysPresent = requiredKeys.every((key) => formattedForm.includes(key));
  assert(allKeysPresent, "23-field delivery form includes all required specification keys");

  // C. Quality Audit Calibration Fixtures
  // Positives must pass with 0 errors
  for (const posItem of CALIBRATION_FIXTURES.positives) {
    const auditRes = auditEditorialQuestions([posItem as any]);
    assert(auditRes.errors.length === 0, `Positive calibration item ${posItem.id} passes automated audit without errors`);
  }

  // Negatives must be caught by automated audit with expected reason
  for (const negItem of CALIBRATION_FIXTURES.negatives) {
    const auditRes = auditEditorialQuestions([negItem as any]);
    assert(auditRes.errors.length > 0, `Negative calibration item ${negItem.id} is caught by automated audit`);
    assert(
      auditRes.errors.some((err: string) => err.includes(negItem.expectedError)),
      `Negative calibration item ${negItem.id} triggers expected error '${negItem.expectedError}'`
    );
  }

  // D. Canonical 23-Field Automated Audit & Priority Classification (Sprint Plan S2)
  const {
    auditItemDetailed,
    auditIpaProvenance,
    auditCatalogueQuality,
    MANDATORY_AUDIT_FIELDS,
  } = require("../../src/content/editorialQuality");
  const { CALIBRATION_FIXTURES_40 } = require("../fixtures/editorialAuditCalibration");

  // 1. Mandatory field count and coverage test
  assert(MANDATORY_AUDIT_FIELDS.length === 23, "Audit system checks exactly 23 required fields");
  const sampleAudit = auditItemDetailed(validCompleteItem as any);
  assert(
    MANDATORY_AUDIT_FIELDS.every((field: string) => field in sampleAudit.fieldResults),
    "Audit result produces fieldResults for all 23 fields"
  );
  assert(
    (Object.values(sampleAudit.fieldResults) as string[]).every((st) => ["pass", "revision_required", "blocked", "not_applicable"].includes(st)),
    "Field audit results are strictly one of: pass, revision_required, blocked, not_applicable"
  );

  // 2. Eksik zorunlu alan testi (Missing mandatory field test)
  const missingFieldItem = { ...validCompleteItem, word: "" };
  const missingFieldRes = auditItemDetailed(missingFieldItem as any);
  assert(missingFieldRes.errors.some((e: any) => e.priority === "P0" && e.field === "word"), "Eksik zorunlu alan testi (word) P0 olarak yakalanır");
  assert(missingFieldRes.fieldResults.word === "blocked", "Eksik alan fieldResult = blocked üretir");

  // 3. Yanlış CEFR testi (Wrong CEFR test)
  const wrongCefrItem = { ...validCompleteItem, level: "A1", cefr: "C2" };
  const wrongCefrRes = auditItemDetailed(wrongCefrItem as any);
  assert(wrongCefrRes.errors.some((e: any) => e.priority === "P0" && e.field === "cefr"), "Yanlış CEFR testi P0 olarak yakalanır");
  assert(wrongCefrRes.fieldResults.cefr === "blocked", "CEFR uyuşmazlığı blocked üretir");

  // 4. Eksik senseId testi (Missing senseId test)
  const missingSenseItem = { ...validCompleteItem, senseId: "" };
  const missingSenseRes = auditItemDetailed(missingSenseItem as any);
  assert(missingSenseRes.errors.some((e: any) => e.priority === "P0" && e.field === "senseId"), "Eksik senseId testi P0 olarak yakalanır");
  assert(missingSenseRes.fieldResults.senseId === "blocked", "Eksik senseId blocked üretir");

  // 5. Eksik POS testi (Missing POS test)
  const missingPosItem = { ...validCompleteItem, partOfSpeech: undefined };
  const missingPosRes = auditItemDetailed(missingPosItem as any);
  assert(missingPosRes.errors.some((e: any) => e.priority === "P0" && e.field === "partOfSpeech"), "Eksik POS testi P0 olarak yakalanır");
  assert(missingPosRes.fieldResults.partOfSpeech === "blocked", "Eksik POS blocked üretir");

  // 6. Eksik source testi (Missing source test)
  const missingSourceItem = { ...validCompleteItem, source: "" };
  const missingSourceRes = auditItemDetailed(missingSourceItem as any);
  assert(missingSourceRes.errors.some((e: any) => e.priority === "P0" && e.field === "source"), "Eksik source testi P0 olarak yakalanır");
  assert(missingSourceRes.fieldResults.source === "blocked", "Eksik source blocked üretir");

  // 7. Hedef kelime örnekte yok testi (Target missing in example test)
  const missingTargetItem = { ...validCompleteItem, word: "banana", exampleSentence: "I ate an orange." };
  const missingTargetRes = auditItemDetailed(missingTargetItem as any);
  assert(missingTargetRes.errors.some((e: any) => e.priority === "P0" && e.field === "exampleSentence"), "Hedef kelime örnekte yok testi P0 olarak yakalanır");
  assert(missingTargetRes.fieldResults.exampleSentence === "blocked", "Hedef kelime eksikliği blocked üretir");

  // 8. Yanlış Türkçe sense testi (Wrong Turkish sense test)
  const wrongSenseItem = { ...validCompleteItem, exampleTranslation: "Bu sözcük elma bağlamında kullanılır." };
  const wrongSenseRes = auditItemDetailed(wrongSenseItem as any);
  assert(wrongSenseRes.errors.some((e: any) => e.priority === "P0" && e.field === "exampleTranslation"), "Yanlış Türkçe sense / generic translation testi P0 olarak yakalanır");
  assert(wrongSenseRes.fieldResults.exampleTranslation === "blocked", "Yapay çeviri blocked üretir");

  // 9. Template example ve translation testi (Template example/translation test)
  const templateQuestions = [
    { ...validCompleteItem, id: "t1", word: "expand", exampleSentence: "The team will expand during project alpha." },
    { ...validCompleteItem, id: "t2", word: "grow", exampleSentence: "The team will grow during project beta." },
    { ...validCompleteItem, id: "t3", word: "build", exampleSentence: "The team will build during project gamma." },
  ];
  const templateAudit = auditCatalogueQuality(templateQuestions as any);
  assert(templateAudit.templateExampleCount >= 3, "Template example testi 3 veya daha fazla tekrarlanan şablonu yakalar");

  // 10. Yanlış collocation testi (Wrong collocation test)
  const badCollocItem = { ...validCompleteItem, collocation: "fresh water and" };
  const badCollocRes = auditItemDetailed(badCollocItem as any);
  assert(badCollocRes.errors.some((e: any) => e.priority === "P1" && e.field === "collocation"), "Yanlış collocation testi P1 olarak yakalanır (bağlaçla biten)");
  assert(badCollocRes.fieldResults.collocation === "revision_required", "Kusurlu collocation revision_required üretir");

  // 11. Tekrarlanan distractor testi (Repeated distractor pair test)
  const repeatedDistractorRes = auditItemDetailed(validCompleteItem as any, {
    overusedDistractorPairs: new Set([["armut", "portakal"].sort().join("|")]),
  });
  assert(repeatedDistractorRes.errors.some((e: any) => e.priority === "P1" && e.field === "wrongOptions"), "Tekrarlanan distractor testi P1 olarak yakalanır");

  // 12. Bozuk production prompt testi (Broken production prompt test)
  const brokenPromptItem = { ...validCompleteItem, productionPrompt: "Explain how to the apple in modern gardens." };
  const brokenPromptRes = auditItemDetailed(brokenPromptItem as any);
  assert(brokenPromptRes.errors.some((e: any) => e.priority === "P1" && e.field === "productionPrompt"), "Bozuk production prompt testi P1 olarak yakalanır");

  // 13. Hedefi zorunlu kılmayan production testi (Target not enforced in prompt test)
  const unenforcedPromptItem = { ...validCompleteItem, productionPrompt: "Write about your favorite fruit." };
  const unenforcedPromptRes = auditItemDetailed(unenforcedPromptItem as any);
  assert(unenforcedPromptRes.errors.some((e: any) => e.priority === "P1" && e.field === "productionPrompt"), "Hedefi zorunlu kılmayan production testi P1 olarak yakalanır");

  // 14. B2 gerekçe/register testi (B2 rationale/register test)
  const b2LackingItem = {
    ...validCompleteItem,
    level: "B2",
    cefr: "B2",
    word: "deficit",
    productionPrompt: "Write a short sentence with deficit.",
  };
  const b2LackingRes = auditItemDetailed(b2LackingItem as any);
  assert(b2LackingRes.errors.some((e: any) => e.priority === "P1" && e.field === "productionPrompt"), "B2 gerekçe/register testi P1 olarak yakalanır");

  // 15. C1 evidence/synthesis testi (C1 evidence/synthesis test)
  const c1LackingItem = {
    ...validCompleteItem,
    level: "C1",
    cefr: "C1",
    word: "substantiate",
    productionPrompt: "Tell a simple story using substantiate.",
  };
  const c1LackingRes = auditItemDetailed(c1LackingItem as any);
  assert(c1LackingRes.errors.some((e: any) => e.priority === "P1" && e.field === "productionPrompt"), "C1 evidence/synthesis testi P1 olarak yakalanır");

  // 16. C2 specialist-context testi (C2 specialist-context test)
  const c2LackingItem = {
    ...validCompleteItem,
    level: "C2",
    cefr: "C2",
    word: "ephemeral",
    productionPrompt: "Use ephemeral in an easy daily talk.",
  };
  const c2LackingRes = auditItemDetailed(c2LackingItem as any);
  assert(c2LackingRes.errors.some((e: any) => e.priority === "P1" && e.field === "productionPrompt"), "C2 specialist-context testi P1 olarak yakalanır");

  // 17. IPA provenance testi (IPA provenance test)
  const verifiedIpa = auditIpaProvenance(validCompleteItem as any);
  assert(verifiedIpa.verificationStatus === "verified", "Güvenilir sözlük kaynaklı IPA verified raporlanır");
  const unverifiedIpa = auditIpaProvenance({ ...validCompleteItem, source: "synthetic submission" } as any);
  assert(unverifiedIpa.verificationStatus === "pending", "Kaynaksız veya yapay IPA pending raporlanır");

  // 18. Review kanıtı olmayan approved item testi (Approved item without review evidence test)
  const unverifiedApprovedItem = {
    ...validCompleteItem,
    editorialStatus: "approved",
    editorialReview: undefined,
  };
  const unverifiedApprovedRes = auditItemDetailed(unverifiedApprovedItem as any);
  assert(unverifiedApprovedRes.errors.some((e: any) => e.priority === "P0" && e.field === "editorialStatus"), "Review kanıtı olmayan approved item testi P0 olarak yakalanır");

  // 19. Calibration Fixture Testi (40 fixture: 0 FP, 0 FN, 100% P0, 100% P1)
  assert(CALIBRATION_FIXTURES_40.length >= 40, `Calibration seti en az 40 fixture içerir (gerçek: ${CALIBRATION_FIXTURES_40.length})`);
  let calibFalsePositives = 0;
  let calibFalseNegatives = 0;
  let calibP0Caught = 0;
  let calibP0Total = 0;
  let calibP1Caught = 0;
  let calibP1Total = 0;

  for (const fixture of CALIBRATION_FIXTURES_40) {
    const res = auditItemDetailed(fixture.question);
    const hasP0 = res.errors.some((e: any) => e.priority === "P0");
    const hasP1 = res.errors.some((e: any) => e.priority === "P1");
    const hasAnyError = res.errors.length > 0;
    const hasWarning = res.warnings.length > 0;

    if (fixture.category === "PASS") {
      if (hasAnyError || hasWarning) {
        calibFalsePositives++;
      }
    } else if (fixture.category === "P0") {
      calibP0Total++;
      if (hasP0) {
        calibP0Caught++;
      } else {
        calibFalseNegatives++;
      }
    } else if (fixture.category === "P1") {
      calibP1Total++;
      if (hasP1) {
        calibP1Caught++;
      } else {
        calibFalseNegatives++;
      }
    }
  }

  assert(calibFalsePositives === 0, `Calibration false positive sayısı 0 olmalıdır (gerçek: ${calibFalsePositives})`);
  assert(calibFalseNegatives === 0, `Calibration false negative sayısı 0 olmalıdır (gerçek: ${calibFalseNegatives})`);
  assert(calibP0Caught === calibP0Total && calibP0Total >= 10, `P0 yakalama oranı %100 olmalıdır (${calibP0Caught}/${calibP0Total})`);
  assert(calibP1Caught === calibP1Total && calibP1Total >= 10, `P1 yakalama oranı %100 olmalıdır (${calibP1Caught}/${calibP1Total})`);
}


