import { auditEditorialQuestions } from "../../src/content/editorialQuality";
import { C } from "../../src/theme/colors";
import { assert } from "../support/assertions";

// 67. B2 Reasoned & Register-Aware Production Gates (Sprint Plan S7):
console.log("\n67. B2 Reasoned & Register-Aware Production Gates (Sprint Plan S7):");
{
  const { b2Questions } = require("../../src/content/questions/b2");
  const { auditEditorialQuestions } = require("../../src/content/editorialQuality");

  // A. Inventory count & zero automated audit errors
  assert(b2Questions.length === 108, "B2 catalogue contains exactly 108 items (actual: " + b2Questions.length + ")");
  const b2Audit = auditEditorialQuestions(b2Questions);
  assert(b2Audit.errors.length === 0, "B2 automated audit error count is 0 (actual: " + b2Audit.errors.length + ")");

  // B. Collocation presence in example sentence or production prompt
  const validCollocations = b2Questions.filter((q: any) => {
    if (!q.collocation || q.collocation.trim().length === 0) return false;
    const collowNorm = q.collocation.toLowerCase().replace(/[^a-z0-9 ]/g, " ").trim();
    const exampleNorm = (q.exampleSentence || "").toLowerCase().replace(/[^a-z0-9 ]/g, " ");
    const promptNorm = (q.productionPrompt || "").toLowerCase().replace(/[^a-z0-9 ]/g, " ");
    const words = collowNorm.split(/\s+/).filter(Boolean);
    return words.every((w: string) => exampleNorm.includes(w)) ||
           words.every((w: string) => promptNorm.includes(w)) ||
           q.learningItemKind === "phrase";
  });
  assert(validCollocations.length === 108, "All 108 B2 items have valid contextual collocations (actual: " + validCollocations.length + "/108)");

  // C. Target-enforced production prompts requiring at least 5 words
  const validPrompts = b2Questions.filter((q: any) => {
    if (!q.productionPrompt) return false;
    const prompt = q.productionPrompt.toLowerCase();
    const target = q.word.toLowerCase();
    const hasTarget = prompt.includes(target) || prompt.includes(`"${target}"`) || prompt.includes(`'${target}'`);
    const hasLengthReq = /at least 5 words/i.test(prompt);
    return hasTarget && hasLengthReq;
  });
  assert(validPrompts.length === 108, "All 108 B2 items enforce target word and at least 5 words in production prompt (actual: " + validPrompts.length + "/108)");

  // D. Register awareness: academic, formal, or professional
  const validRegisters = b2Questions.filter((q: any) =>
    q.register === "academic" || q.register === "formal" || q.register === "professional"
  );
  assert(validRegisters.length === 108, "All 108 B2 items have explicit academic/formal/professional register (actual: " + validRegisters.length + "/108)");

  // E. Distractor consistency: 2 distinct wrong options per question
  const validDistractorCount = b2Questions.filter((q: any) =>
    Array.isArray(q.wrongOptions) &&
    q.wrongOptions.length === 2 &&
    !q.wrongOptions.includes(q.meaning) &&
    q.wrongOptions[0] !== q.wrongOptions[1]
  ).length;
  assert(validDistractorCount === 108, "All 108 B2 items have exactly 2 distinct wrong options not equal to answer (actual: " + validDistractorCount + "/108)");
}

