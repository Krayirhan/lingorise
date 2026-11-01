import { auditEditorialQuestions } from "../../src/content/editorialQuality";
import { assert } from "../support/assertions";

// 65. A2 Functional Production & Progression Gates (Sprint Plan S5):
console.log("\n65. A2 Functional Production & Progression Gates (Sprint Plan S5):");
{
  const { a2Questions } = require("../../src/content/questions/a2");
  const { a1Questions } = require("../../src/content/questions/a1");
  const { b1Questions } = require("../../src/content/questions/b1");
  const { b2Questions } = require("../../src/content/questions/b2");
  const { c1Questions } = require("../../src/content/questions/c1");
  const { c2Questions } = require("../../src/content/questions/c2");
  const { auditEditorialQuestions } = require("../../src/content/editorialQuality");
  const { hasVerifiableHumanApproval } = require("../../src/content/editorialReviewWorkflow");
  const baselineManifest = require("../../docs/36-baseline-manifest.json");

  // 1. Inventory counts
  assert(a2Questions.length === 304, "A2 catalogue contains exactly 304 items (actual: " + a2Questions.length + ")");
  const a2Core = a2Questions.filter((q: any) => q.learningItemKind === "word");
  const a2Phrases = a2Questions.filter((q: any) => q.learningItemKind === "phrase");
  assert(a2Core.length === 254, "A2 core items count is 254 (actual: " + a2Core.length + ")");
  assert(a2Phrases.length === 50, "A2 phrase items count is 50 (actual: " + a2Phrases.length + ")");

  // 2. Other levels preserved untouched
  assert(a1Questions.length === 365, "A1 item count remains 365 (actual: " + a1Questions.length + ")");
  assert(b1Questions.length === 120, "B1 item count remains 120 (actual: " + b1Questions.length + ")");
  assert(b2Questions.length === 108, "B2 item count remains 108 (actual: " + b2Questions.length + ")");
  assert(c1Questions.length === 108, "C1 item count remains 108 (actual: " + c1Questions.length + ")");
  assert(c2Questions.length === 100, "C2 item count remains 100 (actual: " + c2Questions.length + ")");

  // 3. ID preservation
  const baselineA2Ids = new Set(baselineManifest.items.filter((x: any) => x.level === "A2").map((x: any) => x.id));
  const missingA2Ids = [...baselineA2Ids].filter((id) => !a2Questions.some((q: any) => q.id === id));
  assert(missingA2Ids.length === 0, "All baseline A2 item IDs are strictly preserved (missing: " + missingA2Ids.length + ")");

  // 4. Mandatory fields & CEFR: exampleSentence, exampleTranslation, IPA, senseId, collocation, productionPrompt, CEFR
  for (const q of a2Questions) {
    assert(q.exampleSentence && q.exampleSentence.trim().length > 0, `Item ${q.id} has exampleSentence`);
    assert(q.exampleTranslation && q.exampleTranslation.trim().length > 0, `Item ${q.id} has exampleTranslation`);
    assert(q.phonetic && q.phonetic.trim().length > 0, `Item ${q.id} has IPA phonetic`);
    assert(q.senseId && q.senseId.trim().length > 0, `Item ${q.id} has senseId`);
    assert(q.collocation && q.collocation.trim().length > 0, `Item ${q.id} has collocation`);
    assert(q.productionPrompt && q.productionPrompt.trim().length > 0, `Item ${q.id} has productionPrompt`);
    assert(q.cefr === "A2" && q.level === "A2", `Item ${q.id} has CEFR and level A2`);
    assert(q.source && q.source.trim().length > 0, `Item ${q.id} has source provenance`);
  }

  // 5. Target-enforced production prompts requiring at least 4 words & communicative intent
  const communicativeRegex = /explain|describe|tell|ask|invite|remind|advise|congratulate|suggest|express|instruct|thank|talk about|give advice|share|list|name|call|wish|promise|recommend|warn|complain|discuss|direct|encourage|hurry|check/i;
  for (const q of a2Questions) {
    const prompt = q.productionPrompt.toLowerCase();
    const target = q.word.toLowerCase();
    const hasTarget = prompt.includes(target) || prompt.includes(`"${target}"`) || prompt.includes(`'${target}'`);
    assert(hasTarget, `Item ${q.id} production prompt enforces target word`);
    const hasLengthReq = /at least 4 words|at least four words|minimum 4 words|minimum four words|at least four english words|at least 4 english words/i.test(prompt);
    assert(hasLengthReq, `Item ${q.id} production prompt explicitly demands at least 4 words`);
    assert(communicativeRegex.test(prompt), `Item ${q.id} production prompt carries functional communicative intent`);
  }

  // 6. Collocation validity: >=2 words, no trailing function words, natural context
  const trailingFuncWords = /\b(and|is|i|the|last|of|to|in|on|for|a|an|with|by|from|into|onto|this|that|or|but)$/i;
  const mechanicalPatterns = [
    /\bnew job last\b/i,
    /\bour office is\b/i,
    /\bthe salary is\b/i,
    /\ba useful app and\b/i,
    /\bthis plan is\b/i,
    /\bthe trip was\b/i,
    /\byesterday night\b/i,
    /\btoday morning\b/i,
  ];

  for (const q of a2Questions) {
    const col = q.collocation;
    const colWords = col.split(/\s+/).filter(Boolean);
    assert(colWords.length >= 2, `Item ${q.id} collocation has at least 2 words: "${col}"`);
    assert(!trailingFuncWords.test(col), `Item ${q.id} collocation does not end in trailing function word: "${col}"`);
    for (const pat of mechanicalPatterns) {
      assert(!pat.test(col), `Item ${q.id} collocation is not mechanical pattern: "${col}"`);
    }

    // Phrase parts in example sentence
    if (q.learningItemKind === "phrase") {
      const phraseParts = q.word.toLowerCase().replace(/[^a-z0-9 ]/g, " ").split(/\s+/).filter(Boolean);
      const exLower = q.exampleSentence.toLowerCase().replace(/[^a-z0-9 ]/g, " ");
      const partsFound = phraseParts.some((part: string) => exLower.includes(part));
      assert(partsFound, `Phrase item ${q.id} target components appear in example sentence`);
    }
  }

  // 7. Prompt & Collocation repetition limits (< 5 across catalogue)
  const promptCounts = new Map<string, number>();
  const colCounts = new Map<string, number>();
  for (const q of a2Questions) {
    const pNorm = q.productionPrompt.toLowerCase().trim();
    const cNorm = q.collocation.toLowerCase().trim();
    promptCounts.set(pNorm, (promptCounts.get(pNorm) || 0) + 1);
    colCounts.set(cNorm, (colCounts.get(cNorm) || 0) + 1);
  }
  for (const [p, count] of promptCounts.entries()) {
    assert(count < 5, `Production prompt repeated < 5 times: "${p}" (actual: ${count})`);
  }
  for (const [c, count] of colCounts.entries()) {
    assert(count < 5, `Collocation repeated < 5 times: "${c}" (actual: ${count})`);
  }

  // 8. Distractor consistency: 2 distinct wrong options, not equal to meaning, distinct
  for (const q of a2Questions) {
    assert(Array.isArray(q.wrongOptions) && q.wrongOptions.length === 2, `Item ${q.id} has exactly 2 distractors`);
    assert(!q.wrongOptions.includes(q.meaning), `Item ${q.id} distractors do not include correct meaning`);
    assert(q.wrongOptions[0] !== q.wrongOptions[1], `Item ${q.id} distractors are not duplicate`);
  }

  // 9. Elimination of synthetic templates and numbered contexts
  const skeletonExamples = a2Questions.filter((q: any) =>
    /the word means|the report uses|the item describes|Learn and use the word|in case \d+|review panel \d+/i.test(q.exampleSentence || "")
  );
  assert(skeletonExamples.length === 0, "Zero A2 items use synthetic template example sentences (actual: " + skeletonExamples.length + ")");
  const numberedTranslations = a2Questions.filter((q: any) =>
    /in case \d+|vaka \d+|ilgili inceleme dosyası/i.test(q.exampleTranslation || "")
  );
  assert(numberedTranslations.length === 0, "Zero A2 items use artificial numbered Turkish translations (actual: " + numberedTranslations.length + ")");

  // 10. A1->A2 duplicate sense check: no identical senseId between A1 and A2
  const a1Senses = new Set(a1Questions.map((q: any) => q.senseId));
  const duplicateA1A2Senses = a2Questions.filter((q: any) => a1Senses.has(q.senseId));
  assert(duplicateA1A2Senses.length === 0, "Zero duplicate senseIds between A1 and A2 (actual: " + duplicateA1A2Senses.length + ")");

  // 11. Automated audit error count is 0
  const a2Audit = auditEditorialQuestions(a2Questions);
  assert(a2Audit.errors.length === 0, "A2 automated audit error count is 0 (actual: " + a2Audit.errors.length + ")");

  // 12. Human Review Evidence remains 0/1105, 0 approved
  const all1105 = [...a1Questions, ...a2Questions, ...b1Questions, ...b2Questions, ...c1Questions, ...c2Questions];
  const approvedCount = all1105.filter(hasVerifiableHumanApproval).length;
  assert(approvedCount === 0, "Human review evidence remains strictly 0/1105 (actual: " + approvedCount + ")");
  const a2Approved = a2Questions.filter((q: any) => q.editorialStatus === "approved").length;
  assert(a2Approved === 0, "Zero A2 items marked editorialStatus approved (actual: " + a2Approved + ")");
}

