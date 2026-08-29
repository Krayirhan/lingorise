# ARCHITECTURE-001-BASELINE — DEEP MAINTAINABILITY ARCHITECTURE AUDIT

Revision: `16b9aab1f776503ec52067d4f543af8ab6f2e9aa` (== origin/main at audit time)

**This is an ARCHITECTURE evidence score, not the canonical Maintainability score.** Code Quality will be audited separately (`CODE-QUALITY-001-BASELINE`); both evidence sets will later be consolidated by a future `MAINTAINABILITY-001-CONSOLIDATION` pass, not by averaging.

## Architecture Evidence Score: 90/100

Confidence: HIGH

Derived independently from direct source/import inspection (Graphify was not available as a callable tool this session — structural claims below are E2 static-certain grep/read evidence, not E3 tool-confirmed graph output; confidence is still HIGH because every dependency-direction claim is a verified import fact). No expected score, no other domain's score, and no historical findings were consulted before this score was drafted.

## Scorecard (score-loss ledger)

| Dimension | Max | Score | Lost | Root cause | Evidence | Confidence |
|---|---|---|---|---|---|---|
| Module boundaries & responsibility | 20 | 16 | 4 | ARCH-QA-002 (-2, adjusted down from an initial -3 by independent review: the real violation is a single missing `updateProfile`-equivalent function in the service layer, not a broad boundary collapse) + ARCH-QA-003 (-2, two dead barrel files create a misleading phantom service-layer surface) | E2 | HIGH |
| Dependency direction & coupling | 20 | 20 | 0 | No defect found — domain/ is 100% pure, no reverse-direction imports, no cross-feature coupling, no cycles. (ARCH-QA-002's leak is charged under Module boundaries only, per anti-double-counting) | E2 | HIGH |
| State ownership / source of truth | 20 | 19 | 1 | Light cross-reference token to ARCH-QA-001's "progress mirrored across two Firestore documents" angle — primary weight charged under Cohesion below | E2 | HIGH |
| Cohesion & change isolation | 15 | 11 | 4 | ARCH-QA-001 — the "user progress" field set is independently declared in three places with no canonical schema, meaning an ordinary field addition requires synchronized hand-edits across three functions and has already caused real drift | E2 | HIGH |
| Modularity / extensibility | 10 | 9 | 1 | Adjusted down from an initial -3 by independent review: the "replace Auth provider" scenario's blast radius is real but smaller than initially framed (one missing function + read-only field access in two files, not a broad rewrite) | E2 | HIGH |
| Testability of architecture | 10 | 10 | 0 | No defect — domain/ is fully pure and directly unit-testable with no mocking required; a separate test-suite tooling limitation (already noted in RELIABILITY-001-BASELINE) is not an architecture defect per this audit's own scope rule | E2 | HIGH |
| Project-size appropriateness | 5 | 5 | 0 | No over-engineering found: no DI framework, no premature CQRS/event-bus/repository interfaces, appropriately simple single-hook state management for this app's scale | E2 | HIGH |
| **TOTAL** | **100** | **90** | **10** | | | |

## Findings

| ID | Title | Severity | Evidence | Status |
|---|---|---|---|---|
| ARCH-QA-001 | No canonical schema/field-registry for "user progress." `syncUserData()` spreads the entire `UserData` object into `users/{uid}`; `syncUserProgress()` separately hand-curates an overlapping subset (`xp`, `level`, `streak`, `lastActiveDate`, `practiceHistory`) into a second document `users/{uid}/progress/main`; `mergeAndSyncUserData()` maintains its own third, independent, hand-picked merge-field list. Three places must be kept in sync by hand with no shared source of truth — this has already caused real drift (a field silently omitted from the merge list). RELATED ROOT CAUSE: DATA-QA-002 (DATA-001-BASELINE) — that audit scored the resulting data-correctness *symptom*; this finding scores the architectural *cause* (no canonical schema) | P2 | E2 (`src/services/firestore.ts` L112-233) | OPEN |
| ARCH-QA-002 | `AccountManagementCard.tsx` and `DataManagementCard.tsx` (in `src/features/profile/components/`) import `auth` directly from `src/services/firebase.ts` and, in `AccountManagementCard.tsx`'s case, `updateProfile` directly from the `firebase/auth` SDK — bypassing `src/services/auth.ts`, the project's actual auth service layer. Independent review confirmed most of this usage is read-only (`auth.currentUser`, `.email`, `.displayName`, `.emailVerified`, a reasonable display-purpose exception) — the real, narrower violation is the one direct `updateProfile()` write call, which belongs in `services/auth.ts` as a proper exported function | P3 | E2 (both files' import lines) | OPEN |
| ARCH-QA-003 | `src/services/gamification.ts` and `src/services/spacedRepetition.ts` are dead barrel re-export files pointing at `domain/gamification/*` and `domain/review/spacedRepetition.ts` respectively, with zero real importers anywhere in `src/` (confirmed via grep, independently re-confirmed by reviewer) — every actual consumer imports the underlying `domain/` modules directly, leaving a misleading phantom service-layer indirection | P4 | E2 (grep, zero matches for either barrel path) | OPEN |

Findings were not padded to fill severity quotas — this is the complete set found with real, distinct structural evidence at this depth.

## Independent review

**`code-reviewer` — ADJUST.** Independently verified all three findings as CONFIRMED via direct source reading and its own grep re-verification. Confirmed ARCH-QA-001's P2 classification as reasonable given its already-demonstrated drift and genuine change-isolation cost. Flagged that ARCH-QA-001's root cause was being charged across three dimensions (Cohesion -4, State ownership -1, Modularity -3) in the original draft, which — while each was labeled as a cross-reference to avoid literal double-counting — cumulatively over-weighted a single root cause to roughly 8 points; recommended reducing the Modularity/extensibility deduction specifically, since the "replace Auth provider" scenario's actual blast radius (one missing function, not a broad rewrite) was more bounded than the initial framing suggested. Also recommended reducing ARCH-QA-002's Module-boundaries deduction, since the real violation narrows to a single missing write-path function once the read-only field accesses are properly treated as a reasonable display-purpose exception. Both adjustments (Modularity -3→-1, Module boundaries' ARCH-QA-002 component -3→-2) have been applied above, moving the total from a draft 87 to the reconciled **90/100**, within the reviewer's own recommended 89-90 range. No missed God-module risk was found beyond noting `syncUserData`'s unchecked `{...data}` spread as a minor type-safety observation more appropriate to a future Code Quality audit than to this one.

## Strongest area

Dependency direction and domain purity: `src/domain/` has zero React/Firebase/AsyncStorage coupling anywhere, confirmed by direct grep across every file in the directory. No cross-feature imports and no module cycles were found in any area checked. This gives the app's core business logic (exam building, promotion, mastery, XP/streak/badges, answer evaluation) a genuinely clean, directly-testable home, independent of any UI or infrastructure concern.

## Weakest area

Cohesion & change isolation, driven entirely by ARCH-QA-001: the app's most important cross-cutting concept ("what fields constitute a user's progress") has no single canonical declaration, so extending it correctly requires remembering to update three independent, hand-maintained lists — a demonstrated, not hypothetical, maintainability cost.

## Do Not Change

- The `domain/` layer's strict purity (no React/Firebase/AsyncStorage imports) — this is the architecture's biggest asset and should be preserved as new domain logic is added.
- The single-hook (`useUserProgress`) state-ownership model — appropriately simple for this app's scale; do not introduce Redux/Context-based global state stores without a demonstrated need.
- The local-first design where local storage is the deliberate source of truth and Firestore is an intentional best-effort mirror — this is correct architecture for the product's guest-first design intent, not a gap to "fix" by making cloud authoritative.

## Cross-domain notes (not double-scored)

- ARCH-QA-001 is the architectural root cause behind DATA-QA-002 (DATA-001-BASELINE's already-scored data-correctness symptom). This audit scores the structural cause; DATA-001-BASELINE's score for the resulting bug is untouched and not re-applied here.
- The catalogue-loading race (RELIABILITY-001-BASELINE's REL-QA-001) sits on top of an architecturally sound single-writer ownership model (`AppBootstrap` is the sole writer of the module-level catalogue global) — the ownership model itself is not an architecture defect; the race is a reliability-timing concern, already scored there.
- The absence of any cloud-sync-health state model is a deliberate, appropriate simplicity for this local-first app, not an architecture defect — its user-facing consequence (REL-QA-004, silent sync failures) is already scored in RELIABILITY-001-BASELINE.

## Historical reconciliation (performed last, against `.audit/state/FINDING_REGISTRY.md`, read-only)

| Historical ID | Historical status | Reconciliation this pass |
|---|---|---|
| ARCH-001 (P3, dead duplicate file `i18n/formatters.ts`) | CLOSED | **CLOSED AND STILL VALID** — unrelated to any new finding, no regression |
| ARCH-002 (P4, two layering inversions) | CLOSED | **CLOSED AND STILL VALID** — no new layering-inversion pattern of that type found; ARCH-QA-002 (this pass) is a distinct, narrower finding (direct-infra-access in two specific files, not a directional layering inversion) |
| ARCH-003 (P2, oversized multi-responsibility auth/account screens) | CLOSED | **CLOSED AND STILL VALID** — the size/multi-responsibility problem remains solved (the screens were already split into the current `features/profile/components/*` cards, including `AccountManagementCard.tsx` at a reasonable 294 lines). ARCH-QA-002 (this pass) found a boundary-purity issue *within* one of those already-fixed, reasonably-sized components — a different axis of concern, not a regression of the original size/cohesion fix |
| ARCH-004 (P4, scope-corrected dead-code removal) | CLOSED | **CLOSED AND STILL VALID** — unrelated to any new finding, no regression |

No historical registry file was modified. The independent score above was fixed before this section was read, per the audit's anti-anchoring rule.

## Final validation

- `git diff -- src`: empty
- `git diff -- tests`: empty
- `git status --short`: only pre-existing untracked/modified audit-artifact and asset files (no application source or test changes)
