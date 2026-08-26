# 11 — Release Verdict (REAUDIT)

## Target

Public consumer app store release (Google Play primary) — unchanged from baseline.

## Evaluated revision

`29ce04e` (branch `main`, pushed to `origin/main`, `git status` clean).

## Verdict

**CONDITIONAL GO** — same verdict category as both prior runs, but the underlying evidence base is now meaningfully stronger: CI is restored and proven, two real reliability gaps are fixed, and no new P0/P1 blocker was found.

## Blocking findings

None at P0. None at P1 beyond the one already-known, already-tracked condition below.

## Conditions / accepted risks (updated)

1. **`DATA-001`** (P1, PARTIAL) — unchanged condition from both prior runs. Recommend either performing the real two-device test before public launch, or explicitly accepting this as a known residual risk in writing.
2. **`ACC-001`** (P3, PARTIAL) — unchanged condition. Not a release blocker at this risk tier, but recommended before or shortly after a public launch.
3. **`DEPLOY-002`** (P4, new, OPEN) — no branch-protection rule on `main`. Not a blocker for the current single-developer workflow; becomes more relevant if the project gains contributors.
4. **`SEC-003`** (P4, new, OPEN) — GitHub secret scanning/push protection disabled on the now-public repo. Not a blocker (no secrets currently exposed), but a low-cost hardening step worth taking.
5. **Debug-keystore signing** (pre-existing, not a formally tracked finding but repeated here per prior runs' own practice) — the release APK is still signed with `android/app/debug.keystore`. Must be replaced with a real production keystore before an actual Play Store submission; unrelated to code quality but directly gates the release mechanics.

## Required release evidence (updated)

- ✅ Release build produces a working, installable artifact — verified via CI's `android-build`/`e2e-smoke` jobs (`gradlew assembleRelease`), both green on the evaluated revision.
- ✅ Domain test suite passes — 300/300, re-confirmed fresh this reaudit, same count as `RUN-002-REAUDIT` (no regression).
- ✅ `tsc --noEmit` — 0 errors, re-confirmed fresh.
- ✅ Firestore rules test suite — passes in CI (`verify` job, JDK 21); not independently re-executable on this local machine (Java 8) — see limitations.
- ✅ Real on-device end-to-end UI flow (guest onboarding → home screen) — passes in CI's `e2e-smoke` job on a real Android emulator, the first time this has ever been confirmed live in either prior audit run.
- ✅ Public-repo secret exposure re-checked given the visibility change — no committed secrets found.
- ⚠️ Store data-safety disclosure (`17-data-safety-worksheet.md`) still not independently re-verified against the current data model (same gap as both prior runs).
- ⚠️ `DATA-001`'s real-world multi-device scenario remains unverified (same gap as both prior runs).

## Checks executed (this reaudit)

- `git status` — clean working tree, up to date with `origin/main`.
- `npx tsc --noEmit` — 0 errors.
- `npm test` — 300/300 pass.
- `npm run test:rules` (local) — fails on a pre-existing local Java-version gap (not a project defect); CI's equivalent step (JDK 21) confirmed passing on the same revision.
- `gh run list` / `gh run view 32900631213` — confirmed all 3 CI jobs green on the exact evaluated revision.
- `gh api repos/Krayirhan/lingorise` — confirmed public visibility, no branch protection, secret scanning disabled.
- `git ls-files` secret-pattern scan — no new committed secrets found.
- Direct source read of `catalogueService.ts`/`AppBootstrap.tsx` — confirmed the two reliability timeout fixes are genuinely present.

## Limitations

Same as `RUN-002-REAUDIT/11_RELEASE_VERDICT.md`, plus: `test:rules` could not be executed live on this local machine this pass (substituted with CI's current passing run of the identical command); the release build itself was not independently re-run locally this pass (CI's fresh, current run on the exact evaluated revision was used as direct evidence instead, judged sufficient given it is the same command against the same revision).
