# SECURITY-001-BASELINE — Score / Severity Adjudication

Revision: `16b9aab1f776503ec52067d4f543af8ab6f2e9aa` (unchanged)
Scope: SEC-QA-002 severity + overall score proportionality only. No new findings, no source/test changes, no modification to `SUMMARY.md` or any other existing SECURITY-001-BASELINE file.

## SEC-QA-002 final recommended severity: **P3**

**Verified:** `AndroidManifest.xml` sets `android:allowBackup="true"` with no `dataExtractionRules`/`fullBackupContent`. `src/services/firebase.ts` confirms `initializeAuth(app, { persistence: getReactNativePersistence(AsyncStorage) })` — Auth refresh tokens do live in AsyncStorage and are technically in-scope for Android's default Auto Backup. The underlying fact was not in dispute.

**Reasoning for P3 over P2:** Android Auto Backup restore requires either (a) the same Google account already present on the target device, or (b) ADB backup with USB debugging enabled and physical device access (a largely dead vector since Android 12). Both prerequisites already imply the attacker has compromised the victim's Google account or has privileged physical/debug device access — a compromise level that supersedes anything gained specifically from the missing backup-exclusion rule. On the "lost/shared device" threat-actor scenario specifically, an already-unlocked device signed into the owner's account gives an attacker live app access directly, making the marginal value of the backup path close to zero. The asset at risk (a Firebase session gated to gamification data — no payment/health/identity data) is low-value. This matches "bounded hardening/configuration issue" (P3), not "meaningful security weakness with realistic abuse conditions" (P2). Confirmed independently by a blind `code-reviewer` adjudicator reasoning from the same evidence.

## Complete score-loss ledger (reconciled)

| Dimension | Max | Lost | Score | Root cause | Evidence | Type |
|---|---|---|---|---|---|---|
| Authentication / account security | 15 | 0 | 15 | Original -2 was "no independent verification of session-invalidation/lockout" — this is the same root cause ("auth flow not independently tested") already charged under Security Verification Quality. Removed to avoid double-counting. | E1 | (was VERIFICATION GAP, now folded into the Verification Quality line below) |
| Authorization / cross-user isolation | 20 | 1 | 19 | Rules-test doesn't explicitly assert cross-user denial for `dailyTasks` (same rule pattern as tested paths, not a demonstrated defect) | E2 | VERIFICATION GAP |
| Firebase / own-UID abuse resistance | 10 | 3 | 7 | SEC-QA-001 — no field/type/range validation lets a user fabricate their OWN progress. Real, bounded (self-only, no cross-user impact, no monetary/competitive stake found) | E2 | SECURITY DEFECT (bounded) |
| Local data / device protection | 15 | 2 | 13 | SEC-QA-002 (now P3) — `allowBackup=true` with no exclusion rules; real but access-constrained (requires prior Google-account or physical/ADB compromise) | E2 | SECURITY DEFECT (hardening-tier) |
| Privacy / data lifecycle | 15 | 3 | 12 | SEC-QA-003 — non-atomic delete ordering + `dailyTasks` subcollection never purged on account deletion. Root cause partially shared with DATA-QA-004 (already scored in DATA-001-BASELINE) — kept light for that reason | E2 | SECURITY DEFECT (bounded, privacy-only) |
| Secrets / credential hygiene | 10 | 0 | 10 | Original -1 was a confidence-only statement about scan exhaustiveness, not an identified gap — UNKNOWN is not FAIL. Restored to full. | E2 | (was VERIFICATION GAP, removed — no defect identified) |
| Android / app integrity | 10 | 1 | 9 | SEC-QA-004 — debug-keystore signing confirmed for repo Gradle release buildType only; explicitly NOT VERIFIED for the actual CI or EAS-produced artifact. Per rule 2, a release-only concern not confirmed against the current shipped build must not materially reduce score — deduction reduced to a light touch. | E2 (repo scope only) | RELEASE-ONLY CONCERN |
| Security verification quality | 5 | 1 | 4 | SEC-QA-005 — no dedicated auth-flow test, missing explicit `dailyTasks` cross-user assertion. A verification gap, not a proven defect — reduced from the original heavier deduction per rule 1. | E3 (rules tests exist and pass in CI) | VERIFICATION GAP |
| **TOTAL** | **100** | **11** | **89** | | | |

## Rule-compliance flags

**Duplicated deductions found: YES** — the original ledger charged "auth flow not independently tested" once under Authentication (-2) and again under Security Verification Quality (-2). Corrected by consolidating it into the Verification Quality dimension only.

**Verification-gap over-deduction found: YES** — the original Secrets/credential-hygiene -1 was a confidence statement ("didn't exhaustively scan git history"), not an identified gap; restored to 0 lost (UNKNOWN ≠ FAIL). The original Security Verification Quality -2 for SEC-QA-005 was also heavier than proportionate for a non-proven defect; reduced to -1.

**Release-only over-deduction found: YES** — the original Android/app-integrity -3 for SEC-QA-004 was too material given the finding is explicitly NOT VERIFIED against the actual CI/EAS-produced build (only the local repo Gradle config). Reduced to -1 per adjudication rule 2.

**Threat-model disproportion found: YES** — SEC-QA-002 was originally weighted as if P2 ("meaningful abuse condition"); the realistic attacker-prerequisite chain (prior Google-account or physical/ADB compromise) places it at P3 ("bounded hardening/configuration issue") instead. Local data/device deduction reduced from -5 to -2 accordingly.

## Original score: 78/100

## Recommended canonical score: **89/100**

## Recommended final severity counts

| Severity | Count |
|---|---|
| P0 | 0 |
| P1 | 0 |
| P2 | 1 (SEC-QA-001) |
| P3 | 3 (SEC-QA-002 [downgraded from P2], SEC-QA-003, SEC-QA-004) |
| P4 | 1 (SEC-QA-005) |

## Independent adjudicator: `code-reviewer` — **ADJUST**

Given only the rubric, threat model, the 5 findings' factual claims, and the adjudication rules (no score, no severity preference, no human expectation disclosed), the adjudicator independently reasoned to the same **SEC-QA-002 → P3** conclusion via the same attacker-prerequisite-chain logic, and independently reconstructed a score-loss ledger flagging the identical three defects (SEC-QA-001, SEC-QA-002, SEC-QA-003) as bounded/proportionate SECURITY DEFECTS, SEC-QA-004 as a lightly-weighted RELEASE-ONLY CONCERN, and SEC-QA-005 as a lightly-weighted VERIFICATION GAP — confirming no duplicated deduction, no verification-gap over-deduction, and no release-only over-deduction should remain in a corrected ledger. The adjudicator's own reconstruction (using an alternate dimension grouping that folded SEC-QA-001 into Authorization rather than the rubric's dedicated Firebase-abuse-resistance dimension) totaled 91/100; this file's ledger above preserves the original 8-dimension rubric structure from SUMMARY.md while applying the same underlying corrections, yielding 89/100 — within the same range and confirming the direction and magnitude of every correction, not merely the final number.

## Immutable evidence

This file does not modify `SUMMARY.md`, `SECURITY_CONTROL_MATRIX.md`, `THREAT_MODEL.md`, `FIRESTORE_ACCESS_MATRIX.md`, or `PRIVACY_DATA_MAP.md` — all remain as originally recorded. This adjudication is an additive, derived reconciliation; it does not retroactively alter the original independent audit's own record of its process. Future consumers of this run should treat this file's 89/100 and severity counts as the canonical values (matching the pattern already established by DATA-001-BASELINE's `FINAL_RESULT.md`), superseding SUMMARY.md's 78/100 and SEC-QA-002's original P2 label for scoring purposes only.
