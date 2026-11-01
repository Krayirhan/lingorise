# 17 — Test State

TYPECHECK: **PASS** (tsc --noEmit, 0 errors)
TESTS: **PASS** — 422 assertions passed, 0 failed (`tests/testSuite.ts`, 60 numbered sections)
TEST COUNT: 422 assertions (`npm test`), organized as ~60 named suites/regression blocks

## Coverage by subsystem

| SUBSYSTEM | RATING | NOTES |
|---|---|---|
| Practice engine (meaning-match, pick-the-word, distractors, exhaustion) | STRONG | Dedicated blocks incl. CORE-004 exhaustion regression |
| XP/Streak/Quests/Badges/Merge | STRONG | The single largest block (~430 lines) is a field-merge regression matrix covering DATA-QA-001/002/005/006 by name |
| Exams | STRONG | Build/pass-threshold + CORE-QA-001 exam-vs-practice accounting |
| Auth | WEAK | Only pure error-message mapping is unit tested; no mocked-SDK flow tests for register/login/logout/delete |
| Sync/Multi-device merge | STRONG | Extensively simulated (cold start, stale cloud snapshot, round-trip A→B→A, idempotency) |
| Deletion (account) | WEAK-MODERATE | Dedicated error-class exists for partial-deletion handling, but no direct automated test found for the deletion flow itself |
| Navigation | NONE (unit) | Hand-rolled navigation has no dedicated unit tests found; only indirectly exercised via feature tests |
| UI | NONE (unit), PARTIAL (source-scan) | ACC-001 accessibility block is a source-inspection scanner, not a rendered-UI test |
| Offline | MODERATE | Covered indirectly via merge/rollover tests, no dedicated "offline write, reconnect" integration test found beyond the merge simulations |
| Error handling | MODERATE | ErrorBoundary remount fix (REL-QA-002) has a dedicated test; general error paths mostly covered by the reliability fixes' own regression tests |

Also present: `npm run test:rules` (Firestore emulator rules tests) and `npm run test:e2e:smoke` (Maestro) — **not run in this pass** per the audit's scope instruction to stay read-only and avoid unnecessary environment setup (Firestore emulator, Maestro device); their existence and purpose are noted, not their pass/fail state.
