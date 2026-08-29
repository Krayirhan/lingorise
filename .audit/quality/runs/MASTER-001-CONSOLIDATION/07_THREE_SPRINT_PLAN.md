# MASTER-001 — Three Sprint Plan (Canonical Implementation Plan)

**TOTAL IMPLEMENTATION SPRINTS: 3**

---

# SPRINT 1 — INTEGRITY & VERIFICATION

## Objective
Eliminate the highest-risk persisted-state/cloud-merge defects and make the verification system exercise real production behavior so the same defect class cannot silently regress.

## Global findings
GLOBAL-QA-001 (P1, MUST), GLOBAL-QA-002 (P1, MUST), GLOBAL-QA-003 (P1, MUST), GLOBAL-QA-004 (P3, SHOULD), GLOBAL-QA-005 (P2, SHOULD), GLOBAL-QA-006 (P3, SHOULD), GLOBAL-QA-007 (P3, SHOULD), GLOBAL-QA-013 (P3, SHOULD), GLOBAL-QA-014 (P2, SHOULD), GLOBAL-QA-031 (P4, FIX IF CHEAP)

## Canonical findings covered
DATA-QA-001, DATA-QA-002, DATA-QA-003, DATA-QA-004, MAINT-QA-001, SEC-QA-001, SEC-QA-003, SEC-QA-005, VERIFY-QA-001, VERIFY-QA-002, REL-QA-003, REL-QA-004, RELEASE-QA-001 (as consequence)

## Why Sprint 1
This cluster contains the largest technical/risk concentration in the entire backlog: the only two Product-Quality-side P1s (DATA-QA-001/002) and the only Assurance P1 (VERIFY-QA-001), plus the sole owner of the first proven Release blocker (RELEASE-QA-001). Everything else in this sprint (reset semantics, account deletion, the second verification finding, the Firestore-rules validation) shares the exact same code surfaces (`firestore.ts`, the reset/account-management UI, the rules file) — bundling them here avoids Sprint 2 or 3 re-touching this surface and causing avoidable churn.

## Implementation boundaries
- Establish ONE canonical, compiler-enforced typed progress-field declaration; all three current consumers (`syncUserData`, `syncUserProgress`, `mergeAndSyncUserData`) must derive from it.
- Classify every persisted field's merge strategy explicitly (monotonic/latest-value/union/richer-record/timestamp-sensitive/daily-state/historical-collection/derived/local-only/cloud-authoritative/resettable/non-resettable) — do not assume MAX/UNION/remote-wins/local-wins uniformly.
- Introduce explicit failure states distinguishing `REMOTE_DATA_PRESENT` / `REMOTE_DATA_ABSENT` / `REMOTE_FETCH_FAILED` (and other states as source requires) so a fetch failure never silently authorizes a destructive local-over-remote decision.
- Reconcile reset semantics to one coherent contract (genuinely synchronized reset, or explicitly local-only with matching copy) and surface reset-operation failure to the user.
- Improve account-deletion lifecycle ordering/failure-signaling/cleanup completeness (include `dailyTasks`) without claiming unsupported cross-service atomicity.
- Refactor the multi-device merge test to call the real production merge function; replace the tautological clock-anomaly test with one that calls the real detection function.
- Add Firestore-rules field/type/range validation for owner-writable progress fields, mirroring the new canonical schema; add the missing `dailyTasks` cross-user rules-test assertion.
- Files/systems likely affected: `src/services/firestore.ts`, `src/services/storage.ts`, `src/state/useUserProgress.ts` (or `src/hooks/useUserProgress.ts` per actual location), `AppBootstrap`, `UserData`/progress type definitions, account/data-management service and its UI's failure/reset copy, `firestore.rules`, `tests/testSuite.ts`, `tests/firestoreRules.test.ts`.
- Non-goals: no visual redesign; no new offline-queue architecture; no DI/event-bus/schema framework; no fix for CORE-QA-001/CORE-QA-002/PERF-QA-003/REL-QA-001/REL-QA-002/A11Y/COMPAT findings (Sprint 2); no Release/repository work (Sprint 3) beyond what is strictly required to prove Sprint 1's own tests.

## Required tests
Per the merge test matrix in the Sprint 1 execution prompt (local/remote precedence, remote-absent, remote-fetch-failure, failed-sync-then-restart, per-field scenarios for all 8 previously-omitted fields, protected-field non-regression for XP/streak/learningProgress/solved-rewarded/badges, idempotency, multi-device ordering, migrated/normalized older local state) — all must call real production code, none may hand-reimplement the algorithm.

## Exit gate
No new P0/P1; DATA-QA-001, DATA-QA-002, VERIFY-QA-001, RELEASE-QA-001 recommended CLOSED with executable evidence (Release Blocker Closure Standard applies to RELEASE-QA-001); MAINT-QA-001's root cause compiler-enforced against recurrence; typecheck + existing suite + new suite all pass; independent code reviewer and test reviewer AGREE or resolved ADJUST.

## Targeted reaudits
Required: DATA-002-REAUDIT, VERIFICATION-ASSURANCE-002-REAUDIT. Conditional: MAINTAINABILITY targeted recheck (only if MAINT-QA-001's fix reshapes files scored elsewhere), SECURITY targeted deletion/lifecycle recheck (for SEC-QA-001/SEC-QA-003 closure), RELEASE blocker-only recheck (RELEASE-QA-001 closure evidence only — not a full Release re-audit).

## Release impact
Directly closes (subject to evidence) the first of two current proven Release blockers.

---

# SPRINT 2 — PRODUCT QUALITY & RUNTIME POLISH

## Objective
Correct the remaining meaningful Product Quality defects now that data integrity is safe, without redesigning the application or chasing a perfect score.

## Global findings
GLOBAL-QA-008 (P2, SHOULD), GLOBAL-QA-012 (P2, SHOULD/HIGH-priority for its Sprint 3 dependency), GLOBAL-QA-015 (P2, SHOULD), GLOBAL-QA-018 (P3, IF CHEAP), GLOBAL-QA-019 (P3, IF CHEAP), GLOBAL-QA-020 (P3, SHOULD), GLOBAL-QA-021 (P3, IF CHEAP), GLOBAL-QA-022 (P3, IF CHEAP), GLOBAL-QA-023 (P3, SHOULD), GLOBAL-QA-024 (P3, SHOULD), GLOBAL-QA-025 (P3, SHOULD), GLOBAL-QA-026 (P3, SHOULD), GLOBAL-QA-032 (P4, IF CHEAP), GLOBAL-QA-033 (P4, IF CHEAP), GLOBAL-QA-034 (P4, IF CHEAP), GLOBAL-QA-035 (P4, DEFER), GLOBAL-CD-001 (Consumer, IF CHEAP), GLOBAL-CD-002 (Consumer, IF CHEAP)

## Canonical findings covered
CORE-QA-001, CORE-QA-002, COMPAT-QA-001, A11Y-QA-001, A11Y-QA-002, A11Y-QA-003, REL-QA-001, REL-QA-002, MAINT-QA-002, MAINT-QA-003, MAINT-QA-004, PERF-QA-001, PERF-QA-002, PERF-QA-003, PERF-QA-004, CD-005, CD-006

## Why Sprint 2
None of these findings block the Release Gate or represent data-loss risk; all are bounded, independently remediable Product Quality corrections that do not touch the progress-merge/schema surface Sprint 1 will have just changed, so ordering them after Sprint 1 avoids any risk of one sprint undoing the other's work. GLOBAL-QA-012 is elevated in priority within this sprint because Sprint 3's release-blocker closure (GLOBAL-QA-011) depends on its output.

## Implementation boundaries
- Fix `applyPracticeAnswer`'s session-mode blindness; persist `picked`/`submitted` UI state (or advance `currentIndex` at submit time) for session-restore correctness.
- Route the identified hardcoded-Turkish components (including the in-app Privacy Policy) through the app's i18n system; produce the reviewed bilingual policy copy Sprint 3 will publish.
- Allow core practice/exam prompt text to respect system font-scale instead of shrinking; enlarge the two undersized touch targets; raise muted-text contrast to WCAG AA.
- Make `ErrorBoundary`'s restart action actually restart; add Android backup-scope restrictions; route the one `updateProfile()` call through `services/auth.ts`; type `GoalStep`'s prop to the literal union.
- Render the first interactive screen immediately from the bundled catalogue fallback; reduce answer-time write amplification without regressing correctness; remove dead barrel files/exports; eliminate redundant cold-start `loadUserData()` calls; guard the catalogue-loading race.
- Optionally restore XP visibility on Practice Hub and soften the Profile group-label tone (both LOW/LOW Consumer items).
- Non-goals: no redesign of any screen's layout/visual hierarchy; no touching the progress-merge/schema code Sprint 1 already fixed; no chasing every P4 to zero; CD-004 explicitly out of scope (positioning-level, deferred).

## Required tests
A regression test that an exam-only session does not silently complete the daily practice quest; a session-restore test for the duplicate-answer edge case; an English-locale render check for the newly localized components; manual accessibility checks (font-scale 200%, touch-target measurement, contrast recalculation); no increase in per-answer write count versus Sprint 1's baseline.

## Exit gate
No new P0/P1/P2 introduced; each addressed Global finding has either an automated test or a documented manual verification; typecheck and existing suite pass; independent code reviewer AGREE or resolved ADJUST.

## Targeted reaudits
Required: none mandatory in isolation, but a CORE targeted recheck is required if GLOBAL-QA-008/018 are touched; ACCESSIBILITY targeted recheck if GLOBAL-QA-015/025/026 are touched; COMPATIBILITY targeted recheck if GLOBAL-QA-012 is touched; PERFORMANCE targeted recheck if GLOBAL-QA-023/024 are touched; Consumer reaudit optional (CONSUMER-004) only if GLOBAL-CD-001/002 are implemented. No-need-to-rerun: DATA, SECURITY (data/security surfaces untouched by this sprint), SUPPLY CHAIN, RELEASE.

## Release impact
None of these findings are release-blocking; GLOBAL-QA-012's output is a hard input to Sprint 3's blocker closure.

---

# SPRINT 3 — RELEASE & REPOSITORY HARDENING

## Objective
Turn the corrected product into a verified Google Play release candidate: close the second proven Release blocker and resolve the remaining conditional external verification items.

## Global findings
GLOBAL-QA-011 (P1, MUST), GLOBAL-QA-009 (P3, SHOULD), GLOBAL-QA-010 (Release Condition, MUST VERIFY), GLOBAL-QA-016 (P2, SHOULD), GLOBAL-QA-017 (P2, SHOULD), GLOBAL-QA-027 (P3, IF CHEAP), GLOBAL-QA-028 (Release Condition, MUST VERIFY), GLOBAL-QA-029 (Release Condition, MUST VERIFY), GLOBAL-QA-030 (P3, IF CHEAP), GLOBAL-QA-036 (P4, IF CHEAP)

## Canonical findings covered
RELEASE-QA-002, RELEASE-QA-003, RELEASE-QA-004, RELEASE-QA-005, RELEASE-QA-006, SEC-QA-004, SUPPLY-QA-001, SUPPLY-QA-002, SUPPLY-QA-003, SUPPLY-QA-005

## Why Sprint 3
These are exclusively release-surface and repository-control items — external verification, hosting, signing provenance, and process hardening — none of which should contaminate product/domain logic, and several (GLOBAL-QA-010/028/029) cannot even be attempted until an exact release revision and EAS/Play access are in scope. Ordering last also lets GLOBAL-QA-011 consume GLOBAL-QA-012's Sprint 2 output without rework.

## Implementation boundaries
- Publish the canonical bilingual privacy-policy content to a durable, anonymously-reachable, app-specific URL; update the in-app link; re-verify anonymously.
- Distinguish CI/QA-artifact signing from actual release-distribution signing in the Gradle configuration or its documentation.
- Verify (not fix in code) EAS production AAB signing/Play App Signing, EAS production Firebase environment, and Play Console version/listing/Data Safety/account-deletion declaration state.
- Enable branch protection on `main` and GitHub secret scanning; pin the E2E CI Maestro installer; establish proportionate production observability; establish dependency/security maintenance automation (Dependabot/code-scanning).
- Non-goals: no product-logic changes; no re-opening Sprint 1/2 surfaces; no inventing a heavier CI/security architecture than the project's actual scale warrants.

## Required tests / verification
Live anonymous HTTP re-check of the privacy-policy URL; EAS production build inspection; Play Console manual verification; GitHub repository-settings verification (branch protection, secret scanning enabled); CI workflow diff review for the pinned installer.

## Exit gate
No new P0/P1; RELEASE-QA-003 recommended CLOSED with fresh anonymous verification; the three conditional release requirements each resolve to PASS or a newly and explicitly documented defect; branch protection and secret scanning enabled; independent code reviewer AGREE or resolved ADJUST (where code changes are involved).

## Targeted reaudits
Required: RELEASE blocker-only + conditional-items recheck (not a full Release re-audit unless a new defect is found). Conditional: SECURITY targeted recheck if GLOBAL-QA-009's signing-hygiene change touches security-scored surfaces; SUPPLY CHAIN targeted recheck for branch protection/secret scanning/installer pinning/Dependabot. No-need-to-rerun: CORE, DATA, RELIABILITY, MAINTAINABILITY, PERFORMANCE, ACCESSIBILITY (untouched by this sprint).

## Release impact
Directly closes (subject to evidence) the second and final currently-proven Release blocker, and resolves all three current CONDITIONAL release requirements — the completion of this sprint is the direct precondition for a Release reaudit to potentially reach GO.

---

## Deferred post-release backlog

GLOBAL-QA-035 (mascot asset compression, ACCEPT/DEFER), CD-004 (Memrise metaphor positioning work — NOT MASTER BACKLOG, owned by a future Consumer reaudit).

## Accepted risks

SUPPLY-QA-006 (17 moderate build/dev-only dependency advisories, no established runtime path — accepted, monitored via GLOBAL-QA-036's automation once in place, not an implementation-sprint item).

**TOTAL IMPLEMENTATION SPRINTS: 3**
