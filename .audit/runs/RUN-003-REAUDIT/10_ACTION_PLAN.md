# 10 — Action Plan (REAUDIT)

All P1/P2/P4 actions from `RUN-001-BASELINE`/`RUN-002-REAUDIT` remain closed or accepted-risk, unchanged by this cycle. Two items remain genuinely open (carried forward, untouched by this delta); two new low-severity actions are added from this reaudit's own findings.

## Remaining open work (carried forward, unchanged)

### ACT-DATA-001-VERIFY (continuation of ACT-DATA-001)
- Priority: P1 · Source finding: DATA-001 · Status: unchanged, still open
- Goal: perform the real two-device signed-in verification. Still not performed — no second authenticated device/session available in this environment. Unchanged from `RUN-002-REAUDIT`.

### ACT-ACC-001-CONTINUE (continuation of ACT-ACC-001)
- Priority: P3 · Source finding: ACC-001 · Status: unchanged, still open
- Goal: close remaining accessibility DoD scope (onboarding, Level Promotion modal, Accessibility Scanner, `reduceMotion` audit). Unchanged from `RUN-002-REAUDIT` — note that item 9.5's "CI accessibility check is N/A since CI was removed" caveat from `RUN-002-REAUDIT` is now **stale**: CI exists again, so re-adding an accessibility check to CI is a live option again if desired.

## New actions this reaudit

### ACT-DEPLOY-002 (new, from finding DEPLOY-002)
- Priority: P4 · Effort: XS
- Goal: add a branch-protection rule on `main` requiring the `verify` status check, if/when the project moves toward a PR-based or multi-contributor workflow. Not urgent under the current direct-push, single-developer pattern.

### ACT-SEC-003 (new, from finding SEC-003)
- Priority: P4 · Effort: XS
- Goal: enable GitHub secret scanning + push protection in repo settings (free for public repos, one-click).

## Accepted risks (no action planned; re-review triggers only, unchanged)

### DEP-001 — 17 moderate npm audit findings (build-time tooling only)
- Unchanged. Re-review trigger: a `firebase-tools`/`expo`/`@expo/config-plugins` major-version upgrade.

## Reversed since RUN-002-REAUDIT

### DEPLOY-001 accepted-risk status — REVERSED (no longer an open risk)
`RUN-002-REAUDIT` recorded "no CI" as an accepted risk requiring a specific re-review trigger ("the repository is made public"). That trigger has now occurred, and CI is restored and confirmed green — this line item is closed, not merely re-reviewed.
