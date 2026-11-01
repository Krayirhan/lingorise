import { recordLearningOutcome } from "../../src/domain/learning/mastery";
import { normalizeUserData, CURRENT_SCHEMA_VERSION } from "../../src/domain/user/normalization";
import { UserData } from "../../src/domain/models/user";
import * as path from "path";
import { assert } from "../support/assertions";

// 42. Migration versioning (roadmap Birim 8.1, 8.3)
console.log("\n42. Migration Schema Versioning:");
{
  // Data with no schemaVersion at all, but already has the learningProgress
  // structure — this is what every real user's stored data looked like
  // before Sprint 8 shipped the version field.
  const preVersioningUser = normalizeUserData({
    xp: 90,
    learningProgress: { "a1-mm-01": recordLearningOutcome(undefined, true, "2026-08-01", 1) },
  } as Partial<UserData>);
  assert(
    preVersioningUser.schemaVersion === CURRENT_SCHEMA_VERSION,
    `normalizeUserData always stamps the current schema version (${CURRENT_SCHEMA_VERSION}) even on unversioned input`
  );

  // Once-normalized data carries its version forward untouched.
  const alreadyVersioned = normalizeUserData({ ...preVersioningUser } as Partial<UserData>);
  assert(alreadyVersioned.schemaVersion === CURRENT_SCHEMA_VERSION, "Already-normalized data keeps the current schema version on reload");

  // The oldest possible shape (solvedQuestionIds only, no learningProgress at
  // all) still migrates cleanly and ends up on the current version — this is
  // the exact case tests 16 and 25 already exercise; confirming schemaVersion
  // doesn't break that path.
  const oldestShape = normalizeUserData({
    xp: 50,
    solvedQuestionIds: ["a1-mm-02"],
  } as Partial<UserData>);
  assert(oldestShape.schemaVersion === CURRENT_SCHEMA_VERSION, "The oldest pre-learningProgress shape still normalizes to the current version");
  assert(Object.keys(oldestShape.learningProgress).length === 1, "Migration 25's behavior is unchanged by the version stamp");
}

