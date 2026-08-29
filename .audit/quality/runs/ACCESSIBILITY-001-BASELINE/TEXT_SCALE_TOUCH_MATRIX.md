# ACCESSIBILITY-001-BASELINE — Text Scaling & Touch Target Matrix

Revision: `16b9aab1f776503ec52067d4f543af8ab6f2e9aa`

## Text scaling

| Component | Pattern | Risk | Evidence |
|---|---|---|---|
| `WordPrompt.tsx` word-prompt text (the practice question's actual word/phrase) | `numberOfLines={1}` + `adjustsFontSizeToFit`, no `maxFontSizeMultiplier` | **A11Y-QA-001** — shrinks font to fit one line at increased system font-scale, working against the user's own accessibility preference on the single most important text of the app's core interaction | E2 |
| `GardenHeroCard.tsx` secondary mascot-prompt text | `maxFontSizeMultiplier={1.3}`, explicitly commented as a deliberate cap on redundant text (same info exists at full scale elsewhere) | Not a defect — a reasoned, proportional accommodation | E2 |
| 5 other `numberOfLines` usages across the codebase | Not individually inspected this pass | NOT VERIFIED (light coverage token only, not a demonstrated defect) | E1 |
| Only 1 total `maxFontSizeMultiplier`/`allowFontScaling` usage found repo-wide | Text scales with system settings by default almost everywhere (a strength, not a gap) | No finding — RN's default behavior already respects system font scale unless explicitly overridden, and it's barely overridden anywhere | E2 |

## Touch targets

| Control | Style | Estimated tappable height | Guidance | Status |
|---|---|---|---|---|
| `PrimaryButton` (Check Answer, Continue, dialog actions) | `minHeight: 52` | 52dp | Exceeds Android's 48dp | PASS |
| `AnswerOption` (practice/exam answer choice) | `minHeight: 54` | 54dp | Exceeds Android's 48dp | PASS |
| `WordPrompt`'s `audioBtn` (pronunciation) | Explicit `44×44` | 44dp | At Apple's 44pt minimum, slightly under Android's 48dp guidance | PARTIAL — borderline, not flagged as a dedicated finding given proximity to standard minimums |
| `WordPrompt`'s `hintBtn` (hint toggle) | `paddingHorizontal: 6, paddingVertical: 2`, 13px icon + 9.5-12.5pt text, no `minHeight`/`hitSlop` | ~17-19dp | Well under Android's 48dp / Apple's 44pt | **A11Y-QA-002** |
| `PracticeScreen`'s `remindBtn` ("remind me later" bookmark) | `paddingVertical: 10, paddingHorizontal: 14`, 14px icon + 12.5pt text, no `minHeight`/`hitSlop` | ~36dp | Under Android's 48dp | **A11Y-QA-002** |

## Summary

Touch targets are well-sized on every primary/critical interactive control (Check Answer, answer options, audio playback) — the two undersized controls found are both secondary actions (hint toggle, bookmark-for-later) on the same Practice screen that otherwise gets its primary interactions right, indicating an inconsistency in specific secondary controls rather than a systemic sizing failure. Text scaling is respected by default almost everywhere; the one real gap is on the single most important text element in the app's core interaction loop.
