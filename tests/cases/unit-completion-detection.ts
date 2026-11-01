import { getQuestionsByLevel, getLevelUnitInfo, CONTENT_UNIT_SIZE, detectUnitJustCompleted } from "../support/bundledCatalogue";
import { assert } from "../support/assertions";

// 45. Unit-completion detection feeds the roadmap Birim 2 §2.1 "days to
// finish a unit" signal — telemetry can't compute it without this firing at
// exactly the right moment, never early and never missed.
console.log("\n45. Unit Completion Detection (roadmap Birim 2 §2.1 / S10):");
{
  const a1Unit0 = getLevelUnitInfo("A1", []).questions;
  const allButLast = a1Unit0.slice(0, -1).map((q) => q.id);
  const allOfUnit = a1Unit0.map((q) => q.id);

  assert(
    detectUnitJustCompleted("A1", [], allButLast.slice(0, 5)) === null,
    "Answering only part of a unit does not report it as completed"
  );
  const justFinished = detectUnitJustCompleted("A1", allButLast, allOfUnit);
  assert(justFinished !== null, "The exact word that finishes a unit is detected");
  assert(justFinished?.unitIndex === 0, "The completed unit's index is reported correctly");
  assert(justFinished?.wordsInUnit === a1Unit0.length, "The completed unit's word count is reported correctly");

  assert(
    detectUnitJustCompleted("A1", allOfUnit, allOfUnit) === null,
    "A unit already complete before this answer is not reported again"
  );

  // The level's FINAL unit is the edge case getLevelUnitInfo's own fallback
  // makes easy to get wrong (see the comment on detectUnitJustCompleted).
  const totalA1 = getQuestionsByLevel("A1").length;
  const lastUnit = getLevelUnitInfo("A1", getQuestionsByLevel("A1").slice(0, totalA1 - CONTENT_UNIT_SIZE).map((q) => q.id));
  const lastUnitAllButOne = lastUnit.questions.slice(0, -1).map((q) => q.id);
  const lastUnitAll = lastUnit.questions.map((q) => q.id);
  const priorSolved = getQuestionsByLevel("A1").slice(0, totalA1 - CONTENT_UNIT_SIZE).map((q) => q.id);
  const finishedLast = detectUnitJustCompleted(
    "A1",
    [...priorSolved, ...lastUnitAllButOne],
    [...priorSolved, ...lastUnitAll]
  );
  assert(
    finishedLast !== null && finishedLast.unitIndex === lastUnit.unitIndex,
    "Completing a level's FINAL unit is still detected, not silently missed"
  );
}

