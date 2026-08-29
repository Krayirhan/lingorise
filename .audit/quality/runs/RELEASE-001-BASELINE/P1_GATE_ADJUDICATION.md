# RELEASE-001 P1 / GATE ADJUDICATION

Revision: `16b9aab1f776503ec52067d4f543af8ab6f2e9aa`

## Original

Release Gate: **NO-GO**
Diagnostic Release Readiness: **61/100**

| P0 | P1 | P2 | P3 | P4 |
|---:|---:|---:|---:|---:|
| 0 | 4 | 0 | 2 | 0 |

## P1 candidate table

| Finding ID | Title | Original severity | Evidence state | Mandatory requirement | Blocking classification (original) | Recommended severity |
|---|---|---|---|---|---|---|
| RELEASE-QA-001 | Cold-start cloud merge can silently erase and persist passed-level exam progress | P1 | PROVEN FAILURE (E2, direct source read, independently re-verified twice) | YES | YES | **P1** |
| RELEASE-QA-002 | Actual EAS production AAB signing / Play App Signing is not verified | P1 | NOT VERIFIED (no proof of wrongness — read-only access unavailable) | YES (mandatory to verify before shipping) | CONDITIONAL | **P3** (conditional release condition) |
| RELEASE-QA-003 | Configured privacy-policy URL does not expose an app-specific policy anonymously | P1 | PROVEN FAILURE (live anonymous HTTP test: generic Claude Artifact shell, content host 404, API 403) | YES | YES | **P1** |
| RELEASE-QA-004 | EAS production Firebase environment is not verified | P1 | NOT VERIFIED (no proof values are missing — read-only access unavailable) | YES (mandatory to verify before shipping) | CONDITIONAL | **P3** (conditional release condition) |

## Confirmed release blockers

1. **RELEASE-QA-001** — `mergeAndSyncUserData` (`src/services/firestore.ts:199-233`) explicitly re-merges only `xp`/`streak`/solved-rewarded IDs/badges/`learningProgress` (MAX/UNION/richest-record); `passedLevelExams`, `dailyQuests`, `questHistory`, `celebratedLevels`, `practiceHistory`, `dailyReviewXpIds`, `level`, `lastActiveDate` fall through from `...remote` unguarded. `state/useUserProgress.ts` syncs fire-and-forget with no retry (`Promise.all([...]).catch(console.warn)`). `AppBootstrap.tsx:45-58` re-runs the merge on every cold start for a signed-in user. Three-part chain (local mutation → transient sync failure → restart) is real, reachable, and writes the regressed state back to Firestore. Proven, not merely suspected.
2. **RELEASE-QA-003** — Anonymous, unauthenticated HTTP verification of the configured privacy-policy URL returned generic noindexed Claude Artifact shell content; the direct content host returned 404; the anonymous frame API returned 403. No LingoRise-specific privacy policy is publicly reachable today. This is a directly tested, proven failure of a mandatory Play Store requirement, not an unverified unknown.

## Conditional / NOT VERIFIED release items

1. **RELEASE-QA-002** — EAS production AAB signing / Play App Signing state could not be read-only inspected (no EAS/Play Console session available). No evidence — positive or negative — exists that the actual production credentials are wrong. The repository's debug-signed Gradle CI APK is explicitly not evidence about the EAS/Play production signing path (correctly kept separate in `RELEASE_PATH_MAP.md`). This is an external fact that must be verified before shipping, not a demonstrated defect.
2. **RELEASE-QA-004** — EAS production environment's six required `EXPO_PUBLIC_FIREBASE_*` values could not be read-only inspected. No evidence that they are absent — CI already injects them and a local `.env` has all six. Must be verified in the actual EAS production environment before shipping, not a demonstrated defect.
3. **RELEASE-QA-005** (already P3/NO) — Play Console versionCode acceptance, listing, Data Safety submission, account-deletion web declaration: same NOT VERIFIED category, unchanged.
4. **RELEASE-QA-006** (already P3/NO) — Remote crash/observability: unchanged, non-blocking improvement.

## Merge defect adjudication

- Proven by current source (`firestore.ts:199-233`, `AppBootstrap.tsx:45-58`, `useUserProgress.ts`): YES.
- Reachable in normal production use: YES — every cold start for a signed-in user re-runs the merge; no unusual configuration required.
- Can erase/revert real user progression: YES, but bounded to secondary/derived fields (`passedLevelExams` and history/state fields) — not XP, streak, per-word mastery, solved/rewarded questions, or badges, which are architecturally protected by the same function's MAX/UNION/richest-record logic.
- Can the damaged state persist back to cloud: YES — the merge result is written back via `syncUserData` after computing it from stale remote data.
- Meaningful workaround: Partial — retaking a lost exam (~15-20 min) or a subsequent successful full sync self-corrects `level`; no workaround prevents the regression from happening.
- Ship-blocking for this exact revision: YES.

**MERGE DEFECT: BLOCKER**
**Severity recommendation: P1**

## Privacy-policy adjudication

- Currently configured URL: known (present in app config).
- Anonymous/public access actually tested: YES, live HTTP test performed during RELEASE-001.
- Fails to expose a durable app-specific policy: YES — generic Claude Artifact shell, 404 on direct content host, 403 on API.
- Google Play requirement verified from current official evidence during RELEASE-001: YES (official Data Safety/account-deletion policy pages checked 2026-08-29, cited in `EXTERNAL_STATE_MATRIX.md`).
- Required for this app's actual data/account model: YES — the app creates Firebase accounts and stores user data, triggering the Data Safety privacy-policy requirement.
- Proven current failure vs. merely NOT VERIFIED: PROVEN — this was directly tested, not left unknown.

**PRIVACY POLICY: BLOCKER**
**Severity recommendation: P1**

## Recommended severity counts

| P0 | P1 | P2 | P3 | P4 |
|---:|---:|---:|---:|---:|
| 0 | 2 | 0 | 4 | 0 |

(P1: RELEASE-QA-001, RELEASE-QA-003. P3: RELEASE-QA-002, RELEASE-QA-004, RELEASE-QA-005, RELEASE-QA-006.)

## Recommended Release Gate

**NO-GO** — unchanged. RELEASE-QA-001 and RELEASE-QA-003 are each independently a proven, current release blocker regardless of how RELEASE-QA-002/004 are classified. The P1 count dropping from 4 to 2 does not change the gate outcome because the gate was never a mechanical function of P1 count — it rests on the two proven blockers.

## Score change: NO

The diagnostic scorecard already models RELEASE-QA-002/004 as partial-credit uncertainty rather than full failures — e.g. "Build / production artifact readiness" 15/20 ("production AAB has not been verified," not "proven wrong"), "Production signing / credentials" 10/20 ("unavailable for read-only verification," not "proven incorrect"). These deductions reflect NOT VERIFIED status, not a FAIL assumption. Reclassifying RELEASE-QA-002/004 from P1-label to P3-label is a severity-tag correction over already-correctly-modeled uncertainty; it does not change any dimension's basis or point value. Diagnostic Release Readiness remains **61/100**.

## Independent reviewer verdict

**AGREE.**

An independent `code-reviewer` pass — given only the P1 definition, the finding evidence, blocker criteria, and the four disputed classifications (no disclosed preferred count, gate, score, or suspicion about the NOT VERIFIED items) — re-verified the merge-defect source chain directly against `firestore.ts:199-233`, `AppBootstrap.tsx:45-58`, and `useUserProgress.ts:132-144`, and confirmed:
1. UNKNOWN is not being treated as FAIL anywhere (only the privacy URL, which was directly tested, is marked FAIL).
2. NOT VERIFIED evidence *is* currently mislabeled P1 for RELEASE-QA-002/004 — this is exactly the inconsistency that needed correcting.
3. Neither RELEASE-QA-001 nor RELEASE-QA-003 is understated; both are correctly P1/blocking.
4. RELEASE-QA-001's P1 (not P0) severity is correct given architecturally-protected core fields and a bounded, recoverable secondary-field loss.
5. RELEASE-QA-003 is a proven failure, not a NOT VERIFIED item.
6. No scope confusion between debug-signed CI APK and actual EAS/Play production signing for RELEASE-QA-002.
7. The Play/EAS external-state assumptions stay within what read-only evidence can actually show.
8. Score should not change — the scorecard already reflects NOT VERIFIED as partial-credit uncertainty, not FAIL.
9. NO-GO remains the correct gate independent of P1 count.

## Canonical recommendation

- Recommended Release Gate: **NO-GO**
- Recommended Diagnostic Release Readiness: **61/100** (unchanged)
- Recommended severity counts: P0: 0, P1: 2, P2: 0, P3: 4, P4: 0
- Confirmed P1 blockers: RELEASE-QA-001, RELEASE-QA-003
- Reclassified P1→P3 conditional items: RELEASE-QA-002, RELEASE-QA-004

## Do Not Change

- FINAL_RESULT.md
- SUMMARY.md
- RELEASE_CHECKLIST.md
- EXTERNAL_STATE_MATRIX.md
- RELEASE_PATH_MAP.md
- Any source, test, or config file
- FINDING_REGISTRY.md

This adjudication is advisory input for Master Consolidation; it does not itself modify the RELEASE-001-BASELINE baseline files listed above.
