# CODE-QUALITY-001-BASELINE — Change Safety Matrix

Revision: `16b9aab1f776503ec52067d4f543af8ab6f2e9aa`

| Scenario | Implementations to update | Would the compiler/types guide the change? | Could a forgotten update silently drift? | Assessment |
|---|---|---|---|---|
| A. Change XP reward values | `domain/gamification/xp.ts`, `domain/practice/answer.ts`'s `REVIEW_XP_REWARD`, `domain/gamification/badges.ts`'s quest bonus | Partially — each constant is a distinct, correctly-separated concern, not duplicated knowledge | No — these are genuinely different reward types, not the same value copied three times | LOW risk |
| B. Add one new quest type | `domain/gamification/badges.ts` (`createDailyQuests`, `updateDailyQuests`) | Yes — quest shape is a typed structure | No | LOW risk |
| C. Add one field to user progress | `types/user.ts`, `storage.ts` defaults, `useUserProgress.ts`, **and, if cloud-synced, `firestore.ts`'s three independent field declarations** | **No for the Firestore layer specifically** — TypeScript's structural typing allows `syncUserProgress()`'s object literal to omit arbitrarily many `UserData` fields with zero compile error | **Yes — already demonstrated** (a field was in fact silently dropped from the merge list; see DATA-QA-002/ARCH-QA-001) | **MODERATE-HIGH risk for the cloud-sync leg specifically** (CODE-QA-003, related root cause: ARCH-QA-001) |
| D. Change level-exam pass behavior | `domain/learning/levelExam.ts`'s centralized constants (`EXAM_QUESTION_COUNT`, `EXAM_PASS_COUNT`) | Yes | No | LOW risk |
| E. Add new user preference | `types/user.ts`, `storage.ts` defaults, `useUserProgress.ts` setter, relevant profile card | Yes — each layer is a small, expected, type-checked edit | No — routine, well-trodden pattern in this codebase | MODERATE (expected, not a defect) |
| F. Change persistence schema | `storage.ts`'s existing versioned migration pipeline (`migrateV1ToV2`, `migrateV2ToV3`, `normalizeUserData`) | Yes — the pipeline is purpose-built for exactly this change | No — self-detecting, idempotent steps are specifically designed to avoid silent drift | LOW risk — a genuine strength |
| G. Add new practice mode | `domain/practice/*`, `useAppSession.ts` | Yes | No | MODERATE (expected, multi-layer but each layer clear) |

## Summary

Change safety is generally strong — the type system and existing patterns (especially `storage.ts`'s migration pipeline) actively guide correct changes in most scenarios. The one demonstrated exception is scenario C's cloud-sync leg: TypeScript's structural typing does not force any of `firestore.ts`'s three field-declaration sites to acknowledge a new `UserData` field, and this has already produced a real, silent drift defect. This is the same root cause already scored as CODE-QA-003 (lightly, to avoid double-counting ARCHITECTURE-001-BASELINE's ARCH-QA-001) and is not charged a second time in the SUMMARY.md scorecard beyond that single light deduction.
