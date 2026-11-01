# PR and CI Evidence

## Pull Request

`release/lingorise-rc1-eas-link` → `main`, **PR #12**: https://github.com/Krayirhan/lingorise/pull/12
Head SHA: `358c438a6b179f429a972b933ee00696f1a94ff4`

(Note: PR number jumped from #2 to #12 because Dependabot — enabled in Sprint 3 — opened several dependency-update PRs in between; unrelated to this task.)

## CI on the exact PR SHA

Run `33268968454`, head SHA `358c438a6b179f429a972b933ee00696f1a94ff4` (the exact commit, not a synthetic merge preview):

| Check | Result |
|---|---|
| `verify` (required) | **PASS** |
| `android-build` (required) | **PASS** |
| `e2e-smoke` (required) | **PASS** |

A separate `Copilot` workflow run also triggered on this push — pre-existing repository automation unrelated to this task, not a required check, not inspected further.

## Firestore Rules E3 on exact SHA

`verify` job log: `Firestore rules: PASS`, `✔ Script exited successfully (code 0)` — genuine JDK-21 emulator run against this exact commit.

## Merge

`gh pr view 12` → `{"mergeable":"MERGEABLE","mergeStateStatus":"CLEAN"}` before merge — no bypass needed.
Merged via `gh pr merge 12 --merge` (standard 2-parent merge, not squash/rebase).

Merge commit: `b8d0687d7217f46ce28bf269b6fc6a2eb9815ae4`
Parents: `[82adb7719b833f1198c5a2129ae63bf1f9ca48f7, 358c438a6b179f429a972b933ee00696f1a94ff4]` — confirms the exact tested commit is a direct parent, no re-authoring between CI and merge.

`origin/main` re-fetched and confirmed at `b8d0687...`. Local `main` fast-forwarded to match.

**Diff from prior main (`82adb77` → `b8d0687`): `app.json` only, +7/-1 lines** — confirmed no unrelated drift entered via the merge.
