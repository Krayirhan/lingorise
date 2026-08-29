# Test / Build Evidence

## Before-change baseline (start of this sprint, matches SPRINT-002-TARGETED-REAUDIT's own fresh run)

`npm run typecheck`: PASS (0 errors)
`npm test`: PASS — 422/422

## After-change (fresh, post-implementation, this sprint)

`npm run typecheck`: **PASS** (0 errors) — re-run after the `DataManagementCard.tsx` privacy-URL edit.
`npm test`: **PASS — 422 passed, 0 failed** — identical count, confirming no regression from the URL-constant change (the only application-source edit this sprint) or from the non-application file changes (`firebase.json`, `.github/*`, `public/*`, which do not affect the JS test runner at all).

**Total tests: 422** (unchanged from Sprint 2 / SPRINT-002-TARGETED-REAUDIT).

## Regression classes reconfirmed intact (spot-checked in the fresh run's console output)

- Sprint 1 invariants (multi-device merge, DATA-QA-001/002/RELEASE-QA-001 regression, reset semantics, account deletion lifecycle) — present, PASS.
- DATA-QA-005 (§56 addendum) — PASS.
- DATA-QA-006 (§56 addendum) — PASS.
- Exam vs. Practice accounting (§59) — PASS.
- Streak rollover (`rolloverToToday`, exercised throughout the merge/rollover test blocks) — PASS.

No Sprint 1 or Sprint 2 regression introduced by this sprint's changes.

## Android sanity

Not run. No native/Gradle/manifest change was made this sprint (the existing `android/app/build.gradle` was read, not edited — its debug-signing fact was only documented, not altered). `android-build`'s and `e2e-smoke`'s own CI jobs remain the relevant sanity check, and per Section 40/41 cannot be re-run against the current exact uncommitted revision without a commit+push (would only re-verify the already-committed `16b9aab` revision, not this sprint's changes).

## Firestore rules E3

**NOT VERIFIED LOCALLY** — unchanged environment gap: local JDK 17.0.20.1, `firebase-tools` requires 21+; no JDK 21+ installation found on this machine (checked: only `jdk-17.0.20.101-hotspot` and a legacy `jre-1.8` are present).

**New finding this sprint:** `.github/workflows/ci.yml`'s `verify` job already provisions its own JDK 21 (`actions/setup-java@v4`, `java-version: "21"`) specifically for the `npm run test:rules` step, separate from `android-build`/`e2e-smoke`'s JDK 17 setup for Gradle — and this exact CI configuration has been running successfully: all 8 of the last 8 CI runs on `main` succeeded, including the `verify` job (confirmed via `gh run list`/`gh run view`). **This means E3 rules evidence for the committed revision (`16b9aab...`) already exists via CI** — the local environment gap is real but does not block CI evidence in general. What remains unresolved is that **this exact working-tree revision** (Sprint 1's `firestore.rules` changes — `isValidUserDoc()` — plus this sprint's non-rules changes) has never itself been run through that CI JDK-21 path, because it has never been committed/pushed. Per Section 39's own instruction, this is honestly retained as **NOT VERIFIED** for the current exact state, not silently treated as PASS by analogy to the committed revision's passing history — but it is a materially better-understood gap than "blocked, no path forward": once a commit is made, this will resolve automatically via existing CI, with no further Sprint work needed.

## Privacy URL check

See `03_PRIVACY_POLICY_EVIDENCE.md` — fresh anonymous HTTP 200 on both pages, this sprint.

## EAS config validation

Static config read and cross-checked against source (`04_EAS_PRODUCTION_CONFIG.md`) — no live EAS validation possible (no session).

## Actual EAS production build

**NO.** See `05_SIGNING_AND_ARTIFACT_PROVENANCE.md`.

## Actual AAB

**NO.**

## Exact source provenance

**PENDING** — requires a source-revision lock (commit) not authorized this sprint.

## Current CI

**PENDING** for the exact current working-tree revision (uncommitted). The last **committed** revision (`16b9aab...`, = current HEAD/origin) has verified CI: PASS (8/8 recent runs, all 3 jobs green) — but this predates every Sprint 1/2/3 change and is not evidence for the current working tree.
