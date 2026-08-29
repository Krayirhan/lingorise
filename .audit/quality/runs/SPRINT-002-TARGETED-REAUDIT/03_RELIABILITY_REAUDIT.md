# Reliability Targeted Reaudit

## GLOBAL-QA-020 / REL-QA-002 — ErrorBoundary restart

Independently read `src/components/ErrorBoundary.tsx` in full:

1. **Restart actually triggers remount:** `render()` wraps `children` in `<React.Fragment key={this.state.restartKey}>`. `handleRestart` increments `restartKey` via `setState((prev) => ({hasError:false, error:null, restartKey: prev.restartKey+1}))`. A changed `key` on the returned element forces React to unmount the old `Fragment`'s subtree and mount a fresh one — this is standard, correct React behavior, not a workaround.
2. **State is not left in the same failed instance:** the crashed subtree is discarded (unmounted) and a new one is mounted; any corrupted local component state inside `children` cannot survive this transition, unlike the prior implementation which only cleared `hasError` and re-rendered the same (already-corrupted) tree.
3. **No recovery loop:** `getDerivedStateFromError` deliberately omits `restartKey` from its returned `Partial<State>`, so a fresh crash right after a restart does not reset the counter — each restart gets a monotonically new key, so two consecutive crash/restart cycles cannot collide on the same key. No loop condition exists (restart is a manual, user-initiated action, not auto-retried).
4. **UI promise matches behavior:** the button labeled "Uygulamayı Yeniden Başlat" ("Restart the app") now performs a genuine subtree remount, closing the gap between label and effect.
5. **Proportionate:** the fix is a ~6-line, well-scoped change (state field, type change, key on Fragment) — no unrelated refactor.

Evidence level: **E2 (static source verification) + E2-level React-semantics reasoning**, independently reconfirmed by two reviewer passes across Sprint 2 itself and now a third (this reaudit). **No E3/E4** — no React renderer is available in this repo's test environment (a pre-existing, documented limitation, not newly introduced), so `tests/testSuite.ts` §59b's 3 assertions are structural (confirms `restartKey` exists, is used as `key`, and increments) rather than an actual triggered-crash simulation. This is honestly disclosed in `10_RESIDUAL_RISK.md`, not overclaimed as PASS.

**Verdict: GLOBAL-QA-020 CLOSED**, with the same on-device-confirmation caveat Sprint 2 itself already disclosed — not silently upgraded to E4 evidence here.

## Other Reliability findings — current status

| ID | Status | Evidence |
|---|---|---|
| REL-QA-001 (GLOBAL-QA-032) | **OPEN**, P4 unchanged | Not in Sprint 2 diff; correctly still listed OPEN in `10_RESIDUAL_RISK.md`/`09_FINDING_CLOSURE_MATRIX.md`; Master's own "fix if cheap" guidance, bounded per-level blast radius — proportionate to defer |
| REL-QA-002 (GLOBAL-QA-020) | **CLOSED** | See above |
| REL-QA-003 | **CLOSED** (Sprint 1, not re-touched) | `DataManagementCard.tsx`'s `executeReset()` distinguishes `clearAllLocalData()`'s `{success}` result and shows a distinct `resetErrorVisible` `AppDialog` on failure — confirmed present, unchanged by Sprint 2's diff (not modified this sprint, consistent with the claim) |
| REL-QA-004 | **CLOSED** (Sprint 1, not re-touched) | `cloudSyncFailureNotice`/`reportCloudSyncFailure` confirmed present in `useUserProgress.ts`, `AppBootstrap.tsx`, `AppNavigator.tsx` — unchanged by Sprint 2 |

No Data-layer defect (e.g., DATA-QA-005/006) is being double-counted here as a Reliability finding — this reaudit scored only the four Reliability-specific findings above; the Data-domain merge-correctness defects are scored exclusively in the Data domain (DATA-002-REAUDIT, unchanged: 86/100).

## Reliability score

Baseline 88/100 was held down primarily by REL-QA-002 (P3) at the time of CORE-001-BASELINE/REL-001-BASELINE; REL-QA-003/004 were already closed by Sprint 1 (not part of this sprint's recovery). REL-QA-001 (P4) remains open, unrecovered.

**Current score: 91/100** (+3)
**Confidence: MEDIUM** — the fix is correct by React semantics and was independently re-traced, but genuine confidence in "the crash-and-restart flow works for a real user" requires an actual on-device trigger, which has not been performed in any of the three review passes to date (Sprint 2's own two reviewers, and this reaudit). This is a disclosed evidence gap, not a defect.
