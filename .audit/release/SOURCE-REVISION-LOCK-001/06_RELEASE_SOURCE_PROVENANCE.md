# Release Source Provenance

## Chain of custody

1. Base: `main` @ `16b9aab1f776503ec52067d4f543af8ab6f2e9aa` (= `origin/main`, unchanged since before Sprint 1).
2. Branch created: `release/lingorise-rc1`, from the working tree containing Sprint 1 + Sprint 2 + Sprint 3's accumulated, previously-uncommitted changes.
3. Exactly the `01_INCLUSION_MANIFEST.md`-classified INCLUDE set staged; everything else (unrelated Consumer-audit files, unreferenced assets, local Firebase CLI cache) left untracked.
4. One commit: `28b47dbe3c2714a2f82253092ca5e8d159a3db18` ("release: prepare LingoRise RC1 candidate").
5. Pushed to `origin/release/lingorise-rc1` — local/remote SHA independently confirmed identical (`02_REVISION_IDENTITY.md`).
6. PR #2 opened, `release/lingorise-rc1` → `main`.
7. CI ran against SHA `28b47db` directly (not a synthetic merge-preview commit — confirmed via the run's own `headSha` field) — all 3 required checks + 2 non-required CodeQL checks passed (`04_PR_AND_CI_EVIDENCE.md`).
8. Merged via `gh pr merge 2 --merge` — a real two-parent merge commit, **not** squash or rebase, so the merge commit's tree is byte-identical to what CI tested (verified: `28b47db` is a direct parent of the merge commit).
9. Merge commit: `82adb7719b833f1198c5a2129ae63bf1f9ca48f7`, parents `[16b9aab1f776503ec52067d4f543af8ab6f2e9aa, 28b47dbe3c2714a2f82253092ca5e8d159a3db18]`.
10. `origin/main` re-fetched and confirmed at `82adb77...` — matches the merge commit exactly. Local `main` fast-forwarded to the same SHA.

## Why this provenance is exact, not approximate

- The tested SHA (`28b47db`) and the SHA actually merged into `main` (as a parent of `82adb77`) are the identical commit object — no rebase, no squash, no re-authoring occurred between CI running and the merge landing. This is the strongest provenance guarantee a standard (non-squash) merge strategy can offer: the exact bytes CI executed against are the exact bytes now on `main`.
- No force-push occurred anywhere in this sequence (confirmed: `git push -u origin release/lingorise-rc1` was a plain new-branch push; the merge was a standard PR merge, not a manual force-push to `main`).
- Branch protection was never bypassed: `mergeStateStatus` was `CLEAN` (not `BLOCKED`/`UNSTABLE`) at merge time, meaning GitHub itself confirmed the required checks were satisfied before allowing the merge — no admin override was invoked.

## Exact Release Source SHA

**`82adb7719b833f1198c5a2129ae63bf1f9ca48f7`** (main / origin/main, post-merge)

This is the SHA a future `eas build` should reference for RC-001, and the SHA any future `RELEASE-002` reaudit should treat as its subject revision.
