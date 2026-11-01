import { auditEditorialQuestions } from "../../src/content/editorialQuality";
import { assert } from "../support/assertions";

// 66. B1 Contextual Production & Sense Disambiguation Gates (Sprint Plan S6):
console.log("\n66. B1 Contextual Production & Sense Disambiguation Gates (Sprint Plan S6):");
{
  const { b1Questions } = require("../../src/content/questions/b1");
  const { a1Questions } = require("../../src/content/questions/a1");
  const { a2Questions } = require("../../src/content/questions/a2");
  const { b2Questions } = require("../../src/content/questions/b2");
  const { c1Questions } = require("../../src/content/questions/c1");
  const { c2Questions } = require("../../src/content/questions/c2");
  const { auditEditorialQuestions } = require("../../src/content/editorialQuality");
  const { hasVerifiableHumanApproval } = require("../../src/content/editorialReviewWorkflow");
  const baselineManifest = require("../../docs/36-baseline-manifest.json");

  // 1. Inventory counts
  assert(b1Questions.length === 120, "B1 catalogue contains exactly 120 items (actual: " + b1Questions.length + ")");
  assert(a1Questions.length === 365, "A1 item count remains 365 (actual: " + a1Questions.length + ")");
  assert(a2Questions.length === 304, "A2 item count remains 304 (actual: " + a2Questions.length + ")");
  assert(b2Questions.length === 108, "B2 item count remains 108 (actual: " + b2Questions.length + ")");
  assert(c1Questions.length === 108, "C1 item count remains 108 (actual: " + c1Questions.length + ")");
  assert(c2Questions.length === 100, "C2 item count remains 100 (actual: " + c2Questions.length + ")");

  // 2. ID preservation
  const baselineB1Ids = new Set(baselineManifest.items.filter((x: any) => x.level === "B1").map((x: any) => x.id));
  const missingB1Ids = [...baselineB1Ids].filter((id) => !b1Questions.some((q: any) => q.id === id));
  assert(missingB1Ids.length === 0, "All baseline B1 item IDs are strictly preserved (missing: " + missingB1Ids.length + ")");

  // 3. Elimination of 56 broken "Explain how to + noun phrase" production prompts
  const brokenPrompts = b1Questions.filter((q: any) =>
    /explain how to\s+(?:heavy|key|meeting|efficient|flexible|reliable|top|staff|respectful|famous|remote|crowded|train|delay|insurance|departure|arrival|destination|memorable|authentic|cultural|custom|guidebook|journey|adventure|souvenir|hospitality|broadcast|source|accurate|biased|audience|trend|access|community|inequality|opportunity|volunteer|protest|regulation|public|debate|responsible|diverse|option|consequence|advantage|drawback|strategy|practical|realistic|ambitious|independent|alternative|outcome|the\b|a\b|an\b)/i.test(q.productionPrompt || "")
  );
  assert(brokenPrompts.length === 0, "Zero B1 items have broken 'Explain how to + noun phrase' production prompts (actual: " + brokenPrompts.length + ")");

  // 4. Mandatory fields & CEFR
  for (const q of b1Questions) {
    assert(q.exampleSentence && q.exampleSentence.trim().length > 0, `Item ${q.id} has exampleSentence`);
    assert(q.exampleTranslation && q.exampleTranslation.trim().length > 0, `Item ${q.id} has exampleTranslation`);
    assert(q.phonetic && q.phonetic.trim().length > 0, `Item ${q.id} has IPA phonetic`);
    assert(q.senseId && q.senseId.trim().length > 0, `Item ${q.id} has senseId`);
    assert(q.collocation && q.collocation.trim().length > 0, `Item ${q.id} has collocation`);
    assert(q.productionPrompt && q.productionPrompt.trim().length > 0, `Item ${q.id} has productionPrompt`);
    assert(q.cefr === "B1" && q.level === "B1", `Item ${q.id} has CEFR and level B1`);
    assert(q.source && q.source.trim().length > 0, `Item ${q.id} has source provenance`);
  }

  // 5. Target-enforced production prompts requiring at least 5 words & communicative intent
  const communicativeRegex = /explain|describe|tell|ask|invite|remind|advise|congratulate|suggest|express|instruct|thank|talk about|give advice|share|list|name|call|wish|promise|recommend|warn|complain|discuss|direct|encourage|hurry|check|outline|summarize|reflect|state|give|provide/i;
  for (const q of b1Questions) {
    const prompt = q.productionPrompt.toLowerCase();
    const target = q.word.toLowerCase();
    const hasTarget = prompt.includes(target) || prompt.includes(`"${target}"`) || prompt.includes(`'${target}'`);
    assert(hasTarget, `Item ${q.id} production prompt enforces target word`);
    const hasLengthReq = /at least 5 words|at least five words|minimum 5 words|minimum five words|at least five english words|at least 5 english words/i.test(prompt);
    assert(hasLengthReq, `Item ${q.id} production prompt explicitly demands at least 5 words`);
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
    /\bpersist with effort\b/i,
    /\btravel journey\b/i,
  ];

  for (const q of b1Questions) {
    const col = q.collocation;
    const colWords = col.split(/\s+/).filter(Boolean);
    assert(colWords.length >= 2, `Item ${q.id} collocation has at least 2 words: "${col}"`);
    assert(!trailingFuncWords.test(col), `Item ${q.id} collocation does not end in trailing function word: "${col}"`);
    for (const pat of mechanicalPatterns) {
      assert(!pat.test(col), `Item ${q.id} collocation is not mechanical pattern: "${col}"`);
    }

    // Collocation must appear in exampleSentence or productionPrompt
    const collowNorm = q.collocation.toLowerCase().replace(/[^a-z0-9 ]/g, " ").trim();
    const exampleNorm = (q.exampleSentence || "").toLowerCase().replace(/[^a-z0-9 ]/g, " ");
    const promptNorm = (q.productionPrompt || "").toLowerCase().replace(/[^a-z0-9 ]/g, " ");
    const words = collowNorm.split(/\s+/).filter(Boolean);
    const inExOrPrompt = words.every((w: string) => exampleNorm.includes(w)) ||
                         words.every((w: string) => promptNorm.includes(w));
    assert(inExOrPrompt, `Item ${q.id} collocation "${col}" appears in example sentence or production prompt`);
  }

  // 7. Prompt & Collocation repetition limits (< 5 across catalogue)
  const promptCounts = new Map<string, number>();
  const colCounts = new Map<string, number>();
  for (const q of b1Questions) {
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

  // 8. Distractor consistency: 2 distinct wrong options, not equal to meaning, not duplicate
  for (const q of b1Questions) {
    assert(Array.isArray(q.wrongOptions) && q.wrongOptions.length === 2, `Item ${q.id} has exactly 2 distractors`);
    assert(!q.wrongOptions.includes(q.meaning), `Item ${q.id} distractors do not include correct meaning`);
    assert(q.wrongOptions[0] !== q.wrongOptions[1], `Item ${q.id} distractors are not duplicate`);
  }

  // 9. Elimination of synthetic templates and numbered contexts
  const skeletonExamples = b1Questions.filter((q: any) =>
    /the word means|the report uses|the item describes|Learn and use the word|in case \d+|review panel \d+/i.test(q.exampleSentence || "")
  );
  assert(skeletonExamples.length === 0, "Zero B1 items use synthetic template example sentences (actual: " + skeletonExamples.length + ")");
  const numberedTranslations = b1Questions.filter((q: any) =>
    /in case \d+|vaka \d+|ilgili inceleme dosyası/i.test(q.exampleTranslation || "")
  );
  assert(numberedTranslations.length === 0, "Zero B1 items use artificial numbered Turkish translations (actual: " + numberedTranslations.length + ")");

  // 10. Disambiguation of duplicate senses: opportunity (77 vs 101) and outcome (25 vs 119)
  const opp77 = b1Questions.find((q: any) => q.id === "b1-core-opportunity-77");
  const opp101 = b1Questions.find((q: any) => q.id === "b1-core-opportunity-101");
  assert(opp77 && opp101, "Both opportunity items exist");
  assert(opp77.senseId !== opp101.senseId, "Opportunity items have distinct senseIds");
  assert(opp77.collocation !== opp101.collocation, "Opportunity items have distinct collocations");
  assert(opp77.topic !== opp101.topic, "Opportunity items belong to distinct pedagogical topics");

  const out25 = b1Questions.find((q: any) => q.id === "b1-core-outcome-25");
  const out119 = b1Questions.find((q: any) => q.id === "b1-core-outcome-119");
  assert(out25 && out119, "Both outcome items exist");
  assert(out25.senseId !== out119.senseId, "Outcome items have distinct senseIds");
  assert(out25.collocation !== out119.collocation, "Outcome items have distinct collocations");
  assert(out25.topic !== out119.topic, "Outcome items belong to distinct pedagogical topics");

  const senseIds = b1Questions.map((q: any) => q.senseId);
  const uniqueSenseIds = new Set(senseIds);
  assert(uniqueSenseIds.size === 120, "All 120 B1 items have unique senseIds with 0 duplicates (actual unique: " + uniqueSenseIds.size + "/120)");

  // 11. Automated audit error count is 0
  const b1Audit = auditEditorialQuestions(b1Questions);
  assert(b1Audit.errors.length === 0, "B1 automated audit error count is 0 (actual: " + b1Audit.errors.length + ")");

  // 12. Human Review Evidence remains 0/1105, 0 approved
  const all1105 = [...a1Questions, ...a2Questions, ...b1Questions, ...b2Questions, ...c1Questions, ...c2Questions];
  const approvedCount = all1105.filter(hasVerifiableHumanApproval).length;
  assert(approvedCount === 0, "Human review evidence remains strictly 0/1105 (actual: " + approvedCount + ")");
  const b1Approved = b1Questions.filter((q: any) => q.editorialStatus === "approved").length;
  assert(b1Approved === 0, "Zero B1 items marked editorialStatus approved (actual: " + b1Approved + ")");
}

