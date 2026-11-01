import { auditEditorialQuestions } from "../../src/content/editorialQuality";
import { assert } from "../support/assertions";

// 63. C2 P0 Full Rewrite and Pedagogical Quality Gates (Sprint Plan S3):
console.log("\n63. C2 P0 Full Rewrite and Pedagogical Quality Gates (Sprint Plan S3):");
{
  const { c2Questions } = require("../../src/content/questions/c2");
  const { auditEditorialQuestions, auditItemDetailed } = require("../../src/content/editorialQuality");

  // 1. C2 Inventory & genel kabul kriterleri (50 Precise + 50 Specialist = 100 items)
  assert(c2Questions.length === 100, "C2 catalogue contains exactly 100 items (actual: " + c2Questions.length + ")");
  const preciseCount = c2Questions.filter((q: any) => q.id.startsWith("c2-precise-")).length;
  const specialistCount = c2Questions.filter((q: any) => q.id.startsWith("c2-specialist-")).length;
  assert(preciseCount === 50, "C2 contains exactly 50 Precise Expression items (actual: " + preciseCount + ")");
  assert(specialistCount === 50, "C2 contains exactly 50 Specialist Discourse items (actual: " + specialistCount + ")");

  const c2Audit = auditEditorialQuestions(c2Questions);
  assert(c2Audit.errors.length === 0, "C2 automated audit error count is 0 (actual: " + c2Audit.errors.length + ")");

  // 2. C2 şablon örnek testi (Template example elimination)
  assert(c2Audit.templateExampleIds.length === 0, "C2 repeated example skeleton count is 0 (actual: " + c2Audit.templateExampleIds.length + ")");
  const legacyEnglishFrameCount = c2Questions.filter((q: any) =>
    /The review panel (?:will|found|linked)|The report uses the word|The presentation discussed|The specialist explained/i.test(q.exampleSentence || "")
  ).length;
  assert(legacyEnglishFrameCount === 0, "Legacy and synthetic English template frames are completely eliminated (0/100, actual: " + legacyEnglishFrameCount + ")");

  // 3. C2 yapay Türkçe çeviri testi (Artificial translation elimination)
  assert(c2Audit.templateTranslationIds.length === 0, "C2 repeated translation skeleton count is 0 (actual: " + c2Audit.templateTranslationIds.length + ")");
  const legacyTurkishFrameCount = c2Questions.filter((q: any) =>
    /ilgili inceleme dosyası|inceleme paneli/i.test(q.exampleTranslation || "")
  ).length;
  assert(legacyTurkishFrameCount === 0, "Legacy numbered Turkish templates are completely eliminated (0/100, actual: " + legacyTurkishFrameCount + ")");

  // 4. C2 duplicate sense testi (Unique senses & no collision)
  const senseIds = c2Questions.map((q: any) => q.senseId);
  const uniqueSenseIds = new Set(senseIds);
  assert(uniqueSenseIds.size === 100, "All 100 C2 senseIds are unique with zero duplicates (100/100, actual: " + uniqueSenseIds.size + ")");
  const item14 = c2Questions.find((q: any) => q.id === "c2-precise-14");
  const item49 = c2Questions.find((q: any) => q.id === "c2-precise-49");
  assert(item14 && item49 && item14.senseId !== item49.senseId, "c2-precise-14 and c2-precise-49 have distinct senses");

  // 5. C2 collocation örnekte görünme testi (Contextual collocation)
  const collocationVerifiedCount = c2Questions.filter((q: any) => {
    if (!q.collocation) return false;
    const collowNorm = q.collocation.toLowerCase().replace(/[^a-z0-9 ]/g, " ").trim();
    const exampleNorm = (q.exampleSentence || "").toLowerCase().replace(/[^a-z0-9 ]/g, " ");
    const promptNorm = (q.productionPrompt || "").toLowerCase().replace(/[^a-z0-9 ]/g, " ");
    const words = collowNorm.split(/\s+/).filter(Boolean);
    return words.every((w: string) => exampleNorm.includes(w)) || words.every((w: string) => promptNorm.includes(w));
  }).length;
  assert(collocationVerifiedCount === 100, "Collocation is naturally verified in example or prompt across all items (100/100, actual: " + collocationVerifiedCount + ")");

  // 6. C2 uzmanlık bağlamı testi (Specialist domain & register)
  const validRegisters = c2Questions.filter((q: any) =>
    ["academic", "formal", "professional", "literary", "technical"].includes(q.register)
  );
  assert(validRegisters.length === 100, "All 100 C2 items maintain advanced registers (academic, formal, professional, literary, technical) (100/100, actual: " + validRegisters.length + ")");

  // 7. C2 production prompt hedef zorunluluğu testi
  const targetEnforcedPromptCount = c2Questions.filter((q: any) => {
    if (!q.productionPrompt) return false;
    const target = q.word.toLowerCase();
    const prompt = q.productionPrompt.toLowerCase();
    return prompt.includes(target) || prompt.includes('"' + target + '"') || prompt.includes("'" + target + "'");
  }).length;
  assert(targetEnforcedPromptCount === 100, "Production prompt enforces target word across all items (100/100, actual: " + targetEnforcedPromptCount + ")");

  // 8. C2 production prompt nüans/karar/kanıt testi (No naive prompts)
  const naivePrompts = c2Questions.filter((q: any) =>
    /^(?:write a (?:short )?sentence|explain the word|use the word in a sentence|tell a (?:simple )?story|write about)\b/i.test((q.productionPrompt || "").trim())
  );
  assert(naivePrompts.length === 0, "Zero C2 production prompts use naive/simplistic patterns (actual: " + naivePrompts.length + ")");

  // 9. C2 POS ve valency testi (Valency integrity & grammar)
  const valencyErrors = c2Questions.filter((q: any) => {
    const text = (q.exampleSentence || "") + " " + (q.collocation || "");
    return /differentiate the recommendation|anticipate the recommendation|calibrate the recommendation|extrapolate the recommendation|proposal intrinsic|proposal ambivalent|generalize the recommendation|distill the recommendation/i.test(text);
  });
  assert(valencyErrors.length === 0, "Zero C2 items exhibit broken valency patterns (actual: " + valencyErrors.length + ")");

  // 10. C2 yanlış Türkçe sense testi & distractor kalitesi
  const item18 = c2Questions.find((q: any) => q.id === "c2-precise-18");
  assert(item18 && !item18.exampleTranslation.includes("ticari"), "c2-precise-18 translation does not contain extraneous 'ticari'");

  const item45 = c2Questions.find((q: any) => q.id === "c2-precise-45");
  assert(item45 && item45.exampleTranslation.includes("toplumsal kenetlenme"), "c2-precise-45 translation uses 'toplumsal kenetlenme'");

  assert(c2Audit.overusedDistractorIds.length === 0, "C2 overused distractor pair count is 0");
  const validDistractorCount = c2Questions.filter((q: any) =>
    Array.isArray(q.wrongOptions) &&
    q.wrongOptions.length === 2 &&
    !q.wrongOptions.includes(q.meaning) &&
    q.wrongOptions[0] !== q.wrongOptions[1]
  ).length;
  assert(validDistractorCount === 100, "All 100 C2 items have 2 distinct wrong options not equal to answer");
}

