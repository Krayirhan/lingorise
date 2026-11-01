# Production Automation Architecture

## Pipeline, as it exists right now (each stage proven working this program)

1. **Release trigger** — merge to `main` via protected-branch PR + required CI (proven: PR #14, #15).
2. **Source lock** — resolve exact `origin/main` SHA, confirm clean tree (proven: `01_BASELINE.md`).
3. **CI** — `verify`, `android-build`, `e2e-smoke`, CodeQL, all required checks (proven: PR #15's rollup).
4. **EAS production build** — `eas build --profile production` with `autoIncrement: true` (proven: builds `9a86a2a9`, `a22b0c74`).
5. **Artifact verification** — `bundletool dump manifest` against the real `.aab`: package, versionCode, targetSdk, permission absence, SHA-256 (proven this run: `01_BASELINE.md`, `15_SYSTEM_ALERT_WINDOW.md`).
6. **Internal Testing submission** — `eas submit --track internal`, independently re-verified via `submit:list` / Android Publisher API (proven: submission `035fd373`).
7. **Play verification** — direct Android Publisher API read of the internal track's release (proven, this run and prior).
8. **Store freshness/diff** — `edits.listings`/`edits.images` read-before-write, hash-based manifest (`.store/manifests/store-manifest.json`, this run), validate-before-commit discipline (proven this run: 8-locale listing push, 5-image upload).
9. **Declarations gate** — Data Safety / Content Rating / Ads / Target Audience / Families / Account Deletion evidence, all Console-UI-only for writes (no change; `PLAY-001-DECLARATIONS/`).
10. **Closed Testing gate** — **NOT YET VERIFIED whether it applies** (`28_CLOSED_TEST.md`) — the one real unknown in this chain.
11. **Production hard gates** — never auto-passed; requires: CI green, artifact permission/targetSdk checks green, Closed Testing resolved (applies-and-satisfied, or confirmed doesn't apply), Privacy Policy field owner-confirmed, store listing complete in Console (category/tags), tester group attached.
12. **Automatic Production rollout** — intentionally **not implemented and not run** this program; every prior and current run has stopped at Internal Testing by design.
13. **Post-release verification** — same Android Publisher API read pattern used for internal, would apply equally to production once reached.

## What's genuinely missing before this could run unattended end-to-end

- A CI-attached Android emulator (or a cloud device farm step) so screenshot capture isn't a manual gap.
- Resolution of the Closed Testing unknown (owner-only, `28_CLOSED_TEST.md`).
- A scripted "production hard gate" checker that reads all of the above and refuses to call `eas submit --track production` unless every gate is green — not yet written, since Production submission itself is out of scope for this program.

## Status

Architecture is real and incrementally proven at every stage through Internal Testing. Production remains a deliberate, unautomated stop — no code exists that could accidentally roll out to Production.
