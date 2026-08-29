# RELEASE-001-BASELINE — FINAL RESULT

Revision: `16b9aab1f776503ec52067d4f543af8ab6f2e9aa`

## RELEASE GATE: NO-GO

Diagnostic Release Readiness: **61/100**
Confidence: **HIGH**

Gate takes precedence over numerical score. This file is authoritative for Master Consolidation, release fix planning, Release reaudit, and final GO/NO-GO evaluation.

This result incorporates the completed P1/gate consistency adjudication in `P1_GATE_ADJUDICATION.md` (immutable supporting evidence, unchanged by this update).

## Intended production path

Android → EAS production AAB → Google Play. EAS production artifact: **PARTIAL** (profile configured, build unverified). Production signing: **NOT VERIFIED**. CI current HEAD: **PASS**. Privacy policy: **FAIL**. Data Safety: **NOT VERIFIED**. Account deletion: **PARTIAL**. Target/API compliance: **VERIFIED**. Store external state: **NOT VERIFIED**.

| P0 | P1 | P2 | P3 | P4 |
|---:|---:|---:|---:|---:|
| 0 | 2 | 0 | 4 | 0 |

## Confirmed P1 release blockers

### RELEASE-QA-001 — P1
**Cold-start cloud merge can silently erase and persist passed-level exam progress.**

Status: **OPEN** — **BLOCKING: YES**

Reason: Proven reachable production defect. A signed-in cold start can merge incomplete cloud/local progression state and persist damaged secondary progression back to Firestore. This is serious, bounded progression loss (core XP/streak/mastery/badges remain protected by the same merge function's MAX/UNION logic). It is P1, not P0.

### RELEASE-QA-003 — P1
**Configured privacy-policy URL does not expose an app-specific privacy policy anonymously.**

Status: **OPEN** — **BLOCKING: YES**

Reason: Anonymous verification produced a generic artifact shell / inaccessible policy content rather than a durable, publicly accessible LingoRise privacy policy. This is a demonstrated release requirement failure, not an unverified unknown.

## Non-P1 release findings

### RELEASE-QA-002 — P3
**EAS production AAB signing / Play App Signing state.**

Evidence state: **NOT VERIFIED**
Release handling: **CONDITIONAL VERIFICATION REQUIRED**

Do not describe the production artifact as incorrectly signed. The repository/CI release APK may use debug signing, but that does not prove the intended EAS production AAB uses the debug key.

### RELEASE-QA-004 — P3
**EAS production Firebase environment.**

Evidence state: **NOT VERIFIED**
Release handling: **CONDITIONAL VERIFICATION REQUIRED**

Do not claim the production Firebase environment is missing unless separately proven.

### RELEASE-QA-005 — P3
**Play Console version / listing / Data Safety state.**

External state: **NOT VERIFIED / PARTIAL**
Release handling: Must be verified/completed before final production submission.

### RELEASE-QA-006 — P3
**Production observability.**

Non-blocking production-readiness improvement.

## Conditions to clear

1. Fix and failure-path-test the cold-start merge regression so passed exams and omitted fields cannot regress after offline/background sync failure plus restart.
2. Host and anonymously verify a durable, public, app-specific LingoRise privacy policy.
3. Verify exact-revision EAS production AAB signing and Play App Signing.
4. Verify EAS production Firebase environment/configuration.
5. Verify/complete Play Console Data Safety, account-deletion web link, listing, and version state.

## Non-blocking release improvements

1. Confirm/justify `SYSTEM_ALERT_WINDOW` and merged plugin permissions during Play declaration review.
2. Establish remote crash monitoring; current telemetry/logging is local-only.
3. Improve repository merge protection and supply-chain monitoring separately; they do not change the production artifact conclusion here.

## Consistency: proven blocker vs. not-verified external condition

RELEASE-QA-001 and RELEASE-QA-003 are **proven blockers**: directly demonstrated by source evidence (RELEASE-QA-001) and a live anonymous verification test (RELEASE-QA-003). RELEASE-QA-002 and RELEASE-QA-004 are **not-verified external release conditions**: no evidence proves the underlying requirement is actually unmet, only that read-only access could not confirm it — per `P1_GATE_ADJUDICATION.md`, UNKNOWN/NOT VERIFIED is not treated as PROVEN FAILURE, so these are P3 conditional-verification items, not P1.

Release Gate remains **NO-GO** because RELEASE-QA-001 and RELEASE-QA-003 each independently remain proven release blockers, regardless of the P1 count or the classification of RELEASE-QA-002/004. Diagnostic Release Readiness remains **61/100**: severity classification and score are separate, and the scorecard already modeled RELEASE-QA-002/004 as NOT VERIFIED partial-credit uncertainty rather than proven failure.

## Independent reviewer

**AGREE.** An independent `code-reviewer` pass, given only the severity definitions, finding evidence, and disputed classifications (no disclosed preferred outcome), re-verified the merge-defect source chain directly and confirmed: RELEASE-QA-001 and RELEASE-QA-003 are correctly P1/blocking; RELEASE-QA-002/004 were mislabeled P1 despite NOT VERIFIED evidence and are correctly reclassified to P3; no scope confusion between debug-signed CI APK and actual EAS/Play production signing; NO-GO remains correct independent of P1 count; score need not change.

## Known limitations

No authenticated EAS or Play Console access was available. EAS production signing, production environment variables, Play App Signing, listing, Data Safety declaration, account-deletion web declaration, Firebase deployment, and latest Play versionCode remain external-state checks (RELEASE-QA-002, RELEASE-QA-004, RELEASE-QA-005). These unknowns were not misreported as failures except for the anonymously tested privacy URL (RELEASE-QA-003).

## Historical reconciliation

`DATA-QA-002` is **REDISCOVERED** from current source and independently adjudicated as a P1 release blocker (RELEASE-QA-001); its prior severity was not imported. `DEPLOY-001` is **CLOSED AND STILL VALID** for current CI success. `DEPLOY-002`/`SEC-003` are **REDISCOVERED** as non-primary repository hardening concerns. `DATA-004` is **NOT REVERIFIED** as an independent gate condition.

## Canonical authority

This file, as updated, is authoritative for Master Consolidation, release fix planning, Release reaudit, and final GO/NO-GO evaluation. `P1_GATE_ADJUDICATION.md` remains immutable supporting evidence for the severity reclassification recorded above.
