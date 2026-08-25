# 10 — Action Plan (REAUDIT)

All P1/P2/P4 actions from `RUN-001-BASELINE` are closed. Two items remain genuinely open; two are deliberately accepted risks requiring no further action unless circumstances change.

## Remaining open work

### ACT-DATA-001-VERIFY (continuation of ACT-DATA-001)
- Priority: P1 · Source finding: DATA-001 · Effort: XS (test only, no code change expected)
- Goal: Perform the real two-device signed-in verification the original finding's acceptance criteria calls for.
- Scope: manual test only — sign in to the same account on two devices/emulators, make progress on one, open the other, confirm merged progress appears and is not reverted by the second device's own cold-start `init()`.
- Verification: the scenario itself IS the verification; no further code change anticipated unless the test reveals the fix was incomplete.
- Note: this requires a second authenticated session/device, which was not available within this audit's environment — flagged for the account owner or a future session with that capability.

### ACT-ACC-001-CONTINUE (continuation of ACT-ACC-001)
- Priority: P3 · Source finding: ACC-001 · Effort: M
- Goal: Close the remaining scope of the accessibility DoD: TalkBack-test onboarding and the Level Promotion celebration modal (both need staged state not reachable in a normal session), run Accessibility Scanner, audit `reduceMotion` coverage against Sprint 3-5 components.
- Scope: manual verification work; code fixes only as issues are found, matching the discipline already demonstrated in `FIX-2026-08-25-07`.
- Note: item 9.5 of the original doc (CI accessibility check) is now structurally N/A since CI was removed — do not attempt to re-add it without first reversing `DEPLOY-001`'s accepted risk.

## Accepted risks (no action planned; re-review triggers only)

### DEPLOY-001 — No CI
- Re-review trigger: the account owner raises the GitHub Actions spending limit, or the repository is made public (free unlimited Actions minutes), or the team grows beyond a size where manual pre-commit discipline reliably scales.
- Until then: continue the manual verification pattern already in consistent use (`tsc` → `npm test` → local release build → on-device smoke check) before every commit — this is not optional given CI's absence, it is now the *only* gate.

### DEP-001 — 17 moderate npm audit findings (build-time tooling only)
- Re-review trigger: a `firebase-tools`/`expo`/`@expo/config-plugins` major-version upgrade (routine dependency maintenance) would likely resolve these as a side effect — no urgency to force it standalone.
