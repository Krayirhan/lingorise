# MASTER-001 — Root Cause Clusters

Deduplication philosophy applied strictly: two findings merge into one Global finding only when they share substantially the same technical cause AND require substantially the same remediation AND separate retention would duplicate implementation work AND merging does not hide an independent consequence. Where a shared surface exists but remediation differs, findings stay in the same cluster but become separate Global findings (SAME ROOT CAUSE vs. RELATED BUT INDEPENDENT vs. DEPENDENT CONSEQUENCE, per member).

## CLUSTER-001 — Canonical progress schema & merge completeness

**Shared technical surface:** `src/services/firestore.ts` (`syncUserData`, `syncUserProgress`, `mergeAndSyncUserData`), and the test that verifies it.

| Finding | Relationship |
|---|---|
| DATA-QA-002 | PRIMARY — the production data-correctness symptom |
| ARCH-QA-001 (→ MAINT-QA-001) | SAME ROOT CAUSE — the architectural cause (no canonical field-registry) |
| CODE-QA-003 (→ MAINT-QA-001) | SAME ROOT CAUSE — the compiler-silence mechanic of the same cause |
| MAINT-QA-001 | SAME ROOT CAUSE — canonical Maintainability consolidation of the above two |
| RELEASE-QA-001 | DEPENDENT CONSEQUENCE — the release-blocker framing of the identical defect |
| VERIFY-QA-001 | RELATED BUT INDEPENDENT — the test oracle that failed to catch it requires a *different* remediation (fix the test architecture, not the production merge code) |

**Primary root cause:** No single, compiler-enforced canonical declaration of "what fields constitute persisted user progress." Three independently hand-maintained field lists exist in `firestore.ts`; the merge list omits 8 fields, so a cold start after a transient sync failure can silently discard them and persist the regression.

**Independent secondary cause:** The regression test for this exact function hand-reimplements the merge formula instead of calling the real `mergeAndSyncUserData()`, so the production defect could not have been caught by the existing suite and any future regression of the same kind still would not be caught until this is separately fixed.

**User consequence:** Real, bounded, recoverable loss of `passedLevelExams` and secondary/history fields.
**Assurance consequence:** The suite's 342/342 pass rate creates false confidence specifically here.
**Release consequence:** Sole cause of the RELEASE-QA-001 proven blocker.
**Security consequence:** None directly, but the same schema-ownership gap is why SEC-QA-001 (no server-side field validation) is easy to introduce — cross-referenced, not merged (different remediation layer: Firestore rules, not client merge code).

**Recommended implementation boundary:** TWO Global findings — one production/schema fix (GLOBAL-QA-001), one independent test-architecture fix (GLOBAL-QA-002) — both owned by Sprint 1, sequenced so the schema fix lands first and the oracle fix exercises it.

## CLUSTER-002 — Remote absent vs. remote-fetch-failure semantics

**Shared technical surface:** the merge/sync decision logic in `mergeAndSyncUserData()` and its caller chain; secondarily, user-facing sync-failure signaling.

| Finding | Relationship |
|---|---|
| DATA-QA-001 | PRIMARY — a failed remote fetch is treated as "no remote data exists," which can authorize a destructive local-over-remote overwrite |
| REL-QA-004 | RELATED BUT INDEPENDENT — cloud-sync failures are console-only/not surfaced to the user; this is a *user-visibility* gap, not the *merge-decision-safety* gap DATA-QA-001 describes. Fixing one does not fix the other. |

**Primary root cause:** The fetch layer does not distinguish `REMOTE_DATA_ABSENT` from `REMOTE_FETCH_FAILED` as separate outcomes, so both are treated identically by the merge decision.
**Independent secondary cause:** Sync failures anywhere in the pipeline are `.catch(console.warn)`-only with no user signal.
**User consequence:** Risk of a destructive local-over-remote overwrite decision made on unknown (not actually empty) remote state; separately, users have no way to know a sync silently failed.
**Release consequence:** None currently proven as a release blocker (no live-fire evidence found of an actual overwrite), but the mechanism is real and reachable.

**Recommended implementation boundary:** Two Global findings, both Sprint 1 for surface-reuse efficiency (both touch the sync-failure code path) — GLOBAL-QA-003 (decision-safety fix, MUST FIX) and GLOBAL-QA-004 (user-visibility fix, SHOULD FIX).

## CLUSTER-003 — Reset semantics vs. reality

**Shared technical surface:** the local-data-reset action and its interaction with signed-in cloud merge; the reset UI's failure handling.

| Finding | Relationship |
|---|---|
| DATA-QA-003 | PRIMARY — a reset described/treated as "irreversible" is silently undone by the next cloud merge for signed-in users |
| REL-QA-003 | RELATED BUT INDEPENDENT — the reset *operation itself* can silently fail with no user signal; this is about failure-handling of the action, not about a *successful* reset being later reversed |

**Primary root cause:** The reset implementation and its user-facing copy assert a stronger guarantee ("irreversible") than the sync architecture actually provides for signed-in accounts.
**Independent secondary cause:** `try`/`catch` around the reset's own storage-clear operation swallows failure without a user-visible signal, unrelated to the merge-reversal issue.
**User consequence:** A user who resets data believing it is gone forever can have it silently restored by the next successful cloud sync; separately, a user whose reset silently failed believes it succeeded.

**Recommended implementation boundary:** Two Global findings, both Sprint 1 (same UI/action surface, worth touching once) — GLOBAL-QA-005 (contract fix, SHOULD FIX) and GLOBAL-QA-006 (failure-surfacing fix, SHOULD FIX).

## CLUSTER-004 — Account deletion lifecycle

**Shared technical surface:** `deleteAccount()`'s Firestore-then-Auth deletion sequence.

| Finding | Relationship |
|---|---|
| DATA-QA-004 | SAME ROOT CAUSE — non-atomic Firestore-then-Auth ordering can orphan a live Auth account with already-deleted Firestore data |
| SEC-QA-003 | SAME ROOT CAUSE — identical ordering fact, plus the additional observation that `dailyTasks` subcollection is never purged |

Both findings describe the exact same code path and would require the exact same remediation (explicit ordering/failure-handling + completing the deletion scope). This is a genuine merge, not an over-collapse — the underlying implementation unit is one function.

**Primary root cause:** `deleteAccount()` has no explicit failure-path reasoning between its two irreversible external calls, and its cleanup scope is incomplete.
**User consequence:** A user can end up with a "deleted" account that's actually still live (Auth), or Firestore data (`dailyTasks`) that outlives an otherwise-complete deletion.
**Security consequence:** Undermines the "fully erased" guarantee stated to the user.

**Recommended implementation boundary:** One Global finding — GLOBAL-QA-007 — Sprint 1 (same account-lifecycle surface as the reset work in CLUSTER-003), SHOULD FIX. This sprint must not claim true cross-service atomicity is achieved if the client-only architecture cannot provide it (see `01_ROOT_CAUSE_PLAN.md` guidance for the future Sprint 1 implementation agent).

## CLUSTER-005 — Exam vs. practice reward/quest attribution

**Shared technical surface:** `src/domain/practice/answer.ts` (`applyPracticeAnswer`, `_sessionMode` parameter).

| Finding | Relationship |
|---|---|
| CORE-QA-001 | PRIMARY — the user-visible correctness defect: exam answers silently satisfy the daily practice quest and reward economy |
| CODE-QA-004 (→ MAINT-QA-005) | SAME ROOT CAUSE — the API-clarity framing of the identical unused parameter |
| MAINT-QA-005 | SAME ROOT CAUSE — canonical Maintainability consolidation of the above |

**Primary root cause:** `_sessionMode` is threaded through the entire call chain but never consulted inside `applyPracticeAnswer`.
**User consequence:** Breaks the stated separation between "daily practice" and "level exam" as distinct product mechanics.

**Recommended implementation boundary:** One Global finding — GLOBAL-QA-008 — Sprint 2 (a Product Quality correctness fix, not a data-integrity/release-blocking concern; no synergy benefit from doing it in Sprint 1), SHOULD FIX.

## CLUSTER-006 — Signing / artifact provenance

**Shared technical surface:** `android/app/build.gradle`'s release buildType, and the separate/unrelated question of actual EAS/Play production signing.

| Finding | Relationship |
|---|---|
| SEC-QA-004 | SAME ROOT CAUSE — repo/CI Gradle release buildType signs with the debug keystore |
| SUPPLY-QA-004 | SAME ROOT CAUSE — identical fact, CI-artifact-authenticity framing |
| RELEASE-QA-002 | RELATED BUT INDEPENDENT — EAS production AAB signing / Play App Signing is a *separate, unverified* fact; both source audits explicitly and correctly declined to extend the debug-signed-repo-APK evidence to it |

SEC-QA-004 and SUPPLY-QA-004 describe the identical observed fact from two audit lenses and would require the identical remediation (distinguish QA/debug artifact signing from release distribution signing) — a genuine merge. RELEASE-QA-002 must NOT be merged into this cluster's fix, because it is an external verification task (read-only Play/EAS Console access), not a code-level defect — merging it would incorrectly convert a NOT VERIFIED condition into part of a "proven defect" fix.

**Recommended implementation boundary:** Two Global findings — GLOBAL-QA-009 (repo/CI signing hygiene fix, Sprint 3, SHOULD FIX) and GLOBAL-QA-010 (EAS/Play production signing verification task, Sprint 3, MUST VERIFY as a release condition, not a code fix).

## CLUSTER-007 — Privacy policy surface

**Shared technical surface:** the app's Privacy Policy content and its public hosting/URL.

| Finding | Relationship |
|---|---|
| RELEASE-QA-003 | PRIMARY (release blocker) — the publicly configured URL does not anonymously expose an app-specific policy at all (generic shell / 404 / 403) |
| COMPAT-QA-001 | RELATED BUT INDEPENDENT — the in-app Privacy Policy content that DOES exist is hardcoded Turkish, bypassing the app's working locale system |

These are genuinely independent remediation units: RELEASE-QA-003 requires standing up durable, public, anonymous hosting of app-specific policy content (an infrastructure/hosting task); COMPAT-QA-001 requires localizing existing in-app content into the app's real English/Turkish locale system (a content/i18n task). Merging them would obscure that one is a release-blocking hosting gap and the other is a Product Quality localization gap with a different owner and timeline.

**Recommended implementation boundary:** Two Global findings, sequenced for efficiency — GLOBAL-QA-012 (localize/finalize the canonical bilingual privacy-policy copy, Sprint 2, SHOULD FIX) produces the content that GLOBAL-QA-011 (host it durably and publicly, Sprint 3, MUST FIX — release blocker) then publishes, avoiding writing the policy copy twice.

## CLUSTER-008 — Test oracle / failure-path assurance

**Shared technical surface:** `tests/testSuite.ts`'s verification of sync/merge and clock-anomaly behavior.

| Finding | Relationship |
|---|---|
| VERIFY-QA-001 | Already addressed under CLUSTER-001 (RELATED BUT INDEPENDENT member) — not re-listed as its own cluster to avoid double treatment |
| VERIFY-QA-002 | INDEPENDENT — a different test, exercising a different production function (clock/anomaly detection), with no shared root cause with VERIFY-QA-001 beyond both being test-oracle-quality gaps in the same file |

**Recommended implementation boundary:** VERIFY-QA-002 remains its own Global finding — GLOBAL-QA-013 — Sprint 1 (explicitly in-scope per the sprint's own verification-architecture theme, cheap to fix alongside the merge-oracle work in the same file), SHOULD FIX. No cluster-level merge with VERIFY-QA-001 — manufacturing a shared cluster here would violate the "do not create fake clusters" rule.

## Findings NOT placed in a cluster (standalone Global findings)

The following canonical findings have no genuinely overlapping root cause with any other current finding and are carried directly to `04_GLOBAL_FINDINGS.md` as standalone items: SEC-QA-001, SEC-QA-002, SEC-QA-005, CORE-QA-002, REL-QA-001, REL-QA-002, MAINT-QA-002, MAINT-QA-003, MAINT-QA-004, PERF-QA-001, PERF-QA-002, PERF-QA-003, PERF-QA-004, A11Y-QA-001, A11Y-QA-002, A11Y-QA-003, SUPPLY-QA-001, SUPPLY-QA-002, SUPPLY-QA-003, SUPPLY-QA-005, SUPPLY-QA-006, RELEASE-QA-004, RELEASE-QA-005, RELEASE-QA-006, CD-004, CD-005, CD-006.
