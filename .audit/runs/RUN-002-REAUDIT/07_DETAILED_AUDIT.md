# 07 — Detailed Audit (REAUDIT)

Revision evaluated: `3436a1b` (main), reaudited against baseline revision `4a80283`. Evidence IDs prefixed `E2-` are new this run; unprefixed IDs reference `RUN-001-BASELINE/06_EVIDENCE_INDEX.md` where still valid.

---

## Core product correctness — 9.0/10 (was 7.5) · Confidence: HIGH

All three named weaknesses from the baseline are closed with direct evidence:
- **`CORE-001`** (streak reset on backward clock) — fixed, 2 new tests (E2-CORE-01, E2-CORE-02).
- **`CORE-002`** (untested XP/difficulty formulas) — 9 new direct tests covering base values, the long-word nudge, and the difficulty cap.
- **`CORE-003`** (untested `archiveDailyQuests`/`bringForward`) — 6 new direct tests covering completion filtering, closing-date stamping, and the "never pushes later" invariant.

300/300 assertions pass. No new correctness gaps were identified this pass. Score is not a full 10 only because this remains a source/test-based verification (no production usage data exists to corroborate against real-world behavior) — the rubric's own anchor for 9-10 requires "excellent evidence... little meaningful improvement remains," and a small amount of untested surface (e.g., edge cases in `pickNewWords`'s interaction with very small content pools) plausibly still exists but was not specifically probed this pass.

---

## Data integrity & persistence — 7.8/10 (was 6.8) · Confidence: MEDIUM-HIGH

- **`DATA-002`** (silent save failure) — closed: `saveUserData` now returns success/failure, surfaced to the user after 2 consecutive failures via the existing toast mechanism (E2-DATA-02).
- **`DATA-001`** (cold-start race) — structurally addressed, not fully closed: `useUserProgress.init()` now skips its own local-only save when a user is already signed in, converting the race into a deterministic ordering (reasoned through explicitly in `FIX-2026-08-25-01`). This is real, verified-by-inspection progress (E2-DATA-01), but the finding's own acceptance criteria specifically requires a real two-device signed-in test, which was not performed — status remains `PARTIAL` in the finding registry, and the score reflects meaningful-but-incomplete closure rather than full resolution.

---

## Reliability & lifecycle management — 7.8/10 (was 7.0) · Confidence: MEDIUM-HIGH

**`REL-001`** (refresh()'s Firestore call missing try/catch) closed — now wrapped consistently with the rest of the file. The two other baseline observations (ErrorBoundary not wrapping AuthScreen/loading states; `resetUserData`'s bare `catch {}`) were noted but never formally registered as findings and remain as-is — not scored down further since they were never counted against the baseline score either (avoiding an unjustified penalty for something not previously deducted).

---

## Testing & verification — 6.5/10 (was 7.0) · Confidence: HIGH

**This is a corrected score, not a regression in test quality.** The test suite itself is objectively stronger (300 vs. 283 assertions, three previously-named coverage gaps closed). However, `RUN-001-BASELINE`'s evidence `E-TEST-01` credited this domain partly for "CI runs... automated, not manual-only" — investigation this session (`gh run list`) revealed that claim was never actually true in practice (every CI run had failed identically since before the baseline audit, for an unrelated billing reason) and CI has now been formally removed entirely. Per Constitution C4 ("no score may rely solely on... impression") and the Evidence Policy's "no fabricated execution" rule, this domain must be scored against what actually exists now: a strong, well-written test suite with **zero automated enforcement** — every future change depends entirely on a human remembering to run `npm test`/`tsc` before committing. The rubric's own subcriterion "CI actually gates merges on the above" (see `04_CONTEXTUAL_RUBRIC.md`) is now unambiguously unmet. This is scored as a genuine, disclosed correction: the baseline's 7.0 was too generous given the (unknown-at-the-time) reality; 6.5 reflects strong test content held back by confirmed zero automated gating.

---

## Security (auth + Firestore rules) — 8.6/10 (was 8.3) · Confidence: HIGH

**`SEC-002`** (real Firebase identifiers in `.env.example`) closed — replaced with clear placeholders. `firestore.rules` unchanged and re-confirmed correct (no edits made to it this session, per the deliberate scope-reduction decision in `ARCH-004`). No new security findings surfaced.

---

## Privacy — 7.5/10 (unchanged) · Confidence: MEDIUM

No privacy-domain findings existed to close this session (the one privacy-adjacent claim, orphaned `dailyTasks` data, was already corrected to a non-issue in the baseline pass itself — see `ARCH-004`). No new privacy-relevant changes were made.

---

## Architecture & maintainability — 8.5/10 (was 6.5) · Confidence: HIGH

The largest single-domain improvement this reaudit:
- **`ARCH-001`** — the genuinely dead `src/i18n/formatters.ts` removed; the baseline's broader claim about `src/services/spacedRepetition.ts` being dead was investigated further and **corrected** (it's a live, intentional re-export used by the test suite) — a case of this audit process correcting its own earlier evidence gap rather than compounding it.
- **`ARCH-002`** — both layering inversions fixed (domain module now imports from domain, not a services barrel; state hook now imports a type from its true domain home, not a feature-level hook).
- **`ARCH-003`** — the two oversized, multi-responsibility files (`AuthScreen.tsx`, `AccountManagementCard.tsx`) reduced by ~50% each via extraction into single-responsibility sub-components, with real duplicated markup (avatar picker, name-edit row) eliminated, not just moved. Verified behaviorally identical via on-device screenshot comparison.
- **`ARCH-004`** — genuinely dead `getDailyTaskCollection` removed; the corresponding Firestore rule was deliberately *not* touched after discovering it has real test coverage (a disclosed scope correction, not an oversight).

Score held below 9+ only because this reflects one focused session of fixes rather than a sustained pattern proven over many changes — the rubric's 9-10 anchor implies durable, demonstrated practice, not a single strong pass.

---

## UX/usability — 8.0/10 (was 7.5) · Confidence: HIGH (was MEDIUM)

No new UX-specific findings, but confidence is raised to HIGH: this session's repeated on-device walkthroughs (auth screens, account management, level switcher, quest history, multiple practice sessions across several rebuilds) constitute a substantially broader manual verification pass than the baseline's single walkthrough, all without surfacing new UX defects — a positive signal in itself, scored via increased confidence rather than a score jump not backed by new evidence.

---

## Accessibility — 7.5/10 (was 6.0) · Confidence: MEDIUM-HIGH (was MEDIUM)

A substantial, evidence-backed improvement: this is the one domain where the baseline explicitly declined to credit "TalkBack works" because it had never actually been tested. It has now genuinely been tested — with a real accessibility service, real tree inspection, and **three real, previously-unknown defects found and fixed** (a malformed label, a completely unlabeled control, and a word-breaking dynamic-type bug), each verified closed via before/after evidence. This is exactly the kind of concrete verification the Evidence Policy rewards over a code-review-only pass. Score does not reach 8+ because coverage remains partial by the doc's own accounting: onboarding, the Level Promotion modal, Accessibility Scanner, and `reduceMotion` audit are still untested — disclosed explicitly in `docs/roadmap/09-accessibility.md` rather than implied as complete.

---

## Deployment/release engineering — 5.5/10 (was 7.0) · Confidence: HIGH

**The one genuine, deliberate regression this reaudit.** The release build itself is more thoroughly proven than ever (rebuilt and verified successfully 6 times across this session's FIX passes, vs. once at baseline) — but the domain's own subcriterion "CI gates the branch that will be released" is now unambiguously false: there is no CI at all. This was a conscious, disclosed, cost-driven decision by the account owner (`DEPLOY-001`, status `ACCEPTED_RISK`), not an accident — but the audit scores the actual current state, not the intent behind it. A public-release-target product with zero automated gating and reliance entirely on manual developer discipline is a real, material weakness relative to the baseline's (mistaken) assumption of working CI, independent of why it happened.

---

## Dependency/supply-chain health — 7.5/10 (was 6.5) · Confidence: HIGH (was LOW-MEDIUM)

**`DEP-001`** closed: `npm audit` was executed (previously an open evidence gap), returning 17 moderate/0 high/0 critical findings, every one traced to build-time-only tooling with no path into the shipped app. This converts what was previously an unknown into a concretely triaged, low-risk, well-understood position — a genuine confidence and score improvement, not merely "we now have a number."
