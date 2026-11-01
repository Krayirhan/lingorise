# Store Master Copy (English, primary)

Positioning basis (per authoritative product definition supplied this run): a general-audience English practice application for school-age children, teenagers, and adults, focused on vocabulary, correct word/word-form identification, exercises, repetition, and gamified practice — not a traditional course-based English program.

## App name

**LingoRise** (9 characters — well within Play's 30-character limit; matches the existing Play listing's own title exactly, no change needed).

## Short description (≤80 characters)

> Practice English vocabulary with fun exercises, streaks, and XP rewards.

(74 characters.)

## Full description (≤4000 characters)

> LingoRise helps you build real English vocabulary through short, focused practice sessions — no long lessons, no pressure, just steady progress.
>
> Pick the right word, match it to its meaning, and work through exercises that adapt to what you already know. Words you've mastered come back for quick review at the right time, so what you learn actually sticks.
>
> Stay motivated with XP, daily streaks, and progress tracking across six levels from beginner (A1) to advanced (C2). Take a level exam whenever you're ready to move up.
>
> LingoRise works fully offline as a guest — no account needed to start practicing. Create a free account anytime to keep your progress synced across devices.
>
> Whether you're a student building classroom vocabulary, a teenager preparing for exams, or an adult sharpening your English for work or travel, LingoRise fits a few minutes into any day.
>
> — Practice real vocabulary, not just flashcards
> — Track your streak and XP as you go
> — Six levels, from A1 to C2
> — Works offline, syncs when you're signed in
> — No ads

(Approx. 900 characters — verified against every truth constraint: no fluency/results guarantees, no ranking/award claims, no fabricated reviews/downloads, no AI-feature claims, no "full course" claim, no child-only or adult-only framing. Every listed capability is directly source-verified across this program's own prior evidence: level range A1–C2, XP/streak/badges, offline guest mode, optional account sync, no ads.)

## Truth-check against source

| Claim | Evidence |
|---|---|
| "Pick the right word, match it to its meaning" | `MeaningMatchQuestion` type, `applyPracticeAnswer` |
| "Words you've mastered come back for quick review" | Spaced-repetition system, `src/domain/review/spacedRepetition.ts` |
| "XP, daily streaks" | `PROGRESS_FIELD_STRATEGY`'s `xp`/`streak` fields, gamification module |
| "six levels from A1 to C2" | `LevelCode` type (`A1, A2, B1, B2, C1, C2`) |
| "Take a level exam" | Level exam system, confirmed across Sprint 1/2's own audit trail |
| "works fully offline as a guest" | Confirmed local-first architecture (`CLAUDE.md`, Sprint 1's guest-mode verification) |
| "syncs when you're signed in" | Firebase Auth/Firestore sync, extensively verified across Sprint 1 |
| "no ads" | `04_ADS.md` |

## Status

**English master copy: READY.** Pushed to Play via `edits.listings` — see `24_STORE_API_DEPLOYMENT.md` for the exact API call and confirmation.
