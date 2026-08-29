# SECURITY-001-BASELINE — FINAL RESULT (CANONICAL)

**This file is the canonical score source for SECURITY-001-BASELINE. Future Master Consolidation, fix planning, and future SECURITY reaudits should read this file, not `SUMMARY.md` alone, for the authoritative score/severity counts.**

Revision: `16b9aab1f776503ec52067d4f543af8ab6f2e9aa`

## Security & Privacy: 89/100

Confidence: HIGH

| Severity | Count |
|---|---|
| P0 | 0 |
| P1 | 0 |
| P2 | 1 |
| P3 | 3 |
| P4 | 1 |

**SEC-QA-002 final severity: P3**

## How this result was reached

1. **Original independent baseline audit** (`SUMMARY.md`) produced a provisional score of **78/100**, with SEC-QA-002 (Android `allowBackup="true"` with no backup-scope restriction) rated P2 and reviewed/AGREED by a first independent `firebase-security-reviewer` pass.
2. **A dedicated score/severity adjudication** (`SCORE_ADJUDICATION.md`) was then run specifically to test the proportionality of that 78/100 ledger and the P2 call on SEC-QA-002. It identified three ledger errors: a **duplicated deduction** (the same "auth flow not independently tested" root cause charged in both the Authentication and Security Verification Quality dimensions), a **verification-gap over-deduction** (confidence-only "not exhaustively scanned" statements penalized as if they were proven defects, in violation of "UNKNOWN ≠ FAIL"), and a **release-only over-deduction** (SEC-QA-004's debug-keystore signing, confirmed only for the local repo Gradle config and explicitly NOT VERIFIED against the actual CI/EAS-produced build, penalized too heavily for a concern not confirmed to affect the current shipped artifact).
3. It also independently adjudicated **SEC-QA-002 from P2 to P3**: exploiting the missing backup-scope restriction requires an attacker to already have compromised the victim's Google account, or have physical/ADB access to the device — prerequisites that already imply broader compromise than the backup gap itself adds, against a low-value asset (a session gated to gamification data only). This reclassifies it from "meaningful abuse condition" (P2) to "bounded hardening/configuration issue" (P3).
4. A second, **blind independent adjudicator** (`code-reviewer`, given only the rubric, threat model, findings, and adjudication rules — no prior score, no severity preference, no human expectation) was run separately and independently reached the same P3 conclusion for SEC-QA-002, and independently reconstructed a score-loss ledger flagging the identical three defects as proportionate, identical release-only and verification-gap corrections, and a total score of 91/100 under its own alternate dimension grouping — a result consistent with, and confirming the direction and magnitude of, the corrected 89/100 range.
5. **The corrections were accepted**, yielding the canonical score below. All three source artifacts (`SUMMARY.md`, `SCORE_ADJUDICATION.md`, and this file) remain unmodified relative to their own creation — this file is additive only.

## Canonical Scorecard

| Dimension | Max | Score | Lost |
|---|---|---|---|
| Authentication / account security | 15 | 15 | 0 |
| Authorization / cross-user isolation | 20 | 19 | 1 |
| Firebase / own-UID abuse resistance | 10 | 7 | 3 |
| Local data / device protection | 15 | 13 | 2 |
| Privacy / data lifecycle | 15 | 12 | 3 |
| Secrets / credential hygiene | 10 | 10 | 0 |
| Android / app integrity | 10 | 9 | 1 |
| Security verification quality | 5 | 4 | 1 |
| **TOTAL** | **100** | **89** | **11** |

## Findings (canonical severities)

| ID | Title | Severity |
|---|---|---|
| SEC-QA-001 | No server-side field/type/range validation on owner-writable Firestore documents lets an authenticated user fabricate their OWN progress state (xp, streak, badges, passedLevelExams). No cross-user impact. | **P2** |
| SEC-QA-002 | Android `allowBackup="true"` with no `dataExtractionRules`/`fullBackupContent` leaves AsyncStorage-persisted app state (including Auth session) broader-than-necessary backup-eligible | **P3** (locked; was briefly P2 during initial review, overturned by independent score adjudication) |
| SEC-QA-003 | `deleteAccount()`'s non-atomic Firestore-then-Auth ordering, plus `dailyTasks` subcollection never purged, undermines the "fully erased" guarantee. Root cause partially shared with DATA-QA-004 (DATA-001-BASELINE) | P3 |
| SEC-QA-004 | `android/app/build.gradle` release buildType signs with the debug keystore — confirmed for repo Gradle builds only, NOT VERIFIED for CI or EAS production | P3 |
| SEC-QA-005 | Rules test coverage doesn't explicitly assert cross-user denial for `dailyTasks`; no dedicated auth-flow test | P4 |

## Immutable evidence chain

Both source artifacts remain unmodified and stand as the immutable evidence trail behind this canonical result:
- `.audit/quality/runs/SECURITY-001-BASELINE/SUMMARY.md` — original independent audit (documents the 78/100 provisional result and SEC-QA-002's original P2 reasoning, preserved as-is)
- `.audit/quality/runs/SECURITY-001-BASELINE/SCORE_ADJUDICATION.md` — the dedicated adjudication that corrected the ledger and overturned the P2 classification (preserved as-is)
- `.audit/quality/runs/SECURITY-001-BASELINE/THREAT_MODEL.md`, `SECURITY_CONTROL_MATRIX.md`, `FIRESTORE_ACCESS_MATRIX.md`, `PRIVACY_DATA_MAP.md` — supporting evidence, unchanged

This file does not alter or supersede the content of those artifacts — it is a derived, canonical summary reconciling them into a single authoritative score for downstream consumption.
