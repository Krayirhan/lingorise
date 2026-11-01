# RC-001 — EAS PRODUCTION AAB

## Status

**BLOCKED**

## Exact Source

SHA: `82adb7719b833f1198c5a2129ae63bf1f9ca48f7`
Clean worktree: `D:/lingorise-rc1-build`, HEAD confirmed matching, `git status --short` clean before and after `npm ci`.

## EAS Identity

Authenticated: **YES** (via official interactive browser login, no credential handled in chat).
Account: `mfurkant` (`fusturan@gmail.com`).
EAS CLI: `eas-cli/23.0.0`.
**EAS project: NOT LINKED** — no `expo.extra.eas.projectId` in `app.json` at this exact source revision, and `eas init` (the only way to establish this) requires writing to that locked file. This is the sole blocking condition.

## Production Firebase Environment

**NOT VERIFIED** — cannot query `eas env:list` without a linked project. All 6 required `EXPO_PUBLIC_FIREBASE_*` variables identified from source (exhaustive); presence unverifiable.

## Production Signing

**NOT VERIFIED** — cannot query `eas credentials` without a linked project. Play App Signing: **NOT VERIFIED** (expected/non-blocking per Section 16, but moot here since AAB generation itself is blocked).

## Build

**NOT ATTEMPTED.** Classification: **SOURCE CONFIGURATION** (missing EAS project linkage — the only fix is a source-config write, which this locked, build-only run must not perform).

## AAB Identity

N/A — no artifact generated.

## Artifact Provenance

**FAILED** at the "EAS PROJECT" link in the provenance chain. Every upstream link (source SHA, clean worktree, fresh tests) independently VERIFIED.

## Verification

Typecheck: PASS (0 errors)
Primary suite: PASS — 422/422
Both run fresh, inside the clean exact-SHA worktree.

## Privacy / Account Deletion

Privacy Policy: PASS (HTTP 200, fresh anonymous check)
Account deletion: PASS (HTTP 200, fresh anonymous check)

## Remaining Play Conditions

See `08_REMAINING_PLAY_CONDITIONS.md`. Blocking items precede Play Console entirely: EAS project linkage (requires a human decision on the owning account) → production env re-verification → production signing verification → AAB generation. Only after those does the previously-identified Play-Console-only remainder (Play App Signing, Data Safety, account-deletion declaration, listing) become relevant.

## Source Integrity

Source changes: **NONE** (confirmed via `git status --short` on the clean worktree, before and after all commands run)

Commit: **NONE**
Push: **NONE**
PR: **NONE**
Merge: **NONE**
