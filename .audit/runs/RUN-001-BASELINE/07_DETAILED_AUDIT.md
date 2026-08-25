# 07 — Detailed Audit

Revision evaluated: `4a80283` (main). All scores use the locked rubric in `04_CONTEXTUAL_RUBRIC.md`. Evidence IDs reference `06_EVIDENCE_INDEX.md`.

---

## Core product correctness — 7.5/10 (Confidence: HIGH)

**Strengths.** The SRS/mastery/gamification core is unusually well-verified for a project this size: 283 executable assertions (E-CORE-01) directly test interval math (fixed 1-day/3-day steps, ease-based growth, ±5% jitter with injectable RNG, bounds), leech detection (all 9 steps from 1→9 consecutive wrong plus reset-on-correct), difficulty-ordered new-word selection (both monotonic ordering and within-group shuffle variance), and the review-debt taper at three concrete points (10/30/40 due items). This is genuine behavior verification, not incidental coverage. `applyPracticeAnswer` — the single function every XP/streak/mastery update flows through — has 26 direct test references.

**Weaknesses.**
- **`CORE-001` (verified, E-CORE-02):** `updateDailyStreak` (`streak.ts:32-48`) only handles `diffDays === 1` as "new day, streak+1." Any other value — including 0 or negative from a device clock correction (NTP resync, timezone change, manual clock fix moving the date backward) — falls into the same catch-all branch as "many days missed," resetting the streak to 1. This directly contradicts the product's own explicit user promise ("streak accurately reflects consecutive days"). Realistic trigger: ordinary clock drift correction, not device tampering.
- **`CORE-002` (verified, E-CORE-03):** `computeXpReward`/`computeDifficulty` (`content/questions/difficulty.ts`) bake XP/difficulty values onto ~590 static questions at load time and feed directly into both the reward economy and the new-word ordering (`pickNewWords`) — with zero test coverage. `applyPracticeAnswer` trusts whatever `xpReward` it's handed; nothing would catch a formula regression here.
- **`CORE-003` (E3_STATIC):** `archiveDailyQuests` (daily-quest expiry/reset) and `bringForward` (manual SRS reschedule, used by the bookmark/"remind me later" feature) have zero test references despite mutating persisted user state.

**Rationale for 7.5:** the tested core (the majority of the SRS/mastery surface) is strong evidence of correctness; the deduction reflects one verified, real, user-facing logic bug (`CORE-001`) plus a genuine untested-but-load-bearing surface (`CORE-002`), not a hypothetical concern.

---

## Data integrity & persistence — 6.8/10 (Confidence: MEDIUM-HIGH)

**Strengths.** `loadUserData` fails safe: malformed/corrupted JSON falls back to `DEFAULT_USER_DATA` with a warning rather than crashing on boot (E-DATA-01). The local-first write-before-sync ordering is consistently applied across every mutation path — AsyncStorage is written before any Firestore call is attempted, so a network failure during sync never corrupts the authoritative local copy. The cross-device merge (`mergeAndSyncUserData`) uses `Math.max` for monotonic counters (XP, streak) and item-level merge for `learningProgress`, which is an appropriate strategy for this product's actual concurrency needs (single user, multiple devices, no real-time collaboration — see Non-goals in `02_PROJECT_PURPOSE.md`).

**Weaknesses.**
- **`DATA-001` (E-DATA-02, MEDIUM confidence — reasoned interleaving, not reproduced under load):** `AppBootstrap.tsx`'s `onAuthStateChanged` handler and `useUserProgress`'s own `init()` effect both independently read-modify-write local storage on cold start with no shared sequencing. A plausible interleaving lets `init()`'s plain (non-merge) overwrite land after the auth handler's already-merged write, silently discarding remote-only progress until the next sign-in cycle. This is the most consequential unresolved finding in the audit given `01`'s "progress is never lost" promise.
- **`DATA-002` (E-DATA-01):** `saveUserData` swallows persistent write failures with only a console warning — no retry, no user-facing signal, no in-memory flag. A sustained failure (e.g., device storage full) would let the user believe progress is saved when it silently is not.
- Corrected finding: an initial sub-agent pass flagged `deleteUserData` for not purging `users/{uid}/dailyTasks` as a privacy gap. Direct verification (E-DATA-04) shows `getDailyTaskCollection` has zero callers anywhere — no data is ever written there, so nothing is orphaned. Reclassified as `ARCH-004` (dead code), not a data-integrity or privacy finding.

**Rationale for 6.8:** the architecture's fundamental strategy (local-authoritative, fail-safe reads, sensible merge) is sound and well above the R3 bar; the score is capped below 8 by one credible, unverified-in-production race (`DATA-001`) that directly threatens the product's core promise, plus a silent-failure gap (`DATA-002`).

---

## Reliability & lifecycle management — 7.0/10 (Confidence: MEDIUM-HIGH)

**Strengths.** A top-level `ErrorBoundary` wraps the main app surface (E-REL-01) — a render-time exception during practice shows a recoverable restart screen, not a crash. Async sync calls are fire-and-forget with `.catch` at nearly every call site, correctly non-blocking. `bringForward`/migration logic is defensive and idempotent by design (`normalizeUserData`).

**Weaknesses.**
- `ErrorBoundary` does not wrap the `AuthScreen` or loading-state branches (E-REL-01) — a crash during sign-in/loading would still be uncaught.
- **`REL-001` (E-REL-02):** `refresh()`'s final `Promise.all([syncUserData, syncUserProgress])` has no try/catch, inconsistent with every other Firestore call site in the same file — a network failure during manual pull-to-refresh can propagate an uncaught rejection.
- Minor: `resetUserData` in `storage.ts` uses a bare empty `catch {}` (no warn), inconsistent with the rest of the file's pattern.

**Rationale for 7.0:** core crash resilience is real and verified (ErrorBoundary + fail-safe storage reads), but coverage has two identified gaps (auth-screen crashes, one inconsistent catch pattern) that are straightforward to close and don't yet fully match the file's own established defensive style.

---

## Testing & verification — 7.0/10 (Confidence: HIGH)

**Strengths.** 283/283 assertions pass on a fresh execution this run (E-CORE-01). `tests/firestoreRules.test.ts` asserts genuine ALLOW *and* DENY cases for cross-user access (not just the happy path). CI (E-TEST-01) runs typecheck + test + rules-test automatically on every PR and push to `main` — verification is not manual-only.

**Weaknesses.**
- Zero component/UI-level test coverage (E-TEST-02) — no Jest/RTL/Detox. Proportionate for a small consumer app's screens in general, but combined with the untested content-generation functions (`CORE-002`) and untested state-mutating functions (`CORE-003`), the *combination* of gaps is what matters here, not either alone.
- The one real end-to-end check (Maestro smoke test) is not wired into CI (E-TEST-01) — it only verifies onboarding→practice-entry, not the full answer→reward loop, and even that partial check has no automated gate.
- No coverage-instrumented test runner exists, so "how much of `domain/`" is genuinely tested is a source-read estimate (E-CORE-01/03), not a measured percentage.

**Rationale for 7.0:** the testing discipline that exists is unusually rigorous for the areas it covers (assertion-dense, both-direction rules testing, real CI gating) — this is not a project with weak testing culture. The score reflects specific, named coverage gaps in load-bearing logic rather than a generic "needs more tests" complaint (per Constitution C6/C19 — no deduction for the *absence* of a testing framework itself, only for the *specific* untested surfaces identified).

---

## Security (auth + Firestore rules) — 8.3/10 (Confidence: HIGH)

**Strengths.** `firestore.rules` (E-DATA-03) is textbook-correct for this data model: every user-owned collection requires `request.auth.uid == userId`; public catalogue collections are read-only with `write: false`; no overly permissive rule was found anywhere in the file. Authentication uses standard Firebase SDK calls with no custom crypto, no hardcoded credentials, and no PII/token logging found in a targeted scan (E-SEC-01). Notification permission requests are scoped to exactly the local-reminder use case, nothing broader.

**Weaknesses.**
- **`SEC-002` (E-SEC-02, low severity):** `.env.example` (already public via git history) contains real production Firebase client-config identifiers rather than placeholder values. Firebase Web API keys are not secret-by-design — security is enforced by `firestore.rules`, verified above, not key secrecy — so this is a hygiene recommendation, not a vulnerability.
- No dependency vulnerability scan (`npm audit`) was executed this run (see `05_TOOL_AND_GRAPH_ANALYSIS.md`), so known-CVE exposure in the Firebase/Expo dependency tree is an open evidence gap, scored conservatively rather than assumed clean.

**Rationale for 8.3:** the one real authorization boundary this app has is implemented correctly and verified by direct rule inspection, which is the highest-value security fact for this product. The score is not a perfect 9-10 because of the unexecuted dependency scan and the .env.example hygiene note, both real but low-severity gaps.

---

## Privacy — 7.5/10 (Confidence: MEDIUM — see evidence limitation)

**Strengths.** Account deletion (`deleteUserData`) correctly batch-purges every Firestore location that is actually written to (`items` subcollection at up to 590 docs, `progress/main`, the root user doc) — verified complete against real write paths, not just against what the rules file declares (E-DATA-04). Telemetry is 100% local, never transmitted, and contains no PII (E-SEC-01). This already reflects a prior self-correction in the codebase's own history (a comment at `firestore.ts:84-88` documents an earlier orphaned-`items` bug that was found and fixed) — evidence of an iterating, self-auditing team culture on this exact concern.

**Weaknesses.**
- The account-deletion completeness claim is verified against *current* write paths only; if a future feature starts writing to a new Firestore subcollection, nothing in the codebase enforces that `deleteUserData` gets updated in lockstep (no test asserts "every collection referenced elsewhere is also purged here").

**Rationale for 7.5:** the concrete deletion-completeness check is a real strength and directly rebuts an initial (incorrect) sub-agent claim of a privacy gap — but the score stops short of 9+ because there's no structural guard against the *next* similar gap recurring, only a one-time manual verification.

---

## Architecture & maintainability — 6.5/10 (Confidence: HIGH)

**Strengths.** `domain/*` is genuinely free of upward imports into `screens/`/`state/`/`features/` (grep-verified across the whole tree) — the intended layering holds for the most safety-critical logic. No import cycles were found between `domain/`, `state/`, and `content/`. Core domain files (`spacedRepetition.ts`, `mastery.ts`) are pure, injectable (`now`/`random` parameters), and well-commented on *why*, not *what* — genuinely high-quality code, not merely code that happens to pass tests.

**Weaknesses.**
- **`ARCH-001` (E-ARCH-01, E-ARCH-02):** two fully dead files — `src/services/spacedRepetition.ts` (a stale full copy of the domain SRS logic) and `src/i18n/formatters.ts` (a stale duplicate of `utils/formatters.ts`) — have zero live importers. Not a live drift-risk (nothing executes them), but a real landmine for a future contributor who edits the wrong copy by mistake.
- **`ARCH-002` (E3_STATIC, sub-agent-reported, not independently re-verified line-by-line this pass):** one domain file imports from a services barrel instead of the domain module directly (`domain/practice/answer.ts` → `services/gamification` re-export), and one state hook imports a type from a feature-level hook (`useUserProgress.ts` → `features/practice/hooks/usePracticeSession.ts`) — both one-directional inversions of the intended dependency direction, not full cycles.
- **`ARCH-003` (E-ARCH-03):** `AuthScreen.tsx` (662 lines: login+register+reset+guest-mode+~230 lines of inline styles in one component) and `AccountManagementCard.tsx` (594 lines) mix multiple independent responsibilities in a single file each, increasing the chance that a change to one flow (e.g., register) risks unintended interaction with shared state used by another (e.g., login).

**Rationale for 6.5:** the most safety-critical layer (domain logic) is clean and well-isolated, which matters more for this product than screen-level file size — but two confirmed dead files and two large multi-responsibility screens are real, fixable maintainability costs that keep this below "strong" (8+).

---

## UX/usability — 7.5/10 (Confidence: MEDIUM — manual spot-check, not full flow audit)

**Strengths.** The on-device walkthrough performed this session (E-DEPLOY-01) showed a clear, responsive core loop: home → "Bugün başla" → question → wrong-answer feedback with the correct answer and an example sentence → next question, with no dead ends or confusing states encountered. The practice-mode wording pass already present on this branch (`headerTitle`, direction labels like "İngilizce → Türkçe") demonstrably improves clarity over the prior "Anlamı bul"/"Kelimeyi bul" labels, which were ambiguous about direction.

**Weaknesses.** Full-flow UX (onboarding edge cases, settings, profile, badge/celebration screens) was not manually walked in this pass — only the home→practice→answer path was directly observed. Scored with disclosed lower confidence rather than extrapolated to "excellent" from a partial walkthrough.

**Rationale for 7.5:** genuine positive on-device evidence for the core loop, appropriately not inflated to a higher score given the walkthrough's limited scope.

---

## Accessibility — 6.0/10 (Confidence: MEDIUM)

**Strengths.** Substantial implementation effort is present: 132 occurrences of `accessibilityLabel`/`accessibilityRole` across `src/**/*.tsx` (grep-verified), and a dedicated prior self-audit exists (`docs/roadmap/09-accessibility.md`) covering TalkBack flow, dynamic font size, contrast, and `reduceMotion` scope.

**Weaknesses.** That same document's own Definition-of-Done checklist (`09-accessibility.md:54-58`) shows **every item still unchecked** — TalkBack testing on 5 main flows, dynamic-font-max testing, an Accessibility Scanner pass, and expanded `reduceMotion` coverage are all documented as planned but not confirmed done. This is an honest, verifiable gap: real accessibility *code* exists broadly, but it has not been confirmed correct with an actual screen reader or scanner pass.

**Rationale for 6.0:** code-level intent is real and non-trivial (132 label/role sites is meaningfully more than a token gesture), but the score cannot credit "TalkBack works" or "dynamic type doesn't clip" as verified when the project's own audit trail explicitly says these checks haven't been run yet — per Evidence Policy, unverified claims get conservative, not full, credit.

---

## Deployment/release engineering — 7.0/10 (Confidence: HIGH)

**Strengths.** CI gates every PR/push-to-main with typecheck + test + rules-test (E-TEST-01) — a broken build or a regressed test cannot silently merge. `eas.json` defines distinct `preview`/`production` profiles. This session independently verified the release build path end-to-end: `gradlew assembleRelease` succeeds, the resulting APK installs and launches cleanly on a real emulator with no app-process crash (E-DEPLOY-01) — this is a genuinely executed, not assumed, release-readiness check.

**Weaknesses.** The one real end-to-end UI check (Maestro) is not part of CI (E-TEST-01) — a broken *runtime* flow (as opposed to a broken *build*) could merge to `main` undetected until manual testing. No automated release-build compile check exists in CI either (the release build was verified manually, this session, not by an automated gate) — a native-side breakage (e.g., a Gradle/manifest misconfiguration) would only surface at actual release-build time, not on every PR.

**Rationale for 7.0:** the release pipeline is real, was exercised successfully this run, and store-readiness documentation (data safety worksheet, launch checklist) shows deliberate release preparation — but CI coverage stops one layer short of the actual release artifact and the one true E2E flow check, both fixable, moderate-effort additions.

---

## Dependency/supply-chain health — 6.5/10 (Confidence: LOW-MEDIUM — vulnerability scan not executed)

**Strengths.** Core dependencies (React 19.2.3, React Native 0.85.3, Expo ~56, Firebase JS SDK ^12.18.0) are current-generation major versions, not legacy/abandoned releases (E-DEPS-01).

**Weaknesses.** No `npm audit` (or equivalent CVE scan) was executed this run — version recency is not the same as "no known vulnerabilities," and this domain is scored conservatively rather than assumed clean, per Evidence Policy §"Scoring under uncertainty."

**Rationale for 6.5:** genuinely current dependency versions earn real credit, but the score is deliberately capped below "strong" because the one check that would substantiate a higher score (a vulnerability scan) was not performed this run — this is an evidence gap, not a known defect.
