import { C } from "../../src/theme/colors";
import { assert } from "../support/assertions";

// 69. Production UI & Attempt Evaluation Gate (Sprint Plan S9):
console.log("\n69. Production UI & Attempt Evaluation Gate (Sprint Plan S9):");
{
  const { evaluateProductionResponse } = require("../../src/domain/learning/production");
  const { c2Questions } = require("../../src/content/questions/c2");
  const { a1Questions } = require("../../src/content/questions/a1");

  // A. Evaluation passes with target word, collocation, sufficient length, and terminal punctuation
  const sampleC2 = c2Questions[0]; // articulate
  const passingResponse = "The attorney will articulate a position clearly during the courtroom hearing.";
  const passResult = evaluateProductionResponse(sampleC2, passingResponse);
  assert(passResult.passed, "Valid production response passes evaluation (score: " + passResult.score + "/4)");
  assert(passResult.targetUsed, "Target word detection is true");
  assert(passResult.collocationUsed, "Collocation detection is true");
  assert(passResult.contextScore === 1, "Context score is 1");
  assert(passResult.registerScore === 1, "Register punctuation score is 1");

  // B. Evaluation catches missing target word
  const noTargetResponse = "The speaker explained everything very clearly to the committee.";
  const noTargetResult = evaluateProductionResponse(sampleC2, noTargetResponse);
  assert(!noTargetResult.targetUsed, "Missing target word is flagged");
  assert(noTargetResult.feedback.some((f: string) => f.includes("Hedef sözcüğü")), "Feedback prompts for target word");

  // C. Evaluation respects level minimum word count
  const sampleA1 = a1Questions[0];
  const shortResponse = "dog.";
  const shortResult = evaluateProductionResponse(sampleA1, shortResponse);
  assert(shortResult.contextScore === 0, "Response below minimum words receives 0 context score");

  // D. Evaluation supports inflected word forms
  const inflectedResponse = "The committee articulated a position on new regulations.";
  const inflectedResult = evaluateProductionResponse(sampleC2, inflectedResponse);
  assert(inflectedResult.targetUsed, "Inflected past tense form 'articulated' matches base target 'articulate'");
}

