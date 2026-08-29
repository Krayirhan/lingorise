# ACCESSIBILITY-001-BASELINE — FINAL RESULT (CANONICAL)

**This is the canonical Accessibility score for future Master Consolidation, fix planning, and Accessibility reaudits.**

Revision: `16b9aab1f776503ec52067d4f543af8ab6f2e9aa`

## Accessibility: 86/100

Confidence: MEDIUM

Runtime accessibility evidence: **LIMITED**

TalkBack/runtime used: **NO**

| Severity | Count |
|---|---|
| P0 | 0 |
| P1 | 0 |
| P2 | 1 |
| P3 | 2 |
| P4 | 0 |

## Independent reviewer verdict

**`code-reviewer` — ADJUST — applied.** All three findings independently confirmed via direct source re-reading and an independent WCAG contrast recalculation (exactly matching the original 4.10:1 figure). No missing-label over-reporting, visual-only assumptions, unevidenced font-scaling claims, touch-target measurement errors, or color-only-state overstatement were found. One correction applied: a speculative -1 token deduction (for 5 unreviewed `numberOfLines` usages) was removed as unevidenced, moving the score from a draft 85 to the canonical 86/100.

## Canonical findings

| ID | Title | Severity |
|---|---|---|
| A11Y-QA-001 | Practice/exam word-prompt text shrinks instead of respecting increased system font-scale (`numberOfLines={1}` + `adjustsFontSizeToFit` fed a fixed font size), on the single most important text of the app's core interaction loop | P2 |
| A11Y-QA-002 | Two secondary Practice-screen controls (hint toggle ~18dp, "remind later" bookmark ~36dp) have touch targets well below Android/Apple guidance, unlike every primary control in the same screens | P3 |
| A11Y-QA-003 | Secondary/muted text color computes to 4.10:1 contrast on the app background — below WCAG AA's 4.5:1 for normal text, used pervasively across small body text | P3 |

## Strongest area

Screen-reader semantics — every interactive component sampled, including the practice/exam answer option, correctly exposes state through its accessible name itself, with proper roles/states throughout and real (non-placeholder) input labeling.

## Weakest area

Practice/exam interaction accessibility — the app's highest-priority journey's most important text actively resists the system-level font-scaling accommodation its likely audience would use.

## Known runtime limitations

No TalkBack/accessibility-tree runtime session was performed — enabling a device accessibility service would require a global device-setting change this audit's instructions caution against, and new tooling installation was out of scope. All findings are E2 static-certain, independently re-verified, not E3/E4 runtime-observed. Focus-order/traversal behavior at runtime, and actual TalkBack announcement behavior during practice-answer state transitions, remain NOT VERIFIED (not treated as FAIL).

## Historical accessibility findings

ACC-002, ACC-003, ACC-004 (all prior CLOSED) — all confirmed CLOSED AND STILL VALID, no regressions. This pass's three findings are new, distinct discoveries (two on the same components as prior closed findings, but on different axes — touch-target size vs. label content, font-shrinking vs. mid-character breaking — not rediscoveries or regressions).

## Immutable evidence chain

`SUMMARY.md`, `ACCESSIBILITY_MATRIX.md`, `SCREEN_READER_MATRIX.md`, and `TEXT_SCALE_TOUCH_MATRIX.md` in this same run directory provide full supporting detail and remain the evidence trail behind this canonical result. This file does not alter or supersede their content.

`.audit/state/FINDING_REGISTRY.md` was read only for historical reconciliation and was not modified.
