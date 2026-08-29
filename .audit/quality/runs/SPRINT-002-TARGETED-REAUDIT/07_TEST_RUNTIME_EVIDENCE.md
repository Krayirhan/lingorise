# Fresh Executable Verification (this reaudit)

| Command | Result | Notes |
|---|---|---|
| `npm run typecheck` | **PASS** (0 errors) | Fresh run, this reaudit, current working tree |
| `npm test` | **PASS — 422 passed, 0 failed** | Fresh run, this reaudit. Identical count to Sprint 2's own last reported run — confirms no drift/regression introduced between Sprint 2's finalization and this reaudit |
| `npm run test:rules` (Firestore emulator) | **BLOCKED — NOT VERIFIED LOCALLY** | Reconfirmed: JDK 17.0.20.1 installed, `firebase-tools` requires 21+. `firestore.rules` unchanged by Sprint 2 (last touched by Sprint 1). Pre-existing, unresolved-by-design gap, not attempted to be worked around, not treated as FAIL |
| Build sanity | **NOT RUN** | No native/manifest/dependency change in Sprint 2's diff (confirmed via `git diff --stat`: only `.ts`/`.tsx` application/test files and `firestore.rules`, no `android/`, `package.json`, or config files touched) |

## Targeted regression spot-checks (subset of the 422, individually confirmed present and passing in the fresh run's console output)

- Exam vs. Practice Reward/Quest Accounting (§59): 8/8 PASS, including "an EXAM answer does not advance the daily practice quest" and "XP earned ... is identical whether it happened in an EXAM or PRACTICE session"
- ErrorBoundary Restart (§59b): 3/3 PASS
- Muted Text Contrast — WCAG AA (§60): 2/2 PASS, both computed ratios visible in the console output (5.10:1, 5.61:1), matching this reaudit's independently recomputed values exactly
- DATA-QA-005/006 regressions (§56 addendum): both scenario blocks present in output, all PASS
- Localization dictionary parity (§33 addendum, `sameKeySet` helper): PASS

## Independent re-verification of the fingerprint

`git diff --binary` over the exact Sprint-2-touched file set, SHA-256: `dbd124e609d5df92d8d2a7d93edfa52a82922fa10e675875239394ae14ebc35c` (recorded in `01_SCOPE_AND_REVISION.md`). This reaudit's source reads and the fresh test run above were performed against this exact, unchanged working-tree state — no drift between the reads, the executable runs, and this record.
