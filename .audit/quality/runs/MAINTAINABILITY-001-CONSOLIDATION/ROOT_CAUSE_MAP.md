# MAINTAINABILITY-001-CONSOLIDATION — Root Cause Map

Revision: `16b9aab1f776503ec52067d4f543af8ab6f2e9aa`

| Source finding | Canonical finding | Relationship | Reason |
|---|---|---|---|
| ARCH-QA-001 (Architecture, P2) | MAINT-QA-001 | SAME ROOT CAUSE as CODE-QA-003 | "No canonical user-progress schema" — the architectural framing |
| CODE-QA-003 (Code Quality, P4) | MAINT-QA-001 | SAME ROOT CAUSE as ARCH-QA-001 | The exact same `firestore.ts` functions (`syncUserData`/`syncUserProgress`/`mergeAndSyncUserData`), viewed as "no compiler tie to `UserData`'s shape" — the implementation-mechanics manifestation of the identical fact |
| ARCH-QA-002 (Architecture, P3) | MAINT-QA-002 | INDEPENDENT | No Code Quality counterpart exists — two profile components bypassing `services/auth.ts` is a boundary-clarity issue with no implementation-level twin found in the Code Quality pass |
| ARCH-QA-003 (Architecture, P4) | MAINT-QA-003 | RELATED BUT DISTINCT from CODE-QA-002 | Both are dead/unused code, but different concrete symbols (2 dead barrel re-export files vs. 5 individually-orphaned functions) with different specific causes (indirection never adopted vs. features superseded/never wired) — consolidated into one canonical "dead/legacy surface" finding because the *type* of maintainability harm (confusion, wasted surface, zero distinct change-risk beyond hygiene) is the same, not because the facts are identical |
| CODE-QA-002 (Code Quality, P4) | MAINT-QA-003 | RELATED BUT DISTINCT from ARCH-QA-003 | See above |
| CODE-QA-001 (Code Quality, P3) | MAINT-QA-004 | INDEPENDENT | No Architecture counterpart — a bounded `as any` cast defeating a literal-union type, confined to one screen/one field |
| CODE-QA-004 (Code Quality, P4) | MAINT-QA-005 | INDEPENDENT (within these two audits) | No Architecture counterpart. Both source audits already noted this finding's own external relation to CORE-QA-001 (CORE-001-BASELINE) — that relation is preserved as context but does not merge it with any Architecture/Code-Quality finding here |

## Canonical finding set

| ID | Title | Severity | Source findings |
|---|---|---|---|
| MAINT-QA-001 | No canonical schema for "user progress" — independently declared in three places in `firestore.ts` with no compiler-enforced central ownership, already causing real drift | P2 | ARCH-QA-001, CODE-QA-003 |
| MAINT-QA-002 | Two profile components bypass the `services/auth.ts` boundary for one direct Firebase write call (`updateProfile`) | P3 | ARCH-QA-002 |
| MAINT-QA-003 | A bounded cluster of dead/unused code surface: 2 dead barrel re-export files + 5 individually-orphaned exported functions | P4 | ARCH-QA-003, CODE-QA-002 |
| MAINT-QA-004 | An `as any` cast defeats a literal-union type (`dailyGoalMinutes`) with no compensating runtime validation | P3 | CODE-QA-001 |
| MAINT-QA-005 | A function signature (`applyPracticeAnswer`'s `_sessionMode`) implies behavior-sensitivity that doesn't exist | P4 | CODE-QA-004 |

Five canonical findings from seven source findings — two genuine consolidations (schema drift, dead code), three findings carried through independently.
