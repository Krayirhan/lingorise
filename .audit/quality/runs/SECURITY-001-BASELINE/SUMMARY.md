# SECURITY-001-BASELINE — DEEP SECURITY & PRIVACY AUDIT

Revision: `16b9aab1f776503ec52067d4f543af8ab6f2e9aa` (== origin/main at audit time)

## Security & Privacy: 78/100

Confidence: HIGH

Derived independently from current evidence (firestore.rules + rules-test execution, AndroidManifest.xml, build.gradle/eas.json, .env/.gitignore/.env.example, telemetry.ts, auth.ts/firestore.ts deletion path, AppBootstrap.tsx). No expected/prior score was used. No other domain's score (Consumer, CORE, DATA) was consulted before this score was drafted.

## Scorecard (score-loss ledger)

| Dimension | Max | Score | Lost | Why |
|---|---|---|---|---|
| Authentication / account security | 15 | 13 | 2 | Delegated correctly to Firebase Auth SDK; no evidence of insecure handling. Minor: no explicit verification of session-invalidation-on-password-change or account-lockout behavior this pass (E1). |
| Authorization / cross-user isolation | 20 | 19 | 1 | `firestore.rules` gives strict owner-only read/write on all `/users/{uid}` paths, verified both statically (E2) and via an executable emulator test that is green in CI on this exact HEAD (E3). No anonymous or cross-user path exists. Minor: rules test doesn't explicitly assert cross-user denial for `dailyTasks` (same rule pattern as tested paths, verification gap not a defect). |
| Firebase / own-UID abuse resistance | 10 | 6 | 4 | No field/type/range validation on any owner-writable document — a malicious/modified client can fabricate arbitrary `xp`/`streak`/`badges`/`passedLevelExams`/`level` on their OWN account (SEC-QA-001). Confirmed via `firestore.rules` and `src/services/firestore.ts`'s client-trust write path. Blast radius is self-contained: no leaderboard, no competitive visibility, no monetary/quota stake tied to these fields was found in the codebase. |
| Local data / device security | 15 | 10 | 5 | `AndroidManifest.xml` sets `allowBackup="true"` with no `dataExtractionRules`/`fullBackupContent` restricting Android Auto Backup scope, so AsyncStorage-persisted app state (including Firebase Auth's session cache) is broader-than-necessary backup-eligible (SEC-QA-002). Requires prior access to the specific device's backup (e.g. compromised Google account) — not remotely reachable. |
| Privacy / data lifecycle | 15 | 11 | 4 | Clean data map (no third-party analytics/ad SDK, no PII in telemetry). `deleteAccount()`'s Firestore-then-Auth ordering is not atomic, and independent review additionally confirmed `deleteUserData()` never deletes the `users/{uid}/dailyTasks/**` subcollection, leaving it orphaned after account deletion (SEC-QA-003). Same root cause already scored in DATA-001-BASELINE as DATA-QA-004 (P3) — deduction here is deliberately kept light to avoid double-counting, applied only for the privacy-guarantee angle ("data believed fully erased may not be"). |
| Secrets / credential hygiene | 10 | 9 | 1 | `.env` gitignored and confirmed never committed (`git log --all -- .env` empty); `.env.example` contains only Firebase Web client config, which is correctly not a secret; `debug.keystore` tracked is normal Android convention, not a leak; no `google-services.json` present. Minor deduction for the practical limit of a single-pass git-history scan rather than exhaustive historical secret-scanning. |
| Android / app integrity | 10 | 7 | 3 | Manifest hygiene is good (minimal exported surface, only launcher activity exported). `android/app/build.gradle`'s `release` buildType signs with the debug keystore (SEC-QA-004) — **confirmed only for the repo's local/bare Gradle build (Scope A)**. NOT VERIFIED whether this affects the GitHub CI `android-build` job output (Scope B) or the actual EAS `production` AAB (Scope C) — no local `credentials.json` override exists, meaning EAS's default remote-managed signing should apply instead, but this was not independently confirmed via `eas credentials`. Per audit rules, this is NOT claimed as "production uses the debug keystore." |
| Security verification quality | 5 | 3 | 2 | Firestore rules have real executable, CI-green coverage of the core isolation matrix (E3). No dedicated auth-flow test exists; Semgrep was unavailable this session (CONNECT_TIMEOUT — a connection failure, not "unconfigured," not held against the product). |
| **TOTAL** | **100** | **78** | **22** | |

## Findings

| ID | Title | Severity | Evidence | Status |
|---|---|---|---|---|
| SEC-QA-001 | No server-side field/type/range validation on owner-writable Firestore documents lets an authenticated user (or a modified client acting as them) fabricate arbitrary progress state (xp, streak, badges, passedLevelExams, level) on their OWN account, undetected | P2 | E2 (`firestore.rules`, `src/services/firestore.ts`) | OPEN |
| SEC-QA-002 | `AndroidManifest.xml` sets `allowBackup="true"` with no `dataExtractionRules`/`fullBackupContent`, leaving AsyncStorage-persisted app state (including Auth session cache) broader-than-necessary eligible for Android Auto Backup | P2 | E2 (`AndroidManifest.xml`) | OPEN |
| SEC-QA-003 | `deleteAccount()`'s non-atomic Firestore-then-Auth ordering can leave a live Auth identity after a partial failure, and `deleteUserData()` never deletes `users/{uid}/dailyTasks/**`, orphaning it after deletion — undermining the "my data/account is fully erased" guarantee. Same root cause as DATA-QA-004 (P3, already scored in DATA-001-BASELINE); privacy angle only, lightly weighted here | P3 | E2 (`src/services/auth.ts`, `src/services/firestore.ts`) | OPEN |
| SEC-QA-004 | `android/app/build.gradle`'s `release` buildType uses `signingConfigs.debug` — confirmed for repo Gradle builds only. NOT VERIFIED for GitHub CI `android-build` or EAS `production` (release-only concern, scope explicitly bounded) | P3 | E2 (repo scope) / NOT VERIFIED (CI, EAS scope) | OPEN |
| SEC-QA-005 | `tests/firestoreRules.test.ts` doesn't explicitly assert cross-user denial for `dailyTasks`; no dedicated auth-flow test exists (verification gap, not a demonstrated defect) | P4 | E3 | OPEN (verification gap) |

Findings were not padded to fill severity quotas — this is the complete set found with real evidence at this depth.

## Independent reviewer: `firebase-security-reviewer`

**Verdict: AGREE.** Given only the factual claims and evidence (no expected score, no prior verdict, no other domain's results), the reviewer independently re-verified all 7 evidence claims against source and confirmed each (CONFIRMED / CONFIRMED with the repo-vs-EAS signing distinction correctly preserved as NOT VERIFIED). The reviewer found no score/severity inflation or understatement, no Firebase-config-as-secret confusion, no App-Check-as-authorization confusion, no cross-user-vs-own-UID confusion, no overstatement of the Android backup risk (correctly framed as "real but access-constrained"), and no signing-scope confusion. The reviewer's one addition — that `deleteUserData()` also never deletes the `dailyTasks` subcollection — has been folded into SEC-QA-003 above (same root cause, not a new independent finding). No score change resulted; the reviewer explicitly endorsed the dimension weighting used.

## Historical reconciliation (performed last, against `.audit/state/FINDING_REGISTRY.md`, read-only)

| Historical ID | Historical status | Reconciliation this pass |
|---|---|---|
| SEC-002 (P4, real Firebase IDs in `.env.example`) | CLOSED | **CLOSED AND STILL VALID** — `.env.example` still contains only Firebase Web client config; per this audit's own explicit rule, that category is not a secret regardless of whether the values are real project IDs. No regression. |
| SEC-003 (P4, GitHub secret scanning / push protection disabled on public repo) | OPEN | **NOT REVERIFIED this pass** — no repo-settings/branch-protection GitHub tool was available in this session's toolset to re-check current status. Carried forward as previously established; not newly confirmed or refuted. |
| DEPLOY-002 (P4, no branch-protection rule on `main`) | OPEN | Adjacent to SEC-003, same tooling limitation — **NOT REVERIFIED this pass**. |

No historical registry file was modified. The independent score above was not adjusted to match or diverge from history — it was fixed before this section was read.

## Final validation

- `git diff -- src`: empty
- `git diff -- tests`: empty
- `git diff -- firestore.rules`: empty
- `git status --short`: only pre-existing untracked/modified audit-artifact and asset files (no application source, test, or rules changes)
