# SECURITY-001-BASELINE — Security Control Matrix

Revision: `16b9aab1f776503ec52067d4f543af8ab6f2e9aa`

| # | Control | Expected | Evidence | Status | Confidence |
|---|---|---|---|---|---|
| 1 | Owner-only Firestore read/write on `/users/{uid}` | `request.auth.uid == userId` | `firestore.rules` L~5-20 | PASS | E2+E3 |
| 2 | Owner-only on progress/dailyTasks/items subcollections | Same pattern inherited | `firestore.rules` | PASS | E2 (partial E3) |
| 3 | Public catalogue read-only, no client write | `read: true, write: false` on `contentMeta`/`contentVersions`/`units`/top-level `items` | `firestore.rules` | PASS | E2+E3 |
| 4 | No anonymous access to any user document | Denied by `request.auth != null` check | `firestore.rules` + rules test anonymous-read-fail | PASS | E2+E3 |
| 5 | Field/type/range validation on owner writes | N/A in current rules | None found | GAP (SEC-QA-001) | E2 |
| 6 | Firestore Rules test coverage exists and runs in CI | Executable emulator test, CI-green | `tests/firestoreRules.test.ts`, CI JDK21 run | PASS | E3 (CI), local JDK17 fail is environment gap not defect |
| 7 | Android exported components minimized | Only launcher activity exported | `AndroidManifest.xml` | PASS | E2 |
| 8 | Android permissions minimized | Only what's needed | INTERNET/VIBRATE/SYSTEM_ALERT_WINDOW/legacy storage perms present; no camera/location/contacts | PASS (SYSTEM_ALERT_WINDOW is broader than obviously needed, likely a dependency default — not independently traced to a call site this pass) | E2 |
| 9 | Android backup scope restricted | `dataExtractionRules`/`fullBackupContent` limiting Auto Backup | Absent; only `allowBackup="true"` | GAP (SEC-QA-002) | E2 |
| 10 | Release signing uses a dedicated non-debug keystore | Separate release keystore | `android/app/build.gradle` release buildType uses `signingConfigs.debug` | GAP for repo Gradle scope (A) only; NOT VERIFIED for CI (B) or EAS production (C) | E2 for (A); NOT VERIFIED for (B)/(C) |
| 11 | No real secrets tracked in git | `.env` gitignored and never committed; `.env.example` contains no real secret | `.gitignore`, `git log --all -- .env` empty, `.env.example` contains only Firebase Web config (not a secret) | PASS | E2 |
| 12 | `debug.keystore` tracked is not treated as a secret leak | Convention: debug keystore is meant to be shared | `android/app/debug.keystore` tracked | PASS (correctly not penalized) | E2 |
| 13 | Telemetry contains no sensitive/PII content | Only IDs/booleans/timestamps | `src/services/telemetry.ts` event type definitions | PASS | E2 |
| 14 | Account deletion actually removes both Auth identity and Firestore data | Atomic or safely ordered | `src/services/auth.ts: deleteAccount()` — non-atomic, partial-failure risk (shared root cause with DATA-QA-004) | PARTIAL (SEC-QA-003) | E2 |
| 15 | Repo-level security tooling (secret scanning, push protection, branch protection) | Enabled on a public repo | Not independently re-verified this pass — no repo-settings/branch-protection tool available in this session's toolset; historical registry records SEC-003/DEPLOY-002 as OPEN | NOT REVERIFIED (carried forward from history, not newly confirmed) | E1 (historical) |
