RUBRIC_VERSION: 1.0
LOCKED: TRUE
PROJECT_PURPOSE_HASH_OR_REVISION: 4a80283 (git HEAD at audit time)
RISK_PROFILE_REVISION: RUN-001-BASELINE / 2026-08-25

| Domain | Applicability | Weight | Purpose/risk rationale | Expected evidence |
|---|---|---:|---|---|
| Core product correctness | REQUIRED | 16 | Directly implements the product's reason to exist (SRS, mastery, streaks, XP, gamification math). | Test suite results, direct source read of `domain/*`, manual on-device session. |
| Data integrity & persistence | REQUIRED | 15 | Highest realistic failure-impact dimension (data loss = broken core promise); includes local↔cloud sync/merge behavior. | Source read of `storage.ts`, `firestore.ts`, migration/normalize logic, race analysis. |
| Reliability & lifecycle management | REQUIRED | 10 | Crashes and app-lifecycle races are the most likely real-world defect class for a small RN app. | ErrorBoundary coverage, catch-block audit, cold-start race analysis. |
| Testing & verification | REQUIRED | 10 | Determines whether the above claims are actually checked continuously, not just true today. | `npm test` execution, CI config read, coverage-gap mapping. |
| Security (auth + Firestore rules) | REQUIRED | 10 | R3 product: real authorization boundary exists (Firestore rules) and must be verified, not assumed. | Direct `firestore.rules` read, auth flow read, secret-handling scan (redacted). |
| Privacy | IMPORTANT | 6 | Account deletion / data minimization matter for user trust and store policy, proportionate to a low-sensitivity data model. | Deletion-flow trace, telemetry PII scan. |
| Architecture & maintainability | IMPORTANT | 10 | Small team/solo project; maintainability determines how safely future fixes (including this audit's own findings) can be applied. | Layering/import analysis, duplication/dead-code check, file-size/responsibility check. |
| UX/usability | IMPORTANT | 8 | Retention-driven product; a confusing or frustrating core loop directly undermines the purpose. | Manual on-device walkthrough, copy/labeling review. |
| Accessibility | IMPORTANT | 5 | Store-review and inclusivity relevant for a public consumer release; project has prior dedicated accessibility work to verify against drift. | `docs/roadmap/09-accessibility.md` cross-check + source spot-check. |
| Deployment/release engineering | IMPORTANT | 6 | Public store release is the declared target; build/CI/versioning gaps directly gate whether a release can ship safely. | CI config, `eas.json`, build-log evidence, versioning scheme check. |
| Dependency/supply-chain health | SUPPORTING | 4 | Real but secondary risk at this scale; no custom backend to compromise, but outdated/vulnerable deps still matter. | `package.json` dependency freshness/known-issue scan. |

**Total applicable weight: 100.**

## Domain subcriteria

### Core product correctness
- Criterion: SRS interval math (fixed steps, ease growth, jitter, bounds) is correct and tested.
- Applicability: REQUIRED. Evidence expected: `tests/testSuite.ts` interval/leech/taper sections, direct source read.
- Severity ceiling if violated: P0 (silently broken scheduling defeats the entire product).
- Criterion: Gamification counters (streak, XP, mastery, badges) are internally consistent and don't drift/reset incorrectly.
- Applicability: REQUIRED. Evidence expected: source read of `gamification/*`, targeted logic trace.
- Severity ceiling: P1 (a wrong-but-recoverable counter, e.g. an unfair streak reset).
- Criterion: Content-generated values (XP reward, difficulty) that feed the core loop are verified, not just assumed correct because they're "just data."
- Applicability: IMPORTANT. Evidence expected: test coverage check on `content/questions/difficulty.ts`.
- Severity ceiling: P2.

### Data integrity & persistence
- Criterion: Local storage read/write failure does not crash the app or silently corrupt state.
- Criterion: Local↔remote merge never regresses a user's progress (max-wins / item-level merge correctness).
- Criterion: Concurrent local writers (app-lifecycle races) cannot clobber each other's results.
- Applicability: all REQUIRED. Severity ceiling: P0/P1 depending on realistic trigger frequency.

### Reliability & lifecycle management
- Criterion: A rendering exception during the core practice loop is caught, not fatal.
- Criterion: Fire-and-forget async operations don't produce unhandled rejections.
- Applicability: REQUIRED. Severity ceiling: P1/P2.

### Testing & verification
- Criterion: Core domain logic (SRS, mastery, XP, streak) has direct, executable test coverage.
- Criterion: Authorization rules have both ALLOW and DENY test coverage.
- Criterion: CI actually gates merges on the above.
- Applicability: REQUIRED. Severity ceiling: P2 (gap in verification, not necessarily a live bug).

### Security (auth + Firestore rules)
- Criterion: Firestore rules correctly restrict all user-owned collections to their owner.
- Criterion: No hardcoded secrets in source; env-based config only.
- Criterion: Auth error handling doesn't leak credentials/tokens into logs.
- Applicability: REQUIRED. Severity ceiling: P0 (a real cross-user data exposure would be P0; none found — see findings).

### Privacy
- Criterion: "Delete my account" actually removes all Firestore data written by the app for that user.
- Criterion: Telemetry contains no PII and is not transmitted off-device (or if it is, that's disclosed).
- Applicability: IMPORTANT. Severity ceiling: P2 (proportionate to low-sensitivity data model).

### Architecture & maintainability
- Criterion: Domain/state/UI layering is respected (no upward dependency from pure logic into UI/state).
- Criterion: No live business-logic duplication that can silently drift.
- Criterion: No unreasonably large single-responsibility violations in frequently-changed files.
- Applicability: IMPORTANT. Severity ceiling: P3 (maintainability risk, not a live defect, unless duplication is proven live-and-diverging).

### UX/usability
- Criterion: Core loop (onboarding → practice → answer → feedback → next) is clear and dead-end-free.
- Criterion: Mode/labels are unambiguous (verified via the practice-screen wording pass already in this branch).
- Applicability: IMPORTANT. Severity ceiling: P2.

### Accessibility
- Criterion: Interactive elements have accessible roles/labels; touch targets are reasonable; contrast is adequate.
- Applicability: IMPORTANT, evaluated primarily against prior documented work (`09-accessibility.md`) plus spot verification given full manual re-audit is out of this run's time budget — evidence gap disclosed.
- Severity ceiling: P2.

### Deployment/release engineering
- Criterion: CI gates the branch that will be released (typecheck + tests + rules tests, at minimum).
- Criterion: A release build can actually be produced and installed (verified this session via `assembleRelease` + on-device install).
- Criterion: Versioning/signing config is coherent for a store submission.
- Applicability: IMPORTANT. Severity ceiling: P1 (a broken release pipeline blocks shipping entirely).

### Dependency/supply-chain health
- Criterion: Core dependencies (Expo, React Native, Firebase) are on maintained, non-EOL major versions.
- Applicability: SUPPORTING. Severity ceiling: P3.

## N/A rationale
See `03_AUDIT_SCOPE_AND_RISK.md` → Explicit N/A domains. Networking-as-API, standalone Observability, standalone Sync/concurrency, Game-runtime, ML — all excluded from the weighted denominator; none would have independent evidence beyond what's already scored elsewhere.
