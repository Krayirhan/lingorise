# ACCESSIBILITY-001-BASELINE — DEEP MOBILE ACCESSIBILITY AUDIT

Revision: `16b9aab1f776503ec52067d4f543af8ab6f2e9aa` (== origin/main at audit time)

## Accessibility: 86/100

Confidence: MEDIUM

Runtime accessibility evidence: **LIMITED** — no TalkBack/accessibility-tree runtime session was performed this pass. Enabling a device-level accessibility service on the available emulator would require a global device-setting change, which this audit's own instructions caution against doing irreversibly; "do not install new accessibility tooling" also applies. All findings are E2 static-certain evidence (source directly establishes the behavior), independently re-verified by a reviewer, not E3/E4 runtime-observed. Per this audit's own fairness rule, this limits CONFIDENCE, not the score itself.

TalkBack/runtime used: **NO**

Derived independently from direct source inspection. No expected score and no other domain's findings were consulted before this score was drafted.

## Scorecard (score-loss ledger)

| Dimension | Max | Score | Lost | Root cause | Evidence | Confidence |
|---|---|---|---|---|---|---|
| Screen-reader semantics | 25 | 24 | 1 | No demonstrated defect in any component inspected; light token for incomplete coverage of remaining screens | E1 (unchecked remainder) / E2 (checked areas, extensive) | HIGH |
| Practice / exam interaction accessibility | 20 | 15 | 5 | A11Y-QA-001's primary weight — the app's most important interactive-journey content resists font-scaling accommodation | E2 | HIGH |
| Touch targets / motor accessibility | 15 | 11 | 4 | A11Y-QA-002 | E2 | HIGH |
| Text scaling / layout resilience | 15 | 13 | 2 | Light cross-reference to A11Y-QA-001's general font-scaling-mechanism angle only (a speculative token deduction for unreviewed `numberOfLines` usages elsewhere was removed by independent review as unevidenced) | E2 | HIGH |
| Color / contrast / non-color cues | 10 | 8 | 2 | A11Y-QA-003 | E2 (independently recomputed contrast ratio, confirmed) | HIGH |
| Focus / modal / dynamic-state handling | 10 | 10 | 0 | No defect found — strong native `Modal`/`accessibilityViewIsModal`/live-region semantics; runtime TalkBack focus-jump behavior not verified but UNKNOWN ≠ FAIL | E2 (semantics) / NOT VERIFIED (runtime focus behavior) | MEDIUM |
| Motion / miscellaneous accessibility | 5 | 5 | 0 | No defect — `reduceMotion` threaded consistently across every animated component sampled, no counterexample found | E2 | HIGH |
| **TOTAL** | **100** | **86** | **14** | | | |

## Findings

| ID | Title | Severity | Evidence | Status |
|---|---|---|---|---|
| A11Y-QA-001 | `WordPrompt.tsx`'s practice/exam word-prompt text (`numberOfLines={1}` + `adjustsFontSizeToFit`, fed a fixed `dynamicFontSize={28}` from `PracticeScreen.tsx` with no font-scale-aware calculation) shrinks instead of wrapping/growing at increased system font-scale — actively working against a low-vision user's own accessibility preference on the single most important text of the app's core interaction loop, on every single practice/exam question. Independent review confirmed this is unmitigated (no compensating mechanism exists) and suggested this sits close to the P1 boundary given its centrality to the core loop, though P2 was confirmed as reasonable | P2 | HIGH — independently confirmed via direct source read (`WordPrompt.tsx:69`, `PracticeScreen.tsx:178`) | OPEN |
| A11Y-QA-002 | Two secondary interactive controls on the Practice screen have touch targets well below Android's 48dp / Apple's 44pt guidance, with no `hitSlop` compensation: `WordPrompt.tsx`'s hint-toggle button (~17-19dp tappable height) and `PracticeScreen.tsx`'s "remind later" bookmark button (~34-36dp). By contrast, `PrimaryButton` (52dp), `AnswerOption` (54dp), and the same screen's own `audioBtn` (44dp) are all properly sized — confirmed this is an isolated inconsistency in two specific secondary controls, not a systemic failure | P3 | HIGH — independently re-verified via direct style-value inspection | OPEN |
| A11Y-QA-003 | The `muted` secondary-text color (`#7A7672`) on the app's `canvas` background (`#F7F4EC`) computes to a WCAG contrast ratio of **4.10:1** (independently recomputed and confirmed via the relative-luminance formula) — above the 3:1 threshold for large text, but below the 4.5:1 threshold required for normal/small text under WCAG AA. Independent review additionally confirmed `muted` is used pervasively for genuinely small body text (9.5-14pt: hint labels, phonetic text, instruction text, meta/subtitle text, `ErrorBoundary` text) across many screens, not just large headings — making this a modest but real and widespread, not merely theoretical, shortfall | P3 | HIGH — independently recomputed and confirmed | OPEN |

Findings were not padded to fill severity quotas — this is the complete set found with real, distinct evidence at this depth.

## Independent review

**`code-reviewer` — ADJUST.** Independently re-verified all three findings via direct source reading and its own WCAG contrast recalculation (confirming 4.10:1 exactly), and confirmed no missing-label over-reporting, no visual-only assumptions, no unevidenced font-scaling claims, no touch-target measurement errors, and no color-only-state overstatement (the answer-option state-communication mechanism was independently spot-checked and found sound). Found the ledger's methodology (UNKNOWN ≠ FAIL applied correctly to the Focus/modal dimension; A11Y-QA-001's split across two dimensions defensible given the genuinely distinct "this specific critical interaction" vs. "the general font-scaling mechanism" framings) sound, with one correction: an initial -1 token deduction in Text scaling/layout resilience for "5 other unreviewed `numberOfLines` usages" was flagged as speculative/unevidenced (those usages were never actually inspected) and removed, moving the total from a draft 85 to the reconciled **86/100**.

## Strongest area

Screen-reader semantics: every interactive component sampled — including the single most consequential case, the practice/exam answer option — correctly exposes selected/correct/incorrect/revealed state through its accessible NAME itself (not merely color or an icon a screen reader can't perceive), alongside proper roles (`radio`/`button`/`tab`/`alert`) and states (`disabled`/`selected`/`busy`) everywhere checked. Authentication inputs use real labels, not placeholder-only labeling. This is a genuinely well-built, accessibility-conscious implementation, well above a typical baseline.

## Weakest area

Practice/exam interaction accessibility, driven by A11Y-QA-001: the app's single highest-priority journey's most important text actively resists the exact system-level accommodation (increased font size) that the audience most likely to need it would use.

## Historical reconciliation (performed last, against `.audit/state/FINDING_REGISTRY.md`, read-only)

| Historical ID | Historical status | Reconciliation this pass |
|---|---|---|
| ACC-002 (P4, hint button malformed accessibility label ", İpucu") | CLOSED | **CLOSED AND STILL VALID** — the hint button's label now reads correctly ("İpucu"/"İpucu açık", confirmed clean). A11Y-QA-002 (this pass) found a *different* issue on the *same component* — touch target size, not label content — a new, distinct finding, not a regression of ACC-002 |
| ACC-003 (P3, audio/pronunciation button had zero accessible name) | CLOSED | **CLOSED AND STILL VALID** — `audioBtn` now has a proper state-aware `accessibilityLabel` ("Telaffuzu dinle"/"Seslendiriliyor..."), confirmed present. No regression |
| ACC-004 (P3, mascot speech bubble breaks word mid-character at 2.0x font scale) | CLOSED | **CLOSED AND STILL VALID** — that fix (a different component, a different failure mode) was not re-examined and shows no evidence of regression. A11Y-QA-001 (this pass) is thematically related (font-scaling) but affects a *different* component (`WordPrompt`'s main word text, not the mascot speech bubble) with a *different* failure mode (font-shrinking via `adjustsFontSizeToFit`, not mid-character line-breaking) — a new discovery, not a rediscovery |

No historical registry file was modified. The independent score above was fixed before this section was read, per the audit's anti-anchoring rule.

## Final validation

- `git diff -- src`: empty
- `git diff -- tests`: empty
- `git status --short`: only pre-existing untracked/modified audit-artifact and asset files (no application source or test changes)
