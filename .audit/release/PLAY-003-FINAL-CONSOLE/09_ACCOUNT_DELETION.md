# Account Deletion

## Owner decision (confirmed)

Full account deletion: Firebase Auth account, profile, XP, streak, practice progress, learning/practice history, other account-linked data. No routine post-deletion retention.

## Implementation verification (re-confirmed, matches decision exactly)

`deleteAccount()` (`src/services/auth.ts`) deletes the Firestore progress document (including `dailyTasks`, added in Sprint 1 specifically to close an earlier incomplete-cleanup gap) and the Firebase Auth account — covering XP, streak, level, solved/rewarded questions, passed exams, favorites, practice/quest history, and the account credential itself. No routine retention occurs after a fully successful deletion; the only disclosed edge case is a failed partial deletion (surfaced to the user for retry, never silently reported as complete), which is a disclosed limitation, not undisclosed retention.

## Public deletion page wording check

Current page text: describes what gets deleted (progress document + Auth account) and the two-step/partial-failure limitation. Matches the owner's preferred meaning ("permanently deletes your account and the learning and practice data associated with it") in substance. No change made to the owner-managed privacy/deletion page content itself this run.

## Status

**Account deletion: PASS.** Fully matches the owner's decision, fully verified in source, consistent with the public page.
