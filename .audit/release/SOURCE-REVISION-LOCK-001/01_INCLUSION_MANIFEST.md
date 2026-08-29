# Inclusion Manifest

Baseline: HEAD = origin/main = `16b9aab1f776503ec52067d4f543af8ab6f2e9aa`. Every path below is either a tracked modification or an untracked path present in `git status --short` at the start of this run.

## INCLUDE IN RELEASE COMMIT (application source, tests, config, workflow — Sprint 1/2/3 product work)

| Path | Sprint | Reason |
|---|---|---|
| `firestore.rules` | 1 | `isValidUserDoc()` validation (GLOBAL-QA-014) |
| `src/app/AppBootstrap.tsx` | 1, 2 | merge-failure handling, `rolloverToToday()` pre-merge call |
| `src/app/AppNavigator.tsx` | 1 | cloud-sync-failure toast, `onDataReset` wiring |
| `src/components/ErrorBoundary.tsx` | 2 | genuine restart remount (GLOBAL-QA-020) |
| `src/domain/gamification/dailyRollover.ts` | 2 | `rolloverToToday()` helper (DATA-QA-006) |
| `src/domain/practice/answer.ts` | 2 | exam/practice quest-accounting fix (GLOBAL-QA-008) |
| `src/features/practice/components/WordPrompt.tsx` | 2 | font-scale + hitSlop (GLOBAL-QA-015/025) |
| `src/features/profile/components/AccountManagementCard.tsx` | 1 | `PartialAccountDeletionError` handling |
| `src/features/profile/components/DataManagementCard.tsx` | 1, 2, 3 | reset semantics, Privacy Policy i18n, real hosted Privacy Policy URL (RELEASE-QA-003) |
| `src/features/profile/profile.types.ts` | 1 | supporting type change for reset/account-deletion flow |
| `src/i18n/profile.ts` | 2 | Privacy Policy + reset-dialog EN/TR keys |
| `src/screens/PracticeScreen.tsx` | 2 | hitSlop (GLOBAL-QA-025) |
| `src/services/auth.ts` | 1 | `PartialAccountDeletionError` |
| `src/services/firestore.ts` | 1 | `fetchUserDataResult()`, canonical merge delegation, `dailyTasks` purge |
| `src/services/storage.ts` | 1 | `clearAllLocalData()` result shape |
| `src/state/useUserProgress.ts` | 1, 2 | `reloadLocalOnly`, `cloudSyncFailureNotice`, `rolloverToToday` refactor, `levelSetAt` stamping |
| `src/theme/colors.ts` | 2 | WCAG AA contrast fix (GLOBAL-QA-026) |
| `src/types/user.ts` | 2 | `levelSetAt?: number` field |
| `tests/firestoreRules.test.ts` | 1 | rules validation tests |
| `tests/testSuite.ts` | 1, 2 | full regression suite (422 assertions) |
| `src/domain/sync/` (new dir: `progressMerge.ts`, `remoteSync.ts`, `clockAnomaly.ts`) | 1, 2 | canonical merge engine, `MOST_RECENTLY_SET_LEVEL`, `normalizedStreak` |
| `.github/workflows/ci.yml` | 3 | Maestro version pin, CI signing-semantics comment |
| `.github/dependabot.yml` | 3 | version-update automation config |
| `firebase.json` | 3 | Hosting config for the privacy-policy/account-deletion pages |
| `public/privacy-policy/index.html` | 3 | RELEASE-QA-003 closure content |
| `public/account-deletion/index.html` | 3 | Play account-deletion web surface |

## AUDIT ARTIFACT — INCLUDE (this quality/release program's own record)

| Path | Reason |
|---|---|
| `.audit/quality/` (all of Sprint 1/2/3 fix and reaudit artifacts, MASTER-001, DATA-002-REAUDIT, VERIFICATION-ASSURANCE-002-REAUDIT, SPRINT-002-TARGETED-REAUDIT) | The documented evidence trail this exact release candidate is built on — excluding it would sever the release's own justification from its source revision |
| `.audit/release/SOURCE-REVISION-LOCK-001/` (this directory, as it is completed) | This run's own artifacts |

## PRE-EXISTING / UNRELATED — EXCLUDE

| Path | Reason |
|---|---|
| `.audit/consumer/CURRENT_CONSUMER_STATE.md` | Modified by a separate, unrelated Consumer Design audit track (commits `04ddf55`, `85568b3`, both already on `main` before Sprint 1 began) — not part of MASTER-001's quality/release lineage, was already uncommitted in the working tree before this quality program started |
| `.audit/consumer/RUN_REGISTRY.md` | Same track, same reasoning |
| `.audit/consumer/evidence/` | Same track — untracked, unrelated |
| `.audit/consumer/runs/CONSUMER-003-REAUDIT/` | Same track — untracked, unrelated |
| `assets/lingorise-wordmark-ai.png` | Not referenced anywhere in `src/` (confirmed via grep) — unused, unrelated to any Sprint 1/2/3 evidence, no Sprint claims this belongs to the release |
| `assets/lingorise-wordmark-project.png` | Same — not referenced, not claimed by any Sprint |
| `assets/sprig-mascot-idle-polished.png` | Same — not referenced; per Section 3's explicit caution, must not accidentally replace/include an unapproved mascot asset |
| `.firebase/` | Local Firebase CLI deploy-cache directory (created by this session's `firebase deploy --only hosting` run) — a local artifact, not project source; should not be committed (recommend adding to `.gitignore` in a future, separate housekeeping change, not this release commit) |

## SECRET / SENSITIVE — MUST NOT COMMIT

None found. `.env` is confirmed `.gitignore`d (`git status --ignored` shows `!! .env`). No untracked keystore, PAT, service-account JSON, or credential file was found anywhere in `git status --short`'s output. Full scan detail: `05_RULES_AND_SECURITY_EVIDENCE.md`.

## UNSURE — REVIEW REQUIRED

None. Every path in the current `git status --short` output was confidently classified above.
