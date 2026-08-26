# Current Project Profile

STATUS: INITIALIZED

This file is populated/updated by DISCOVER or BASELINE.

## Identity
- Project: LingoRise
- Repository: Krayirhan/lingorise (local checkout: D:\LingoRise)
- Current revision: pending (main) — reaudited; DATA-001 and ACC-001 both fully CLOSED (see RUN-005-REAUDIT). No P1/P3 findings remain open.
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
- Last reviewed: 2026-08-26
- Source run: RUN-003-REAUDIT (rubric unchanged from RUN-001-BASELINE, v1.0 locked)
- Overall score: 82.5/100 (RUN-001: 71.3 → RUN-002: 78.5 → RUN-003: 82.5)
