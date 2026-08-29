# SPRINT-002 — Residual Risk

## Deferred Master Sprint 2 findings

| Finding | Severity | Reason unresolved | User impact | Release impact | Owner |
|---|---|---|---|---|---|
| GLOBAL-QA-018 / CORE-QA-002 | P3 | Narrow, low-frequency edge case (precise app-kill timing); lower leverage than items actually fixed | Bounded, rare | None | Sprint 3 or post-release debt |
| GLOBAL-QA-032 / REL-QA-001 | P4 | Bounded per-level blast radius; Master's own "only if cheap" guidance | Minimal | None | Post-release debt |
| GLOBAL-QA-021 / MAINT-QA-002 | P3 | No user-facing symptom | None currently | None | Sprint 3 or post-release debt |
| GLOBAL-QA-022 / MAINT-QA-004 | P3 | No user-facing symptom (options are currently hardcoded to the valid set) | None currently | None | Sprint 3 or post-release debt |
| GLOBAL-QA-033 / MAINT-QA-003 | P4 | Dead code, no behavioral effect | None | None | Post-release debt |
| GLOBAL-QA-023 / PERF-QA-002 | P3 | Requires careful re-trace against Sprint 1's data-safety architecture; deferred for regression-safety | Startup delay on happy path, unchanged from baseline | None | Sprint 3 or targeted follow-up |
| GLOBAL-QA-024 / PERF-QA-003 | P3 | Explicit Master caution against compromising durability while reducing writes; needs dedicated trace | Unmeasured resource cost, unchanged from baseline | None | Sprint 3 or targeted follow-up |
| GLOBAL-QA-034 / PERF-QA-001 | P4 | Touches the exact cold-start path Phase A just fixed — deferred to avoid regression risk to DATA-QA-006's fix, not effort alone | Minimal | None | Post-release debt, revisit only with its own dedicated trace |
| GLOBAL-QA-035 / PERF-QA-004 | P4 | Master's own guidance: not worth Sprint time | Minimal | None | ACCEPT/DEFER |
| GLOBAL-CD-001 / CD-005 | Consumer LOW | Cosmetic | Minor | None | Post-release debt |
| GLOBAL-CD-002 / CD-006 | Consumer LOW | Cosmetic | Minor | None | Post-release debt |
| GLOBAL-QA-012 remainder | P2 (partial) | Avatar picker, word-detail modal, word-notebook hardcoded strings not addressed — only the Privacy Policy content (Master's own most-cited example) was in scope for the available budget | English-locale users still see some Turkish text outside the Privacy Policy | Does not block Sprint 3's RELEASE-QA-003 closure (that concerns public hosting, not remaining in-app strings) | Sprint 3 or a dedicated follow-up localization pass |

## Verification-evidence gaps (not code defects — disclosed, not silently upgraded to PASS)

| Item | Gap | Why acceptable to defer |
|---|---|---|
| Font-scale fix (GLOBAL-QA-015) | No on-device confirmation at an actual large system font-scale setting | Structural fix is standard RN behavior (`allowFontScaling` defaults true when not overridden, confirmed absent); code-reviewer independently checked the surrounding row layout for breakage and found none |
| Touch-target fix (GLOBAL-QA-025) | No on-device tap-precision test | `hitSlop` is a standard, well-understood RN API; no custom touch handling exists in either component that could interfere |
| ErrorBoundary restart (GLOBAL-QA-020) | No on-device test of an actual triggered crash + restart tap | The remount mechanism (`key`-based `Fragment`) is a standard, well-documented React idiom; two independent reviewer passes traced the exact code path and confirmed correctness |
| Firestore rules emulator | NOT VERIFIED LOCALLY — pre-existing JDK 17 vs. required 21+ gap, unchanged by Sprint 2 (rules file itself untouched this sprint) | Same disclosed gap as Sprint 1 and both post-Sprint-1 reaudits; not attempted to be worked around |
| Build sanity | NOT RUN | No native/manifest/dependency change this sprint |

## Reviewer-identified LOW items not actioned (explicitly, by the reviewers' own conclusion — not silently dropped)

- `pickLevelByRecency`'s `>=` tie-break favors local on an exact `levelSetAt` timestamp collision — reviewer characterized this as a near-impossible edge case, not a real risk.
- One of the two DATA-QA-006 sub-tests ("both layers together") is redundant with two sibling assertions in the same block — confirmed not a coverage gap at the suite level (the reversion it would demonstrate is independently caught elsewhere).
- One pre-existing, unrelated test elsewhere in `testSuite.ts` (the DATA-QA-002 regression test) still uses a hardcoded literal date rather than a dynamically-computed one — stylistic inconsistency only; reviewer confirmed no current assertion there depends on streak/date-gap behavior, so there is no practical breakage. Left as-is to avoid unrelated scope expansion into a test block Sprint 2 did not otherwise need to touch.

## Meta-process observation (not a code defect)

The Sprint 2 code reviewer noted that Sprint 1's and Sprint 2's changes cannot be distinguished from `git log` alone, since neither has been committed (both sprints' own instructions explicitly forbid committing). This is an acknowledged structural property of running sequential uncommitted sprints on one working tree, not a defect this sprint could resolve within its own constraints. Each sprint's own `FINAL_RESULT.md`/`04_IMPLEMENTATION_SUMMARY.md` provides the intended traceability independent of git history.

## Not downgraded

No severity was changed for any deferred finding by this sprint. Formal rescoring belongs to the targeted reaudits recommended in `FINAL_RESULT.md`.
