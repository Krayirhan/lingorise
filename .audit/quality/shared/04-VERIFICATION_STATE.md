# 04-VERIFICATION_STATE

Shared Discovery ID: SHARED-DISCOVERY-001
Revision (HEAD): 16b9aab1f776503ec52067d4f543af8ab6f2e9aa
Execution date/time: 2026-08-28 (local session)

## Local verification (run once, this pass)

| Command | Result | Detail |
|---|---|---|
| `npm run typecheck` (`tsc --noEmit`) | **PASS** | 0 errors |
| `npm test` (`tests/testSuite.ts`) | **PASS** | 342 assertions passed, 0 failed |
| `npm run test:rules` (Firestore rules emulator) | **FAIL** | `firebase-tools no longer supports Java version before 21. Please install a JDK at version 21 or above to get a compatible runtime.` — local machine has Temurin 17.0.20.1. Not fixed (out of scope for discovery). CI installs JDK 21 explicitly for this step and passes (see below) — this is a local-environment gap, not a demonstrated code/rules defect. |

## GitHub Actions CI — same HEAD

Run: `33193481724` (https://github.com/Krayirhan/lingorise/actions/runs/33193481724), triggered by commit `16b9aab` ("feat: improve profile settings hierarchy"), event: push to `main`.

| Job | Conclusion |
|---|---|
| `verify` (typecheck + test + test:rules, JDK 21) | **SUCCESS** |
| `android-build` (release APK) | **SUCCESS** |
| `e2e-smoke` (Maestro against release APK) | **SUCCESS** |

No job was inferred — all three statuses above were read directly from the GitHub Actions API for this exact run ID.

## Discrepancy note

Local `test:rules` failure is an environment-only gap (JDK 17 vs required 21+ for `firebase-tools`' bundled emulator). CI's `verify` job explicitly installs JDK 21 for this step and passed. Future auditors should not treat the local FAIL as evidence of a rules defect — treat CI's SUCCESS as the authoritative result for this HEAD, and note that local rules-test execution requires JDK 21+ to reproduce.
