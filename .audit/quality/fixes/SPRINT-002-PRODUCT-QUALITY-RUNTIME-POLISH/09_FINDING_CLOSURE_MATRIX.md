# SPRINT-002 — Finding Closure Matrix

## Phase A carry-over (mandatory)

| ID | Original severity | Root cause | Fix | Executable evidence | Manual/static evidence | Reviewer result | Recommended status |
|---|---|---|---|---|---|---|---|
| DATA-QA-005 | P2 | `level` merged as monotonic-max when it's actually a free, reversible content-selection preference | `levelSetAt` timestamp + recency-based merge (`pickLevelByRecency`) | 3 dedicated regression tests, all PASS | `LevelSwitcherModal.tsx`'s own doc comment confirms the product contract | Code reviewer: AGREE (no dispute); one LOW tie-break edge case noted, not actioned per reviewer's own assessment | **CLOSED** |
| DATA-QA-006 | P2 | `AppBootstrap` merges raw, non-rolled-over local state; `Math.max` alone can't detect either side's staleness | Two-layer fix: merge-internal `normalizedStreak` (both sides) + `AppBootstrap`-level `rolloverToToday` (local, for daily-scoped fields) | 4 dedicated regression tests, all PASS, including a tightened `===1` both-stale assertion | Code reviewer independently confirmed both layers necessary, non-redundant | Code reviewer: AGREE (confirmed two-layer design correct and not over-engineered) | **CLOSED** |
| VERIFY-QA-003 | P2 | Test fixture pre-normalized local state (unlike production); no reversible-preference scenario existed | Rewrote fixture to match production's real sequence; added DATA-QA-005/006 regression scenarios | New tests call real `mergeUserData`/`rolloverToToday`/`decideMergeAction` directly | — | Test reviewer: ADJUST → RESOLVED (2 labeling/precision corrections applied and independently reconfirmed) | **CLOSED** |

## Master Sprint 2 Global findings — addressed

| Global ID | Original severity/impact | Root cause | Fix | Executable evidence | Reviewer result | Recommended status |
|---|---|---|---|---|---|---|
| GLOBAL-QA-008 | P2 | `_sessionMode` accepted but never read | Skip quest progression for EXAM; XP/rewarded/solved/mastery unchanged | §59, 8 assertions, PASS | Code reviewer: AGREE, no XP duplication/regression found | **CLOSED** |
| GLOBAL-QA-015 | P2 | `numberOfLines={1}` + `adjustsFontSizeToFit` resists font-scale | Wrap to 2 lines instead of shrinking | Structural (E2) only — no renderer available | Code reviewer: AGREE, confirmed no layout break in surrounding row | **CLOSED** (manual on-device confirmation not performed — see residual risk) |
| GLOBAL-QA-025 | P3 | Two controls below touch-target guidance | `hitSlop` on both, no visual change | Structural (E2) only | Code reviewer: AGREE | **CLOSED** (manual on-device confirmation not performed — see residual risk) |
| GLOBAL-QA-026 | P3 | `muted` token 4.10:1, below WCAG AA | Darkened to `#6B6763` | §60, 2 assertions, PASS, computed ratio in message | Both reviewers: AGREE, before/after distinction independently recomputed and confirmed | **CLOSED** |
| GLOBAL-QA-012 (partial) | P2 | Privacy Policy modal hardcoded Turkish | Routed through i18n with real English translations | §33 addendum, 9 assertions, PASS | Code reviewer: AGREE, fallback pattern confirmed safe | **PARTIALLY CLOSED** — Privacy Policy content (Master's own most-cited example) closed; avatar picker, word-detail modal, word-notebook locations explicitly NOT addressed (see residual risk) |
| GLOBAL-QA-020 | P3 | Restart didn't remount | `restartKey`-keyed `Fragment` forces real remount | §59b, 3 assertions, PASS (static); reviewer-fix applied to `getDerivedStateFromError` | Code reviewer: AGREE → one LOW fix applied and independently reconfirmed RESOLVED | **CLOSED** (on-device crash-trigger confirmation not performed — see residual risk) |

## Master Sprint 2 Global findings — explicitly deferred (not closed, not falsely claimed)

| Global ID | Status | Reason |
|---|---|---|
| GLOBAL-QA-018 (CORE-QA-002) | OPEN | Deferred — narrow edge case, lower leverage within available budget |
| GLOBAL-QA-032 (REL-QA-001) | OPEN | Deferred — P4, Master's own "only if cheap" guidance |
| GLOBAL-QA-021 (MAINT-QA-002) | OPEN | Deferred — no user-facing symptom, lower leverage |
| GLOBAL-QA-022 (MAINT-QA-004) | OPEN | Deferred — same reasoning |
| GLOBAL-QA-033 (MAINT-QA-003) | OPEN | Deferred — Master's own "no unrelated refactor" caution |
| GLOBAL-QA-023 (PERF-QA-002) | OPEN | Deferred — requires careful re-trace against Sprint 1's data-safety architecture, out of remaining budget |
| GLOBAL-QA-024 (PERF-QA-003) | OPEN | Deferred — same reasoning, explicit Master caution against compromising durability |
| GLOBAL-QA-034 (PERF-QA-001) | OPEN | Deferred — touches the exact cold-start path Phase A just fixed; deferred for regression-safety, not effort alone |
| GLOBAL-QA-035 (PERF-QA-004) | OPEN (ACCEPT/DEFER) | Master's own guidance: not worth Sprint time |
| GLOBAL-CD-001 (CD-005) | OPEN | Deferred — cosmetic, low value |
| GLOBAL-CD-002 (CD-006) | OPEN | Deferred — cosmetic, low value |
| GLOBAL-QA-012 (remainder) | PARTIAL (see above) | Avatar picker / word-detail modal / word-notebook hardcoded strings not addressed |

No deferred item's severity was changed by this sprint. All remain at their Master-assigned severity, recorded in `10_RESIDUAL_RISK.md`.
