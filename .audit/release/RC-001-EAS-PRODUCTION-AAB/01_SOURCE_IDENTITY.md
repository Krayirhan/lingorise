# Source Identity

Repo: `Krayirhan/lingorise`
Exact source SHA (locked): `82adb7719b833f1198c5a2129ae63bf1f9ca48f7`
Merged PR: #2 (`release/lingorise-rc1` → `main`)

## Clean RC worktree

Path: `D:/lingorise-rc1-build`
Created via: `git worktree add ../lingorise-rc1-build 82adb7719b833f1198c5a2129ae63bf1f9ca48f7` (from the original repo at `D:/LingoRise`, which itself contains post-lock uncommitted evidence files and was correctly NOT used for the build).

Worktree HEAD before dependency install: `82adb7719b833f1198c5a2129ae63bf1f9ca48f7` — **matches exactly**.
Worktree state before install: `git status --short` → clean.
`npm ci` run (installs `node_modules` from the committed lockfile only — no `package.json`/`package-lock.json` write). Worktree state after install: `git status --short` → **still clean** (confirmed — `npm ci` never touched a tracked file).

## CI exact-revision evidence (carried from SOURCE-REVISION-LOCK-001, not re-run here)

Per `.audit/release/SOURCE-REVISION-LOCK-001/04_PR_AND_CI_EVIDENCE.md`: `verify`, `android-build`, `e2e-smoke` all **PASS** on SHA `28b47db` (parent of merge commit `82adb77`); post-merge `main` CI re-confirmed all 3 PASS on `82adb77` itself after one transient, non-reproducible Maestro-CDN flake was re-run clean.

## Firestore Rules E3 evidence (carried, not re-run here — no rules/config change since lock)

Per the same file: real JDK-21 Firestore emulator run against this exact commit's `firestore.rules` reported `Firestore rules: PASS`, exit code 0.

## Fresh verification performed in THIS run (clean worktree, exact SHA)

`npm run typecheck`: **PASS** (0 errors)
`npm test`: **PASS — 422 passed, 0 failed**

Both run directly inside the clean `D:/lingorise-rc1-build` worktree, not the original repository directory.
