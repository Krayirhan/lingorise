# Current Purpose

STATUS: INITIALIZED

## Primary purpose
Help a Turkish-speaking learner build durable English vocabulary knowledge through short, daily, spaced-repetition practice sessions, while keeping motivation high via streaks, XP, and visible progress — without losing the learner's progress across devices or app reinstalls if they choose to sign in.

## Primary user promises
- Progress (words known, streak, XP, mastery) is never silently lost.
- Daily practice always shows new material — an already-learned word is never
  resurfaced there — and finishing a level reflects real command of it, verified by
  a single deliberate completion exam (60 questions drawn from across the whole
  level, 50+ correct to pass), not luck or which words happened to come up.
  *(Revised 2026-08-27 / RUN-006-REAUDIT: per-word spaced-repetition review inside
  daily practice was retired — see `docs/roadmap/18-srs-flow-hardening.md` and
  commit `1d8372d`. The underlying SRS machinery (`spacedRepetition.ts`,
  `mastery.ts`, leech detection) still exists and still drives badges, the garden
  growth stage, and the "remind me later" bookmark feature — it no longer drives
  daily practice or level promotion. The original promise text is preserved below
  for run-history traceability; it no longer describes shipped behavior.)*
  - ~~SRS scheduling actually spaces reviews; known words stop cluttering practice, hard words come back.~~ (superseded)
- The daily streak accurately reflects consecutive days of real engagement.
- Signing in preserves/merges progress across devices; guest mode works fully without an account.
- The practice loop never crashes or dead-ends. *(CORE-004, opened RUN-006-REAUDIT,
  CLOSED RUN-007-REAUDIT: the level-exhausted terminal state now shows a distinct
  "level complete" state/CTA on both Home and Practice Hub instead of a silent
  no-op. Closed against the working tree — not yet committed/pushed; on-device
  confirmation still pending, see RUN-007-REAUDIT/SUMMARY.md.)*

## Success conditions
See `runs/RUN-001-BASELINE/02_PROJECT_PURPOSE.md` for full detail.

## Non-goals
Enterprise-scale backend security engineering, payments/health/regulated data, iOS release readiness at this revision, enterprise observability/APM, real-time multi-device collaboration.

## Intended release context
Public consumer app store release (Google Play primary), pre-launch stage.

## Purpose revision
- Version: 1.0 (text corrected 2026-08-27 to match shipped behavior; not a rubric
  version bump — see RUN-006-REAUDIT/SUMMARY.md for why no new rubric version was
  warranted)
- Source run: RUN-001-BASELINE
- Last changed: 2026-08-27 (RUN-006-REAUDIT)
