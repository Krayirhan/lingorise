# Current Project Profile

STATUS: INITIALIZED

This file is populated/updated by DISCOVER or BASELINE.

## Identity
- Project: LingoRise
- Repository: Krayirhan/lingorise (local checkout: D:\LingoRise)
- Current revision: `5e09358` (main, 2026-08-27) + **uncommitted working-tree fix** (reaudited RUN-007-REAUDIT). Spaced-repetition review inside daily practice was retired and replaced with a single level-completion exam (commits `c9a7937`, `1d8372d`, `0964e58`); this introduced CORE-004 (P1, opened RUN-006), now CLOSED as of RUN-007-REAUDIT against the working tree — not yet committed/pushed. No open P0/P1 findings.
- Platform/product type: React Native / Expo mobile app (Android buildable; iOS config-only, no committed `ios/` project)
- Release target: Public consumer app store release (Google Play primary) — pre-launch stage
- Repository visibility: Public (was private through RUN-002-REAUDIT)
- CI/CD: `.github/workflows/ci.yml` — 3 jobs (`verify`, `android-build`, `e2e-smoke`), confirmed green on current revision: https://github.com/Krayirhan/lingorise/actions/runs/32900631213. No branch-protection rule on `main` (CI is visible, not enforced) — tracked as DEPLOY-002.

## Technical classification
- Languages: TypeScript (strict mode)
- Frameworks: React 19.2.3, React Native 0.85.3, Expo ~56
- Storage: AsyncStorage (local, authoritative) + Firebase Firestore (optional cloud mirror/sync)
- Backend: Firebase (BaaS) only — no custom server
- Authentication: Firebase Auth (email/password) + guest mode
- Network exposure: Firestore only, rules-enforced tenant isolation (verified correct)
- Third-party services: Firebase (Auth, Firestore), expo-notifications, expo-speech (TTS), expo-sharing

## Risk class
- Aggregate: R3 — Connected authenticated product (low end of R3; local-first architecture keeps most R2 simplicity)
- Last reviewed: 2026-08-27 (RUN-007-REAUDIT)
- Source run: RUN-003-REAUDIT for risk profile (rubric unchanged from RUN-001-BASELINE, v1.0 locked)
- Overall score: 84.9/100 (RUN-001: 71.3 → RUN-002: 78.5 → RUN-003: 82.5 → RUN-004: 83.2 → RUN-005: 83.8 → RUN-006: 80.6 (CORE-004 regression) → RUN-007: 84.9 (CORE-004 fixed, new high) — see RUN-007-REAUDIT/SUMMARY.md. RUN-007 audits the working tree; the CORE-004 fix is not yet committed/pushed.)
