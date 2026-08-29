# SPRINT-002 — Master Scope Map

## Post-Sprint-1 carry-over (mandatory Phase A — from DATA-002-REAUDIT / VERIFICATION-ASSURANCE-002-REAUDIT)

| ID | Title | Severity | Root cause | Required remediation |
|---|---|---|---|---|
| DATA-QA-005 | `level`'s HIGHER_LEVEL merge overrides an intentional manual downgrade | P2 | `level` classified as a monotonic achievement when it is actually a free, reversible content-selection preference | Recency-based merge keyed by a new `levelSetAt` timestamp |
| DATA-QA-006 | Stale local streak resurrected via `AppBootstrap` merging raw local state | P2 | `AppBootstrap` merges `loadUserData()`'s output before any rollover normalization; `Math.max` alone can't detect either side's own staleness | Normalize each side's streak against the real clock inside the merge itself, plus roll over local state before merging (for daily-scoped fields) |
| VERIFY-QA-003 | Merge test matrix's fixture fidelity/scenario breadth incomplete | P2 | Test pre-applied rollover to local state (unlike production); no scenario modeled a reversible-preference field | Rewrite the two-device test to match production's real sequence; add DATA-QA-005/006 regression scenarios |

## Original Sprint 2 Master scope (from `MASTER-001-CONSOLIDATION/04_GLOBAL_FINDINGS.md` / `07_THREE_SPRINT_PLAN.md`) — addressed this sprint

| Global ID | Title | Severity | Priority | Source findings | Affected domain | Release relevance |
|---|---|---|---|---|---|---|
| GLOBAL-QA-008 | Exam answers not distinguished from practice in reward/quest accounting | P2 | MEDIUM | CORE-QA-001, CODE-QA-004, MAINT-QA-005 | Core Correctness | No |
| GLOBAL-QA-015 | Core practice/exam text resists system font-scale | P2 | MEDIUM | A11Y-QA-001 | Accessibility | No |
| GLOBAL-QA-012 | Hardcoded Turkish text bypasses locale system (Privacy Policy content addressed; other locations deferred) | P2 | HIGH (feeds Sprint 3) | COMPAT-QA-001 | Compatibility/Localization | Feeds Sprint 3's RELEASE-QA-003 closure |
| GLOBAL-QA-020 | `ErrorBoundary` restart doesn't actually reload/remount | P3 | MEDIUM | REL-QA-002 | Reliability | No |
| GLOBAL-QA-025 | Two touch targets below platform guidance | P3 | LOW | A11Y-QA-002 | Accessibility | No |
| GLOBAL-QA-026 | Muted text below WCAG AA contrast | P3 | LOW | A11Y-QA-003 | Accessibility | No |

## Original Sprint 2 Master scope — explicitly deferred this sprint (documented, not silently dropped)

| Global ID | Title | Severity | Priority | Reason deferred |
|---|---|---|---|---|
| GLOBAL-QA-018 | Session-restore duplicate-answerable state (CORE-QA-002) | P3 | LOW | Narrow, low-frequency edge case (requires precise app-kill timing); lower leverage than the items actually fixed this sprint given the effort budget |
| GLOBAL-QA-032 | Catalogue-loading race on rapid level-switch (REL-QA-001) | P4 | LOW | Low severity, bounded per-level blast radius; explicitly listed as "only if cheap" in Master's own Sprint 2 guidance |
| GLOBAL-QA-021 | Auth service-layer boundary bypass (MAINT-QA-002) | P3 | LOW | Maintainability cleanup, no user-facing symptom; lower leverage than user-facing fixes |
| GLOBAL-QA-022 | `as any` cast on onboarding goal (MAINT-QA-004) | P3 | LOW | Same reasoning |
| GLOBAL-QA-033 | Dead barrel files/exports (MAINT-QA-003) | P4 | LOW | Master's own guidance: "no unrelated formatting refactor... use static search only if confirmed unused" — deferred for effort-budget reasons, not risk |
| GLOBAL-QA-023 | Startup catalogue gating (PERF-QA-002) | P3 | MEDIUM | Deferred — see residual risk; requires care not to regress Sprint 1's data-safety guarantees around catalogue loading |
| GLOBAL-QA-024 | Answer write amplification (PERF-QA-003) | P3 | MEDIUM | Deferred — explicit Master instruction not to compromise Sprint 1 durability; needs its own dedicated trace, out of this sprint's remaining budget |
| GLOBAL-QA-034 | Redundant `loadUserData()` calls (PERF-QA-001) | P4 | LOW | Low value; risk of interacting with the DATA-QA-006 fix's bootstrap ordering if touched carelessly |
| GLOBAL-QA-035 | Mascot asset size (PERF-QA-004) | P4 | LOW (ACCEPT/DEFER) | Master's own guidance: do not spend Sprint time on low-value asset micro-optimization |
| GLOBAL-CD-001 | XP invisible on Practice Hub (CD-005) | Consumer, LOW | LOW | Cosmetic, low-value positioning debt per Master's own characterization |
| GLOBAL-CD-002 | Profile group-label tone (CD-006) | Consumer, LOW | LOW | Same reasoning |
| GLOBAL-QA-012 (remainder) | Avatar picker, word-detail modal, word-notebook hardcoded strings | P2 (partial) | MEDIUM | Master's single most-cited example (Privacy Policy) was addressed; remaining locations deferred for effort-budget reasons — documented as residual, not closed |

All deferred items are recorded in `10_RESIDUAL_RISK.md` with severity, impact, and owner — none were downgraded in severity by this sprint.
