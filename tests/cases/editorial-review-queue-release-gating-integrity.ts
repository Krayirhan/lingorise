import { allQuestions } from "../support/bundledCatalogue";
import { C } from "../../src/theme/colors";
import { assert } from "../support/assertions";

// 70. Editorial Review Queue & Release Gating Integrity (Sprint Plan S10 & S11):
console.log("\n70. Editorial Review Queue & Release Gating Integrity (Sprint Plan S10 & S11):");
{
  const { allQuestions } = require("../../src/content/questions/index");
  const { buildEditorialReviewQueue, hasVerifiableHumanApproval } = require("../../src/content/editorialReviewWorkflow");
  const { generateBaselineManifest } = require("../../scripts/generateBaselineManifest");

  // A. Complete catalogue inventory
  assert(allQuestions.length === 1105, "Total questions across all levels is exactly 1,105 (actual: " + allQuestions.length + ")");

  // B. Editorial Review Queue completeness: 1,105 items queued for human review
  const queue = buildEditorialReviewQueue(allQuestions);
  assert(queue.length === 1105, "Review queue contains exactly 1,105 items (actual: " + queue.length + ")");

  // C. Honest Human Gating: zero items have fraudulent human approval
  const approvedCount = allQuestions.filter(hasVerifiableHumanApproval).length;
  assert(approvedCount === 0, "Human approved count is strictly 0 until authentic human signatures are recorded (actual: " + approvedCount + ")");

  // D. Baseline Manifest parity and release decision BLOCKED
  const manifest = generateBaselineManifest();
  assert(manifest.totalItems === 1105, "Baseline manifest accounts for 1,105 items");
  assert(manifest.readinessSummary.releaseDecision === "BLOCKED", "Release decision is strictly BLOCKED while human reviews are pending");
  assert(manifest.readinessSummary.editorialReadiness === "NOT_READY", "Editorial readiness is strictly NOT_READY without 4-role human signatures");
  assert(manifest.readinessSummary.automatedAuditErrors === 0, "Automated audit errors across all 1,105 items is 0");
}

