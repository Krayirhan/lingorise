# MAINTAINABILITY-001 — FINAL RESULT (CANONICAL)

**This is the canonical Maintainability score for future Master Consolidation, fix planning, and Maintainability reaudits.**

Revision: `16b9aab1f776503ec52067d4f543af8ab6f2e9aa`

## Maintainability: 85/100

Confidence: HIGH

| Severity | Count |
|---|---|
| P0 | 0 |
| P1 | 0 |
| P2 | 1 |
| P3 | 2 |
| P4 | 2 |

## Independent reviewer verdict

**`code-reviewer` — ADJUST — applied.** Confirmed the root-cause deduplication map was structurally sound (no double-counting across dimensions) but found two proportionality errors in the initial draft ledger: the dead-code finding (MAINT-QA-003, P4) was consuming a disproportionate 60% of its small dedicated dimension, and the type-safety finding (MAINT-QA-004) had its absolute point value carried naively across a resized dimension rather than proportionally. Both corrected (-3→-2 each), moving the draft score from 83 to the canonical **85/100**. The reviewer also corrected the *reasoning* behind the largest finding's weight (MAINT-QA-001, -8 total): two independent audits corroborating the same real defect increases confidence it exists, not its magnitude — the correct principle is that consolidation combines each audit's own deliberately-light internal treatment into one properly-weighted treatment, not that corroboration itself earns a premium. The resulting -8 figure was confirmed to already sit in a defensible range under the corrected reasoning, so it was not changed.

## Canonical findings

| ID | Title | Severity | Source findings |
|---|---|---|---|
| MAINT-QA-001 | No canonical schema for "user progress" — independently declared in three places in `src/services/firestore.ts` (`syncUserData`, `syncUserProgress`, `mergeAndSyncUserData`) with no compiler-enforced central ownership. Already caused real drift (a field silently dropped from a merge list) | **P2** | ARCH-QA-001 (ARCHITECTURE-001-BASELINE), CODE-QA-003 (CODE-QUALITY-001-BASELINE) |
| MAINT-QA-002 | `AccountManagementCard.tsx` and `DataManagementCard.tsx` bypass the `services/auth.ts` boundary — the concrete violation narrows to one direct `updateProfile()` Firebase SDK call that belongs in the service layer | P3 | ARCH-QA-002 |
| MAINT-QA-004 | `OnboardingScreen.tsx`'s `onGoalSelect(mins as any)` cast defeats `UserData.dailyGoalMinutes`'s literal-union type with no compensating runtime validation | P3 | CODE-QA-001 |
| MAINT-QA-003 | A bounded cluster of dead/unused code: 2 dead barrel re-export files (`services/gamification.ts`, `services/spacedRepetition.ts`) + 5 individually-orphaned exported functions (`getNextPracticeQuestion`, `importUserDataJSON`, `reportError`, `summarizeMastery`, `countMasteredWords`) | P4 | ARCH-QA-003, CODE-QA-002 |
| MAINT-QA-005 | `applyPracticeAnswer`'s `_sessionMode` parameter is accepted but never used — implies session-mode-sensitive reward behavior that doesn't exist | P4 | CODE-QA-004 |

## Canonical Scorecard

| Dimension | Max | Score | Lost |
|---|---|---|---|
| Architecture boundaries & dependency direction | 15 | 13 | 2 |
| State / responsibility ownership | 15 | 15 | 0 |
| Change isolation & modularity | 15 | 12 | 3 |
| Complexity & implementation readability | 15 | 15 | 0 |
| Knowledge centralization / duplication | 15 | 10 | 5 |
| Type safety & change safety | 10 | 8 | 2 |
| API / side-effect clarity | 10 | 9 | 1 |
| Legacy code / structural hygiene | 5 | 3 | 2 |
| **TOTAL** | **100** | **85** | **15** |

## Strongest maintainability area

State/responsibility ownership and implementation complexity/readability (both full marks) — a genuinely clear single-owner state model (`UserData` via `useUserProgress`, `activeSession`, a deliberate module-level catalogue singleton with a single writer) and no demonstrated complexity defects in the domain/state code inspected across both source audits.

## Weakest maintainability area

Knowledge centralization / duplication — the app's most important cross-cutting concept ("what fields constitute user progress") has no canonical declaration, independently confirmed from both an architectural and an implementation-mechanics angle, and has already caused a real, demonstrated drift defect.

## Evidence sources

Architecture evidence source: **ARCHITECTURE-001-BASELINE** (90/100 — architecture-only evidence, not directly used as an input weight)
Code Quality evidence source: **CODE-QUALITY-001-BASELINE** (89/100 — implementation-only evidence, not directly used as an input weight)

This canonical 85/100 was reconstructed from a dedicated Maintainability rubric and root-cause deduplication — it is not a blind average of the two evidence scores (which would be 89.5) and may legitimately, and does here, fall outside the range either individual evidence score alone would suggest.

## Project-size appropriateness

LingoRise's overall architecture and implementation complexity remain **appropriate for its actual product/team scale** — no over-engineering was found, and no consolidation evidence contradicts ARCHITECTURE-001-BASELINE's own conclusion on this point.

## Immutable evidence chain

`ARCHITECTURE-001-BASELINE/` and `CODE-QUALITY-001-BASELINE/` (all four files each) remain unmodified and stand as the immutable evidence trail behind this canonical result. `ROOT_CAUSE_MAP.md` and `SCORECARD.md` in this same run directory provide the full deduplication and ledger detail. This file does not alter or supersede any of those artifacts — it is a derived, canonical summary for downstream consumption by a future Master Consolidation.

`.audit/state/FINDING_REGISTRY.md` was not read and not modified — global historical reconciliation is explicitly deferred to a future Master Consolidation pass, per this run's own scope.
