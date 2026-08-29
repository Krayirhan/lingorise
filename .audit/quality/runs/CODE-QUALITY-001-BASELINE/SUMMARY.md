# CODE-QUALITY-001-BASELINE — DEEP IMPLEMENTATION MAINTAINABILITY AUDIT

Revision: `16b9aab1f776503ec52067d4f543af8ab6f2e9aa` (== origin/main at audit time)

**This is a CODE QUALITY evidence score, not the canonical Maintainability score.** ARCHITECTURE-001-BASELINE was audited separately and independently (not read before this pass, per anti-anchoring). A future `MAINTAINABILITY-001-CONSOLIDATION` will combine both without blind averaging.

## Code Quality Evidence Score: 89/100

Confidence: HIGH

Derived independently from direct source reading and full-repo reference verification (grep-based, Serena not exercised as a separate tool this pass but reference-search results are equally reliable — every dead-code and duplication claim below is a verified, zero-match/all-match search result, not inference). No expected score and no other domain's findings (Architecture, Core, Data, Security, Reliability) were consulted before this score was drafted.

## Scorecard (score-loss ledger)

| Dimension | Max | Score | Lost | Root cause | Evidence | Confidence |
|---|---|---|---|---|---|---|
| Complexity & readability | 20 | 19 | 1 | No demonstrated complexity defect in the functions/files actually inspected (`applyPracticeAnswer`, `storage.ts`'s migration pipeline, spot-checked large UI files); light token for not exhaustively checking every large file at full depth | E1 (unchecked remainder only) / E2 (checked areas) | HIGH |
| Duplication / knowledge centralization | 15 | 13 | 2 | CODE-QA-003 — implementation-mechanics manifestation of the cross-domain progress-field duplication (see Cross-domain notes) | E2 | HIGH |
| Type safety & runtime-shape safety | 15 | 12 | 3 | CODE-QA-001 — `as any` cast defeats a literal-union type with no compensating runtime validation | E2 | HIGH |
| Implementation cohesion | 15 | 15 | 0 | No defect found — inspected functions and the large `useUserProgress.ts` hook are internally cohesive, not grab-bags | E2 | HIGH |
| API / side-effect clarity | 10 | 9 | 1 | CODE-QA-004 — a function signature implies session-mode-sensitivity that doesn't exist | E2 | HIGH |
| Dead / legacy code | 10 | 7 | 3 | CODE-QA-002 — 5 confirmed dead exported functions, verified via full-repo reference search | E2/E3 (reference search) | HIGH |
| Naming / intent / documentation | 5 | 5 | 0 | No defect found — comments throughout the areas read are purposeful and accurate, no stale/misleading comments found | E2 | HIGH |
| Change safety / developer ergonomics | 10 | 9 | 1 | Light token cross-reference to CODE-QA-003's compiler-silent field-list drift risk — primary weight charged under Duplication above | E2 | HIGH |
| **TOTAL** | **100** | **89** | **11** | | | |

## Findings

| ID | Title | Severity | Confidence | Evidence | Related root cause | Status |
|---|---|---|---|---|---|---|
| CODE-QA-001 | `OnboardingScreen.tsx:101` calls `onGoalSelect(mins as any)`, bypassing `UserData.dailyGoalMinutes`'s literal-union type (`2 \| 5 \| 10 \| 15`) — `GoalStep`'s `onSelectGoal` prop is generically typed `(minutes: number) => void`, and the cast exists specifically to force the mismatch through. `storage.ts`'s `fillDefaults()` only guards falsy/missing values, not out-of-range ones — no runtime validation compensates. Independent review confirmed this is not merely theoretical: `GoalStep` is a reusable component, and the only reason this hasn't fired yet is that its options happen to be hardcoded to the valid set today | P3 | HIGH | E2 (`OnboardingScreen.tsx:101`, `GoalStep.tsx`, `types/user.ts:107`, `storage.ts` `fillDefaults`) | None | OPEN |
| CODE-QA-002 | Five exported functions have zero production call sites, confirmed via full-repo reference search (independently re-verified by reviewer): `getNextPracticeQuestion` (`contentService.ts`), `importUserDataJSON` (`storage.ts` — the export path is wired to the UI, the import counterpart never is), `reportError` (`errorReporter.ts`, an unwired future-Sentry placeholder), `summarizeMastery` and `countMasteredWords` (`domain/learning/mastery.ts` — extensively unit-tested, 7+ call sites in `tests/testSuite.ts`, but never invoked by production code; `calculateGardenProgress` is fed a different value in production) | P4 | HIGH | E2/E3 (full-repo grep, zero non-definition matches for all 5) | None | OPEN |
| CODE-QA-003 | `syncUserProgress()`'s (`firestore.ts`) manually-curated field-subset object literal has no compile-time tie to the `UserData` type — TypeScript's structural typing allows it to omit arbitrarily many fields with zero error, confirmed by direct inspection. This is the implementation-mechanics manifestation of a separately-audited architecture root cause (no canonical progress schema) | P4 | HIGH | E2 (`firestore.ts` L142-162) | ARCH-QA-001 (ARCHITECTURE-001-BASELINE) | OPEN |
| CODE-QA-004 | `applyPracticeAnswer`'s `_sessionMode` parameter is accepted but never read in the function body — the underscore prefix signals intentional non-use to a linter, but independent review confirmed this is a real, if narrow, behavioral-assumption risk: a caller could reasonably believe passing `"EXAM"` changes reward logic when it does not | P4 | HIGH | E2 (`domain/practice/answer.ts` L14-19) | CORE-QA-001 (CORE-001-BASELINE) | OPEN |

Findings were not padded to fill severity quotas — this is the complete set found with real, distinct implementation evidence at this depth.

## Independent review

**`code-reviewer` — AGREE.** Independently re-verified all four findings via its own source reading and reference searches, confirming: CODE-QA-001's real-not-theoretical nature and, if anything, a slightly conservative (not inflated) severity given the complete absence of compensating runtime validation; CODE-QA-002's all five dead-code claims via independent grep with no barrel/dynamic-dispatch usage found; CODE-QA-003's precise compiler-silence mechanic; and CODE-QA-004's genuine (not purely cosmetic) behavioral-assumption risk despite the underscore-prefix convention. Reviewer also spot-checked `GardenHeroCard.tsx` and `PracticeHubScreen.tsx` (both cohesive, low-lifecycle-risk presentational compositions) and found no missed hotspot, no large-file bias, no false dead-code claim, and no double-counting beyond what was already intentionally and lightly applied for CODE-QA-003/004. No adjustment to the score was made — 89/100 stands as independently agreed.

## Strongest area

Implementation cohesion and naming/documentation: functions inspected across the domain and service layers are internally single-purpose, and comments are used purposefully to explain genuinely non-obvious design decisions (e.g., `storage.ts`'s shape-detection-over-version-trust rationale, `telemetry.ts`'s honesty note about Firebase Analytics not working in RN) rather than restating what the code already shows.

## Weakest area

Dead/legacy code and type safety: a small but real cluster of unreferenced exports (some clearly superseded by the exam-based leveling redesign, per the codebase's own roadmap comments) and one concrete, compiler-silenced type-safety defeat with no compensating runtime check.

## Cross-domain notes (not double-scored)

- CODE-QA-003 is the implementation-mechanics twin of ARCH-QA-001 (ARCHITECTURE-001-BASELINE's "no canonical progress schema" finding) and of DATA-QA-002 (DATA-001-BASELINE's resulting data-correctness bug). This audit scores only the compiler-silence mechanic, very lightly, to avoid re-charging the same root cause a third time across three independent audits.
- CODE-QA-004 is the API-clarity twin of CORE-QA-001 (CORE-001-BASELINE's reward-accounting non-differentiation finding). This audit scores only the signature-clarity angle, very lightly, for the same reason.

## Historical reconciliation (performed last, against `.audit/state/FINDING_REGISTRY.md`, read-only)

| Historical ID | Historical status | Reconciliation this pass |
|---|---|---|
| ARCH-001 (P3, dead duplicate file `i18n/formatters.ts`, deleted) | CLOSED | **CLOSED AND STILL VALID** — a different, unrelated dead-code instance (that file no longer exists); CODE-QA-002's 5 dead exports are a distinct, new discovery at this deeper pass, not a regression of ARCH-001 |
| DEP-001 (P4, npm audit dependency health, ACCEPTED_RISK) | ACCEPTED_RISK | Not directly comparable — a different category (third-party dependency health, not first-party dead code); no reconciliation action needed |

No prior CODE-QUALITY-domain audit exists to compare against directly — this is the first. No historical registry file was modified. The independent score above was fixed before this section was read, per the audit's anti-anchoring rule.

## Final validation

- `git diff -- src`: empty
- `git diff -- tests`: empty
- `git status --short`: only pre-existing untracked/modified audit-artifact and asset files (no application source or test changes)
