import { auditEditorialQuestions } from "../../src/content/editorialQuality";
import { assert } from "../support/assertions";

// 64. A1 Basic Production, Collocations & Distractor Matching (Sprint Plan S4):
console.log("\n64. A1 Basic Production, Collocations & Distractor Matching (Sprint Plan S4):");
{
  const { a1Questions } = require("../../src/content/questions/a1");
  const { a2Questions } = require("../../src/content/questions/a2");
  const { b1Questions } = require("../../src/content/questions/b1");
  const { b2Questions } = require("../../src/content/questions/b2");
  const { c1Questions } = require("../../src/content/questions/c1");
  const { c2Questions } = require("../../src/content/questions/c2");
  const { auditEditorialQuestions, auditItemDetailed, auditCatalogueQuality } = require("../../src/content/editorialQuality");
  const { hasVerifiableHumanApproval } = require("../../src/content/editorialReviewWorkflow");

  // 1. Inventory counts
  assert(a1Questions.length === 365, "A1 catalogue contains exactly 365 items (actual: " + a1Questions.length + ")");
  const a1Core = a1Questions.filter((q: any) => q.learningItemKind === "word");
  const a1Phrases = a1Questions.filter((q: any) => q.learningItemKind === "phrase");
  assert(a1Core.length === 320, "A1 core item count is exactly 320 (actual: " + a1Core.length + ")");
  assert(a1Phrases.length === 45, "A1 phrase item count is exactly 45 (actual: " + a1Phrases.length + ")");


  // 2. Unchanged counts for A2–C2
  assert(a2Questions.length === 304, "A2 count unchanged at 304 (actual: " + a2Questions.length + ")");
  assert(b1Questions.length === 120, "B1 count unchanged at 120 (actual: " + b1Questions.length + ")");
  assert(b2Questions.length === 108, "B2 count unchanged at 108 (actual: " + b2Questions.length + ")");
  assert(c1Questions.length === 108, "C1 count unchanged at 108 (actual: " + c1Questions.length + ")");
  assert(c2Questions.length === 100, "C2 count unchanged at 100 (actual: " + c2Questions.length + ")");

  // 3. Automated audit & P0/P1/P2
  const a1Audit = auditEditorialQuestions(a1Questions);
  assert(a1Audit.errors.length === 0, "A1 automated audit error count is 0 (actual: " + a1Audit.errors.length + ")");

  const catalogueQuality = auditCatalogueQuality(a1Questions);
  let p0Count = 0;
  let p1Count = 0;
  let p2Count = 0;
  for (const q of a1Questions) {
    const res = auditItemDetailed(q, catalogueQuality.context);
    p0Count += res.errors.filter((e: any) => e.priority === "P0").length;
    p1Count += res.errors.filter((e: any) => e.priority === "P1").length;
    p2Count += res.warnings.filter((w: any) => w.priority === "P2").length;
  }
  assert(p0Count === 0, "A1 P0 error count is 0 (actual: " + p0Count + ")");
  assert(p1Count === 0, "A1 P1 error count is 0 (actual: " + p1Count + ")");
  assert(p2Count === 0, "A1 P2 warning count is 0 (actual: " + p2Count + ")");

  // 4. Field completeness
  for (const q of a1Questions) {
    assert(q.exampleSentence && q.exampleSentence.trim().length > 0, `Item ${q.id} has exampleSentence`);
    assert(q.exampleTranslation && q.exampleTranslation.trim().length > 0, `Item ${q.id} has exampleTranslation`);
    assert(q.phonetic && q.phonetic.trim().length > 0, `Item ${q.id} has IPA phonetic`);
    assert(q.senseId && q.senseId.trim().length > 0, `Item ${q.id} has senseId`);
    assert(q.collocation && q.collocation.trim().length > 0, `Item ${q.id} has collocation`);
    assert(q.productionPrompt && q.productionPrompt.trim().length > 0, `Item ${q.id} has productionPrompt`);
    assert(q.cefr === "A1" && q.level === "A1", `Item ${q.id} has CEFR A1`);
  }

  // 5. Target-enforced production prompts requiring at least 3 words
  const validPrompts = a1Questions.filter((q: any) => {
    if (!q.productionPrompt) return false;
    const prompt = q.productionPrompt.toLowerCase();
    const target = q.word.toLowerCase();
    const hasTarget = prompt.includes(target) || prompt.includes(`"${target}"`) || prompt.includes(`'${target}'`);
    const hasLengthReq = /at least 3 words|at least three words/i.test(prompt);
    return hasTarget && hasLengthReq;
  });
  assert(validPrompts.length === 365, "All 365 A1 items enforce target word and at least 3 words in production prompt (actual: " + validPrompts.length + "/365)");

  // 6. Collocation validity: >=2 words, no trailing function words, illustrated in example
  const trailingFuncWords = /\b(and|is|i|the|last|of|to|in|on|for|a|an|with|by|from|into|onto|this|that|or|but)$/i;
  for (const q of a1Questions) {
    const col = q.collocation;
    assert(!trailingFuncWords.test(col), `Item ${q.id} collocation does not end in trailing function word: "${col}"`);
    const colWords = col.split(/\s+/).filter(Boolean);
    assert(colWords.length >= 2, `Item ${q.id} collocation has at least 2 words: "${col}"`);
  }

  // 7. Elimination of synthetic example skeletons and numbered context
  const skeletonExamples = a1Questions.filter((q: any) =>
    /Learn and use the word|in case \d+|review panel \d+/i.test(q.exampleSentence || "")
  );
  assert(skeletonExamples.length === 0, "Zero A1 items use synthetic skeleton example sentences (actual: " + skeletonExamples.length + ")");
  const numberedTranslations = a1Questions.filter((q: any) =>
    /in case \d+|vaka \d+|ilgili inceleme dosyası/i.test(q.exampleTranslation || "")
  );
  assert(numberedTranslations.length === 0, "Zero A1 items use artificial numbered Turkish translations (actual: " + numberedTranslations.length + ")");

  // 8. Distractor consistency: 2 distinct wrong options per question, not equal to meaning
  const validDistractorCount = a1Questions.filter((q: any) =>
    Array.isArray(q.wrongOptions) &&
    q.wrongOptions.length === 2 &&
    !q.wrongOptions.includes(q.meaning) &&
    q.wrongOptions[0] !== q.wrongOptions[1]
  ).length;
  assert(validDistractorCount === 365, "All 365 A1 items have exactly 2 distinct wrong options not equal to answer (actual: " + validDistractorCount + "/365)");

  // 9. Honest Human Review Gate: 0/1105 approved, 0 human review evidence generated in S4
  const all1105 = [...a1Questions, ...a2Questions, ...b1Questions, ...b2Questions, ...c1Questions, ...c2Questions];
  const approvedCount = all1105.filter(hasVerifiableHumanApproval).length;
  assert(approvedCount === 0, "Human review evidence remains strictly 0/1105 (actual: " + approvedCount + ")");
  const editorialStatusApproved = a1Questions.filter((q: any) => q.editorialStatus === "approved").length;
  assert(editorialStatusApproved === 0, "Zero A1 items marked editorialStatus approved (actual: " + editorialStatusApproved + ")");
}


