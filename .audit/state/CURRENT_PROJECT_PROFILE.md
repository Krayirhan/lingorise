# Current Project Profile

STATUS: INITIALIZED

This file is populated/updated by DISCOVER or BASELINE.

## Identity
- Project: LingoRise
- Repository: Krayirhan/lingorise (local checkout: D:\LingoRise)
- Current revision: 3436a1b (main) — reaudited; CI/CD removed (see RUN-002-REAUDIT)
- Platform/product type: React Native / Expo mobile app (Android buildable; iOS config-only, no committed `ios/` project)
- Release target: Public consumer app store release (Google Play primary) — pre-launch stage

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
- Last reviewed: 2026-08-25
- Source run: RUN-002-REAUDIT (rubric unchanged from RUN-001-BASELINE)
