# SECURITY-001-BASELINE — Threat Model

Revision: `16b9aab1f776503ec52067d4f543af8ab6f2e9aa`

## Assets

| Asset | Where | Sensitivity |
|---|---|---|
| Firebase identity (uid, email) | Firebase Auth | Personal, not high-value |
| Display name | Auth + Firestore | Low |
| Learning progress (xp, streak, badges, per-item progress, passedLevelExams) | Firestore `/users/{uid}/**`, AsyncStorage | Low-value to attacker, meaningful to user |
| Local persisted app state (settings, session cache, telemetry ring buffer) | AsyncStorage | Low, device-scoped |
| Firestore quota/billing | GCP project | Business-facing, not user-facing |
| Production signing identity | EAS-managed credentials (not this repo) | High if compromised, but out of this repo's direct control |
| Repo credentials/config | GitHub repo, `.env`/`.env.example` | Firebase Web config is not secret; any real secret would be high |

No payment data, no health data, no government ID, no third-party OAuth tokens, no chat/social graph. This materially lowers the ceiling on plausible severity versus a financial or health app — MASVS reasoning below is applied proportionally, not mechanically.

## Threat actors

| Actor | Capability | Primary concern |
|---|---|---|
| A. Anonymous internet user | No app, no account, network access to Firebase endpoints | Can they read/write anything without auth? |
| B. Authenticated legitimate user | Normal app usage | Baseline — not a threat, but defines the "own data" boundary |
| C. Authenticated malicious user, own UID | Modified/scripted client, valid Firebase Auth session | Can they corrupt/fabricate their OWN progress with no server check? |
| D. Authenticated user targeting another user's data | Valid account, arbitrary Firestore SDK calls | Can they read/write `/users/{otherUid}`? |
| E. Attacker with modified/untrusted Firebase client | Custom client hitting Firestore REST/SDK directly, bypassing app UI entirely | Same as C/D — rules are the only real boundary since there is no server; client trust is not assumed |
| F. User on lost/shared/backed-up Android device | Physical device or device-backup access | Can they extract another person's session or data from local storage / Android Auto Backup? |
| G. Accidental secret exposure | N/A (process risk) | Is any real secret (not Firebase Web config) committed or logged? |
| H. Supply-chain / build config risk | N/A (process risk) | Build/signing config misconfiguration reachable by whom |

## Proportional MASVS framing

MASVS-STORAGE, AUTH, NETWORK, PLATFORM, CODE, RESILIENCE, PRIVACY are used as a reference checklist only. Per explicit scope: root detection, anti-tampering, certificate pinning, and other RESILIENCE-tier controls are NOT required findings for this app — there is no threat-model justification (no DRM, no anti-cheat-for-money, no regulated data) that would make their absence a defect here. Their absence is noted as "not applicable to this app's risk profile," not scored as missing.

## Threats found reachable (summary — full detail in FIRESTORE_ACCESS_MATRIX.md / SECURITY_CONTROL_MATRIX.md)

- **Actor A/D**: not reachable — `firestore.rules` + executable rules-test evidence (E2+E3) confirm strict owner isolation, no anonymous or cross-user path into `/users/{uid}` or its subcollections.
- **Actor C/E**: reachable — no field/type/range validation on owner-writable documents means an authenticated user (or a modified client acting as them) can write arbitrary values to their own progress fields. Blast radius is self-contained (no leaderboard/competitive/monetary surface found in the codebase that this would corrupt for anyone else).
- **Actor F**: partially reachable — `AndroidManifest.xml` sets `allowBackup="true"` with no `dataExtractionRules`/`fullBackupContent` restricting Android Auto Backup scope, so device-backed-up app data (AsyncStorage, including Firebase Auth's persisted session) is broader than necessary. Requires the attacker to already have access to the victim's device backup (e.g., compromised Google account) — not remotely reachable.
- **Actor G**: not reachable — no real secret found tracked or in history; Firebase Web config correctly not treated as one.
- **Actor H**: partially reachable, scope-limited — the repo's `android/app/build.gradle` `release` buildType signs with the debug keystore, but this is confirmed only for local/bare Gradle builds (Scope A), NOT verified for the GitHub CI `android-build` job (Scope B) or the actual EAS `production` AAB (Scope C), since no local `credentials.json` override exists and EAS's default remote-managed signing should apply — not independently confirmed via `eas credentials`.
