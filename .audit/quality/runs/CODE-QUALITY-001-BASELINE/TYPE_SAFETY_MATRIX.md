# CODE-QUALITY-001-BASELINE — Type Safety Matrix

Revision: `16b9aab1f776503ec52067d4f543af8ab6f2e9aa`

Full-repo grep for `any`/`as any`/`<any>` usage in `src/`: **15 occurrences total**. Each was individually inspected (not assumed to be a defect).

| Location | Pattern | Risk assessment | Verdict |
|---|---|---|---|
| `src/utils/logger.ts` (4x) | `...args: any[]`, `context?: Record<string, any>` | Generic logging-sink signature; inherently polymorphic input, no product-state propagation | BENIGN |
| `src/services/errorReporter.ts` (4x) | `error: any`, `catch (error: any)` | Standard catch-clause/error-object typing; JS errors are inherently untyped | BENIGN |
| `src/screens/AuthScreen.tsx:99` | `catch (e: any)` | Same as above | BENIGN |
| `src/features/profile/components/AccountManagementCard.tsx` (4x) | `catch (e: any)` | Same as above | BENIGN |
| `src/features/home/components/RecommendedWordCard.tsx:21` | `(e: any) => {}` | RN event-handler parameter; event shape not consumed for anything unsafe | BENIGN |
| **`src/screens/OnboardingScreen.tsx:101`** | **`onGoalSelect(mins as any)`** | **Bypasses `UserData.dailyGoalMinutes`'s literal-union type (`2 \| 10 \| 15` — see `src/types/user.ts` line 107) at its only call site. `GoalStep`'s `onSelectGoal` prop is typed as a generic `(minutes: number) => void`, so the cast exists specifically to force a mismatched type through. `storage.ts`'s `fillDefaults()` only guards falsy/missing values (`parsed.dailyGoalMinutes \|\| DEFAULT`), not out-of-range ones — no runtime validation compensates for the disabled compile-time check.** | **CODE-QA-001 — real, bounded type-safety defeat** |

Non-null assertions: **1 occurrence**, `src/state/useAppSession.ts:21` (`byDifficulty.get(d)!.push(q)`), immediately preceded by `if (!byDifficulty.has(d)) byDifficulty.set(d, [])` on the prior line — provably safe, not a defect.

## Summary

Type safety across the codebase is strong: TypeScript strict mode plus a very small (15-occurrence) and mostly-benign set of `any` usages, almost entirely confined to catch-clause/error-object/logging boundaries where JS's own error typing already limits precision. The one real exception — `OnboardingScreen.tsx`'s cast — is a concrete, demonstrated defeat of a literal-union type exactly where it should matter, and is the sole Type Safety finding this pass.
