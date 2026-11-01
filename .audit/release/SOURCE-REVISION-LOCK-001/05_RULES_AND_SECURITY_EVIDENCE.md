# Firestore Rules and Security Check Evidence

## Firestore Rules E3 — on the exact release candidate SHA

**VERIFIED ON EXACT REVISION.**

The `verify` job's `Run npm run test:rules` step (run `33263889909`, job `99130373789`, head SHA `28b47dbe3c2714a2f82253092ca5e8d159a3db18`) shows:

```
env: JAVA_HOME: /opt/hostedtoolcache/Java_Temurin-Hotspot_jdk/21.0.12-1/x64
...
i  emulators: Starting emulators: firestore
✔  firestore: Firestore Emulator was started in standard edition.
i  Running script: ts-node -O "{\"module\":\"commonjs\"}" tests/firestoreRules.test.ts
... (multiple expected PERMISSION_DENIED assertions for denied write attempts — the test's own negative-case coverage)
Firestore rules: PASS
✔  Script exited successfully (code 0)
i  emulators: Shutting down emulators.
```

This is genuine E3 evidence: a real Firestore emulator (JDK 21, matching `firebase-tools`' requirement — the exact gap that blocked local verification throughout Sprints 1–3) executed the actual `firestore.rules` file from this exact commit against `tests/firestoreRules.test.ts`, and the script reported `Firestore rules: PASS` with exit code 0. This is not inferred from the historical `16b9aab` CI history — it is a fresh execution against the release candidate's own `firestore.rules` content (which includes Sprint 1's `isValidUserDoc()` validation, previously never run through any JDK-21 CI path because it was uncommitted).

**This closes the long-standing "NOT VERIFIED LOCALLY" gap for this exact revision.** The local JDK-17 limitation remains true for developer machines, but is no longer a gap for the actual release-candidate revision's own CI-verified state.

## CodeQL / security checks — enabled vs. completed distinction

Sprint 3 **enabled** CodeQL default setup and GitHub secret scanning/push protection/Dependabot as live repository settings. This run independently confirms they **executed and completed successfully** on this exact PR/SHA, not merely that they are turned on:

- `Analyze (javascript-typescript)` — **pass**, run `33263888975`, executed against the PR's code.
- `CodeQL` status check — **pass**.

No CodeQL alert blocked or was found on this revision (a passing conclusion with 0 flagged severities that would gate a check). Secret scanning and push protection are repository-level, always-on controls (not a per-PR check that appears in `gh pr checks`) — their live-enabled state was independently re-verified in Sprint 3 (`08_REPOSITORY_HARDENING.md`) and no secret was flagged on this push (push protection would have rejected the push outright had one been detected — the push succeeded, which is itself evidence no push-protection-covered secret pattern was present).

## Secret scan of the actual committed content (repeat, post-commit)

Re-scanned the merged commit's full diff (`git show 28b47db` equivalent content, now on `main`) for the same secret-shaped patterns as `03_LOCAL_VERIFICATION.md`'s pre-commit scan: **no matches**. Consistent with the pre-commit scan; nothing changed between staging and commit.

**Secrets detected: NO.**
