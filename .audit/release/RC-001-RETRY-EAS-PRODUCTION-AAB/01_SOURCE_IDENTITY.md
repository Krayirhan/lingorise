# Source Identity

Repo: `Krayirhan/lingorise`
New exact release source SHA: `b8d0687d7217f46ce28bf269b6fc6a2eb9815ae4` (merge commit from EAS-PROJECT-LINK-001, PR #12)
Previous SHA (superseded): `82adb7719b833f1198c5a2129ae63bf1f9ca48f7`

## Clean RC worktree

Path: `D:/lingorise-rc1-build-v2` (fresh — the two historical worktrees, `D:/lingorise-rc1-build` and `D:/lingorise-eas-link`, were explicitly NOT reused, per instructions).

Created via: `git worktree add D:/lingorise-rc1-build-v2 b8d0687d7217f46ce28bf269b6fc6a2eb9815ae4`.

HEAD before any command: `b8d0687d7217f46ce28bf269b6fc6a2eb9815ae4` — **matches exactly**.
State before `npm ci`: `git status --short` → clean.
State after `npm ci`: `git status --short` → **still clean** (dependency install never touches a tracked file).

## Fresh verification performed in THIS run

`npm run typecheck`: **PASS** (0 errors)
`npm test`: **PASS — 422 passed, 0 failed**

Both run inside the clean worktree, before the build was triggered.

## Post-build source integrity

After the EAS build ran, `git status --short` inside the worktree showed two locally-modified, **never-staged, never-committed** files: `app.json` and `android/app/build.gradle`, both changing only `versionCode: 1 → 2`. This is `eas.json`'s own `production.autoIncrement: true` setting resolving the next versionCode remotely and writing it back to the local working copy — a standard, documented EAS CLI side effect of the build itself, not a manual or unauthorized edit. It occurred entirely within the disposable worktree and was never committed, staged, or pushed anywhere. **`origin/main` was independently re-fetched after the build and confirmed still at exactly `b8d0687d7217f46ce28bf269b6fc6a2eb9815ae4`, byte-for-byte unchanged.** Full detail: `05_PREBUILD_VERIFICATION.md`.

## Carried-forward CI/Rules evidence (from EAS-PROJECT-LINK-001, not re-run here — no rules/product change since that lock)

`verify`, `android-build`, `e2e-smoke` all PASS on this exact SHA's PR (`.audit/release/EAS-PROJECT-LINK-001/05_PR_CI_EVIDENCE.md`); Firestore Rules E3: `Firestore rules: PASS`, exit code 0, real JDK-21 emulator run.
