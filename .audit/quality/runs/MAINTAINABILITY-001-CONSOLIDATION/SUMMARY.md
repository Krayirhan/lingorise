# MAINTAINABILITY-001-CONSOLIDATION — CANONICAL MAINTAINABILITY SCORE

Revision: `16b9aab1f776503ec52067d4f543af8ab6f2e9aa`

This consolidates two independent evidence audits — **ARCHITECTURE-001-BASELINE (90/100)** and **CODE-QUALITY-001-BASELINE (89/100)** — into one canonical Maintainability score via root-cause deduplication against a dedicated consolidation rubric, **not** a blind average (which would be 89.5).

## Canonical Maintainability: 85/100

Confidence: HIGH

## Root-cause deduplication (full detail in `ROOT_CAUSE_MAP.md`)

Seven source findings (3 Architecture, 4 Code Quality) were consolidated into **five canonical findings**:

- **MAINT-QA-001** ← ARCH-QA-001 + CODE-QA-003 (SAME ROOT CAUSE — no canonical user-progress schema, viewed architecturally and at the implementation-mechanics level)
- **MAINT-QA-002** ← ARCH-QA-002 (independent — service-boundary bypass)
- **MAINT-QA-003** ← ARCH-QA-003 + CODE-QA-002 (RELATED BUT DISTINCT, merged — dead/legacy code cluster)
- **MAINT-QA-004** ← CODE-QA-001 (independent — type-safety cast)
- **MAINT-QA-005** ← CODE-QA-004 (independent within this consolidation's scope, despite its own audit noting an external relation to CORE-QA-001 from a different, unrelated domain audit)

## Scorecard (full detail and per-root-cause ledger in `SCORECARD.md`)

| Dimension | Max | Score | Lost | Canonical root cause |
|---|---|---|---|---|
| Architecture boundaries & dependency direction | 15 | 13 | 2 | MAINT-QA-002 |
| State / responsibility ownership | 15 | 15 | 0 | No concrete finding maps here |
| Change isolation & modularity | 15 | 12 | 3 | MAINT-QA-001 (secondary) |
| Complexity & implementation readability | 15 | 15 | 0 | No concrete finding maps here |
| Knowledge centralization / duplication | 15 | 10 | 5 | MAINT-QA-001 (primary) |
| Type safety & change safety | 10 | 8 | 2 | MAINT-QA-004 |
| API / side-effect clarity | 10 | 9 | 1 | MAINT-QA-005 |
| Legacy code / structural hygiene | 5 | 3 | 2 | MAINT-QA-003 |
| **TOTAL** | **100** | **85** | **15** | |

## Canonical findings

| ID | Title | Severity | Source findings |
|---|---|---|---|
| MAINT-QA-001 | No canonical schema for "user progress" — independently declared in three places in `firestore.ts` with no compiler-enforced central ownership, already causing real drift | P2 | ARCH-QA-001, CODE-QA-003 |
| MAINT-QA-002 | Two profile components bypass the `services/auth.ts` boundary for one direct Firebase write call | P3 | ARCH-QA-002 |
| MAINT-QA-003 | A bounded cluster of dead/unused code surface: 2 dead barrel re-export files + 5 individually-orphaned exported functions | P4 | ARCH-QA-003, CODE-QA-002 |
| MAINT-QA-004 | An `as any` cast defeats a literal-union type with no compensating runtime validation | P3 | CODE-QA-001 |
| MAINT-QA-005 | A function signature implies behavior-sensitivity that doesn't exist | P4 | CODE-QA-004 |

## Independent review

**`code-reviewer` — ADJUST.** Independently re-verified the root-cause map (confirmed ARCH-QA-001/CODE-QA-003 are the same underlying fact in the same `firestore.ts` functions; confirmed the two dead barrel files have zero importers). Confirmed no double-counting: MAINT-QA-001 correctly avoids a third-dimension charge in State ownership, and MAINT-QA-003 correctly avoids appearing in both Architecture boundaries and Legacy code. Flagged two proportionality issues in the initial draft: (1) the reasoning for MAINT-QA-001's -8 weight ("two confirmations deserve more punishment than either alone") mischaracterized what corroboration means — two audits observing the same real defect increases *confidence* it exists, not its *magnitude* — though the reviewer agreed the resulting -8 figure itself sits in a defensible range (6-9) once reframed correctly as "combining two independently-light single-audit treatments into one properly-weighted treatment" rather than "corroboration deserves a premium"; (2) MAINT-QA-003 (dead code, P4) spending 60% of the dedicated 5-point Legacy-code dimension was disproportionate to its own P4 severity, and MAINT-QA-004's type-safety deduction was inflated by naively carrying an absolute point value across a resized (15pt→10pt) dimension without adjusting proportionally. Both corrected: MAINT-QA-003 -3→-2, MAINT-QA-004 -3→-2, moving the total from a draft 83 to the reconciled **85/100**. Reviewer confirmed CODE-QA-004/MAINT-QA-005 was correctly included in scope (its external relation to CORE-QA-001 is contextual information, not grounds for exclusion from this Architecture+Code-Quality consolidation).

## Strongest maintainability area

State/responsibility ownership and implementation complexity/readability (both 15/15) — both source audits independently confirmed a genuinely clear single-owner state model and no demonstrated complexity defects in the domain/state code actually inspected; project-size-appropriate architecture (no over-engineering) is preserved as a conclusion from ARCHITECTURE-001-BASELINE, unchallenged by any consolidation evidence.

## Weakest maintainability area

Knowledge centralization / duplication, driven by MAINT-QA-001: the same real, already-demonstrated schema-drift defect was independently observed from two angles (architectural absence of a canonical schema, and the implementation-level compiler-silence that lets it drift unnoticed) — the single most consequential canonical finding in this consolidation.

## Project-size appropriateness

Preserved from ARCHITECTURE-001-BASELINE: the codebase's overall complexity remains **appropriate for LingoRise's actual size and team scale** — no over-engineering, no missing enterprise patterns that would actually help at this scale. No consolidation evidence contradicts this conclusion.

## Final validation

- `git diff -- src`: empty
- `git diff -- tests`: empty
- `git status --short`: only pre-existing untracked/modified audit-artifact and asset files
- `ARCHITECTURE-001-BASELINE/` and `CODE-QUALITY-001-BASELINE/` files: unmodified (read-only inputs to this consolidation)
- `.audit/state/FINDING_REGISTRY.md`: not read, not modified (historical reconciliation deferred to a future Master Consolidation, per this run's own scope)
