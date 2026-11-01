# Release Sanity

Exact SHA: **PASS** (`D:/lingorise-rc1-build` HEAD = `82adb7719b833f1198c5a2129ae63bf1f9ca48f7`, confirmed both before and after `npm ci`)
Clean worktree: **PASS** (`git status --short` empty at both checkpoints)
Typecheck: **PASS** (0 errors, run fresh in the clean worktree)
Primary tests: **PASS**
Test count: **422 passed, 0 failed**
Privacy URL: **PASS** (fresh `curl` this run → HTTP 200, `https://lingorise-65cb1.web.app/privacy-policy/`)
Account deletion URL: **PASS** (fresh `curl` this run → HTTP 200, `https://lingorise-65cb1.web.app/account-deletion/`)
Firestore Rules exact revision: **PASS** (carried from SOURCE-REVISION-LOCK-001's own fresh CI evidence at this exact SHA — no rules file has changed since, so this is not stale by drift, only by not being re-executed in this run)
Production Firebase: **NOT VERIFIED** (blocked — no EAS project linked)
Production signing: **NOT VERIFIED** (blocked — same reason)
Production AAB: **NOT GENERATED** (blocked — same reason)
