# 07 — Detailed Audit (REAUDIT)

Revision evaluated: `29ce04e` (main, `HEAD`), reaudited against `RUN-002-REAUDIT`'s revision `3436a1b`. Evidence IDs prefixed `E3-` are new this run; unprefixed/`E2-` IDs reference prior evidence indices where still valid.

Domains not discussed in a dedicated section below (Core product correctness, Data integrity & persistence, Privacy, Architecture & maintainability, UX/usability, Accessibility) had **zero code changes touch their surface** in this delta (`git diff --stat 3436a1b..29ce04e` confirms only `.audit/`, `.github/workflows/ci.yml`, `.maestro/smoke.yaml`, `android/gradlew` (mode bit only), `src/app/AppBootstrap.tsx`, and `src/services/catalogueService.ts` changed) and are carried forward unchanged from `RUN-002-REAUDIT/07_DETAILED_AUDIT.md`, per `14_REAUDIT_PROTOCOL.md`'s "avoid unnecessary full-repository re-reading if unchanged high-confidence evidence remains valid." Their fresh-evidence re-confirmation this pass is limited to the global gates (`tsc`, `npm test` — both clean, 300/300, matching prior counts exactly, so no silent regression in any of these domains either).

---

## Core product correctness — 9.0/10 (unchanged) · Confidence: HIGH

No change. 300/300 tests re-confirmed passing fresh this pass on current `HEAD`.

---

## Data integrity & persistence — 7.8/10 (unchanged) · Confidence: MEDIUM-HIGH

No change. `DATA-001` remains `PARTIAL` — untouched by this delta, real two-device test still not performed.

---

## Reliability & lifecycle management — 8.5/10 (was 7.8) · Confidence: HIGH (was MEDIUM-HIGH)

**Genuine improvement.** Two real, previously-unbounded network waits are now bounded with sensible fallback behavior:
- `src/services/catalogueService.ts` (E3-REL-01): an 8-second timeout now races both Firestore catalogue calls, engaging the existing cache → bundled-content fallback promptly instead of the app hanging indefinitely on bad network.
- `src/app/AppBootstrap.tsx` (E3-REL-02): an 8-second fallback now resolves `authUser` to guest/signed-out if Firebase Auth's initial handshake never completes, instead of blocking the entire app on "Bağlantı hazırlanıyor..." forever.

Both were discovered as a side effect of CI debugging (a CI emulator's degraded network path made the pre-existing bug reproducible), not from a dedicated reliability review — but the fix is real product code, addresses a real user-facing failure mode (any learner on a bad connection could previously get stuck indefinitely with no way forward), and is indirectly re-confirmed working by `e2e-smoke`'s now-consistent CI pass (the same flow that used to hang past 150+ seconds now completes reliably). Confidence raised to HIGH because this is now proven under a real degraded-network condition (a CI emulator with genuinely slow/unreliable connectivity), not merely a happy-path local test. Score held below 9 because this remains two isolated fixes rather than a systematic audit of every unbounded async call in the codebase — other similar gaps may exist elsewhere and were not searched for exhaustively this pass.

---

## Testing & verification — 8.0/10 (was 6.5) · Confidence: HIGH

**The second-largest domain movement this reaudit, and a direct reversal of RUN-002-REAUDIT's correction.** `RUN-002-REAUDIT` scored this down specifically because the rubric's own subcriterion "CI actually gates merges" was unambiguously unmet (CI had been fully removed). That subcriterion is now genuinely met in substance: `.github/workflows/ci.yml`'s `verify` job runs `tsc --noEmit`, the full 300-assertion domain test suite, and the Firestore rules test suite (with correct JDK 21 setup) on every push — confirmed green on the current `HEAD` (E3-DEPLOY-01/02). `android-build` and `e2e-smoke` extend coverage further than baseline's test suite ever reached on its own: a real release-build compile check and a real on-device guest-onboarding-to-home-screen UI flow, both currently green.

Not scored a full 9-10 for one disclosed reason: **no branch protection exists on `main`** (E3-DEPLOY-02 note, confirmed via `gh api .../branches/main/protection` → 404). CI is a fast, visible signal (a bad push shows red within ~10 minutes) but is not a technically enforced gate — nothing stops a commit with a failing check from staying on `main`. Given this project's actual workflow (a solo developer pushing directly to `main`, no PRs observed in history), the practical risk this represents is limited, but the audit scores what exists, not what the workflow pattern makes convenient to skip.

---

## Security (auth + Firestore rules) — 8.6/10 (unchanged) · Confidence: HIGH

No code change to `firestore.rules` or auth logic this cycle. Re-examined specifically for the repo's new public-visibility risk (E3-SEC-01 through 04): no committed secrets found, `.env` correctly gitignored, the only Firebase identifiers now more broadly reachable are non-sensitive Web SDK client config (by design, per this project's own already-closed `SEC-002` finding) stored as Actions *repository variables*, not secrets, and not visible to unauthenticated public visitors. One new, low-severity, purely additive observation: GitHub's free secret-scanning/push-protection features are disabled on the now-public repo — recorded as a new finding (`SEC-003`, P4) below, not folded into this score as a deduction, since no actual secret exposure was found (Constitution C14: secret values are never required to prove secret management exists — an absent-but-currently-unneeded scanner is a hardening opportunity, not evidence of a live problem).

---

## Privacy — 7.5/10 (unchanged) · Confidence: MEDIUM

No change.

---

## Architecture & maintainability — 8.5/10 (unchanged) · Confidence: HIGH

No change. The two source-file edits this cycle (`catalogueService.ts`, `AppBootstrap.tsx`) are narrowly scoped, additive timeout/fallback logic — re-read directly and confirmed not to introduce new layering violations, oversized files, or duplicated logic.

---

## UX/usability — 8.0/10 (unchanged) · Confidence: HIGH

No change. The two reliability fixes are UX-adjacent (they prevent an indefinite stuck-loading-screen state) but were not independently re-verified via a fresh on-device UX walkthrough this pass — captured instead under Reliability, where the direct evidence lives.

---

## Accessibility — 7.5/10 (unchanged) · Confidence: MEDIUM-HIGH

No change. `ACC-001` remains `PARTIAL` — untouched by this delta.

---

## Deployment/release engineering — 8.5/10 (was 5.5) · Confidence: HIGH

**The largest single-domain movement this reaudit — a direct reversal of RUN-002-REAUDIT's one disclosed regression.** CI is restored and, more importantly, **proven** rather than merely present: the current `HEAD` commit has a fully green run covering typecheck, the domain test suite, the Firestore rules suite, a real release-build compile, and a real on-device end-to-end UI smoke test — a materially more thorough gate than either baseline run ever had confirmed working live (baseline's CI was assumed functional but, per `RUN-002-REAUDIT`'s own investigation, had in fact never once passed, going back to before the baseline audit itself).

Not scored 9+ for two disclosed, concrete reasons, not vague caution:
1. No branch protection on `main` (same finding as Testing & verification above — CI is visible, not enforced).
2. The release APK is still signed with the debug keystore (`android/app/build.gradle`'s own comment: "Caution! In production, you need to generate your own keystore file") — a pre-existing condition carried forward from both prior runs, directly relevant to actual Play Store submission readiness, not newly discovered but still unresolved.

---

## Dependency/supply-chain health — 7.5/10 (unchanged) · Confidence: HIGH

No dependency changes in this delta (`git diff --stat` shows no `package.json`/`package-lock.json` changes). `DEP-001`'s prior triage remains valid and was not re-run this pass (no new dependency activity to re-triage).
