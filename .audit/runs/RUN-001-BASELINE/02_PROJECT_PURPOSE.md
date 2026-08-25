# 02 — Project Purpose

## Primary purpose
Help a Turkish-speaking learner build durable English vocabulary knowledge through short, daily, spaced-repetition practice sessions, while keeping motivation high via streaks, XP, and visible progress — without losing the learner's progress across devices or app reinstalls if they choose to sign in.

## Primary user promises
- A learner's progress (words known, streak, XP, mastery level) is never silently lost.
- Words that were answered incorrectly come back for review at scientifically reasonable intervals (spaced repetition), and words that are truly known stop cluttering daily practice.
- The daily streak accurately reflects consecutive days of real engagement — it is a core motivational/trust signal, not a cosmetic number.
- Signing in preserves and merges progress across devices; using the app as a guest still works fully, without an account.
- The practice loop (see a word → answer → get feedback → move on) never crashes or dead-ends.

## Success conditions
- A learner can complete a daily practice session end-to-end without errors, on both a signed-in and guest account.
- SRS scheduling actually spaces reviews (verified by `tests/testSuite.ts`'s interval/leech/jitter/taper suites) rather than showing the same words forever or losing hard words in an infinite easy loop.
- Streak, XP, and mastery counters are internally consistent (no negative streaks, no words "mastered" that were never seen, no double-counted XP).
- Signed-in progress round-trips through Firestore correctly (local → cloud → another device local) without data loss, verified by `firestore.rules` tenant-isolation tests and the local-first merge logic.

## Failure consequences
- **Data loss** (a lost streak or lost word-mastery history) — the most damaging realistic failure for this product; it directly breaks the "progress is never lost" promise and is the single most emotionally costly bug class in a gamified habit app.
- **Privacy leak** — low likelihood/impact given the data model (vocabulary progress, no health/financial/government-ID data), but account-deletion completeness still matters for user trust and store-policy compliance.
- **Inconvenience** — a crash mid-session, a confusing streak reset, or duplicate/missing daily quests. Realistic and the most likely category of user-visible defect in this codebase given its size and single-developer-style history.
- **Availability impact** — not classically applicable (no SLA, no paid service); an outage of Firebase would only degrade sync, not break local practice, by design.
- Financial loss, account compromise at scale, and legal/regulatory harm are **not realistic** consequences for this product's actual data model — see Non-goals.

## Non-goals
- Enterprise-scale multi-tenant security engineering (rate limiting, WAF, distributed tracing, horizontal scaling) — this is a single-Firebase-project consumer app with a small expected user base; none of this is required by the purpose.
- Payment processing, health data, or any regulated data category — none present in the data model.
- Native iOS shipping readiness at this revision — `ios/` is not a committed buildable project; iOS-specific release engineering is out of scope for this audit's evidence (Android is the evaluated release target).
- Enterprise observability (APM, distributed tracing, SLO dashboards) — disproportionate to a client-only app with a BaaS backend; local telemetry + Firebase's own console are proportionate for this scale.
- Offline peer-to-peer sync / multi-device real-time collaboration — the product promise is "your own progress follows you," not live multi-device concurrent editing; last-write-wins-with-merge is an appropriate strategy here, not a gap.

## Release context
**Public consumer app store release (Google Play primary)**, pre-launch stage. Evidence: `docs/roadmap/12-launch-readiness-checklist.md`, `docs/roadmap/17-data-safety-worksheet.md` (Play Data Safety form prep), `eas.json` production build profile, real production Firebase project identifiers in the committed `.env.example` (`lingorise-65cb1`). No evidence of an already-live public listing was found in-repo. `STRONGLY_INFERRED`.

## Purpose confidence/conflicts
No conflicting purpose signals found — README, `app.json`, roadmap docs, and the actual code all describe the same product consistently (vocabulary SRS practice app with gamification and optional cloud sync). The project's own `docs/roadmap/` history (18 sequential planning documents, ending in a dedicated SRS-hardening pass) shows a maintained, evolving product rather than an abandoned prototype — this audit treats the current `main` branch (revision `4a80283`) as the authoritative intended behavior.
