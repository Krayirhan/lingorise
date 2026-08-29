# Accessibility Targeted Reaudit

## Font scale (GLOBAL-QA-015)

`src/features/practice/components/WordPrompt.tsx`, prompt `<Text>`: `numberOfLines={1}` + `adjustsFontSizeToFit` (which actively shrinks text to force one line, resisting system font-scale) replaced with `numberOfLines={2}` and no `adjustsFontSizeToFit`. Independently confirmed:
- No `allowFontScaling={false}` anywhere in this component (would have silently defeated the fix) — absent, confirmed by direct read.
- The surrounding `titleWrap`/`cntRow` layout uses `flex: 1` and does not impose a fixed height on the text container, so a wrapped second line can grow the row without clipping.
- `dynamicFontSize`/`lineHeight` are still passed through from the parent (unchanged plumbing), so this is a minimal, targeted change, not a rewrite.

Evidence level: **E2 structural only.** No on-device confirmation at an actual large system font-scale setting has been performed by Sprint 2, its two reviewers, or this reaudit. Honestly disclosed, not claimed as E4.

**Status: PASS at E2 confidence.**

## Touch target (GLOBAL-QA-025)

Two controls verified:
- Hint chip (`WordPrompt.tsx`): `hitSlop={{top:14, bottom:14, left:10, right:10}}` added to the `Pressable`. The visible chip is documented as ~18dp tall; with hitSlop the effective tappable height is ~18+14+14 = **~46dp**, comfortably clearing the ~44-48dp platform guidance band.
- "Remind later" button (`PracticeScreen.tsx`): `hitSlop={{top:8, bottom:8, left:12, right:12}}`. Visible control ~36dp tall; effective tappable height ~36+8+8 = **~52dp**.

No custom touch-handling (e.g., a custom `PanResponder` or overlapping absolutely-positioned sibling) exists in either component that could intercept or shrink the effective hit area — confirmed by reading both files in full; both use plain `Pressable` with `hitSlop`, a standard, well-supported RN API.

No overlap risk found: neither expanded hit area is adjacent to another interactive element close enough (within the hitSlop's expansion) to create a double-tap-target collision — confirmed by reading the surrounding layout of both components.

Evidence level: **E2 structural, dimensions derived (not measured on a physical device).**

**Status: PASS at E2 confidence.**

## Contrast (GLOBAL-QA-026)

Independently recomputed the WCAG 2.1 relative-luminance contrast ratio from scratch (not copied from the test file), for `#6B6763` (new `muted`) against both backgrounds:

- vs `canvas` (`#F7F4EC`): **5.10:1**
- vs `surface` (`#FFFFFF`): **5.61:1**
- Old value for comparison, `#7A7672` vs `canvas`: **4.10:1**

Both new ratios independently confirmed to exceed the 4.5:1 WCAG AA threshold for normal-size text. The old value is confirmed genuinely below threshold (4.10:1 < 4.5:1), validating that this was a real defect, not a false positive. Calculation performed via the standard sRGB relative-luminance formula, matching `tests/testSuite.ts` §60's own computed values exactly.

**Status: PASS, E3-equivalent confidence** (both the test suite and this independent reaudit compute the ratio programmatically from the actual color values — genuine calculation, not a visual estimate).

## Other accessibility regression check

Reviewed `WordPrompt.tsx` and `PracticeScreen.tsx` diffs for regressions in scope (screen-reader labels, roles, focusability, disabled-state semantics, text clipping, touch-target overlaps):
- `accessibilityRole`/`accessibilityLabel` props on the touched `Pressable`s (hint chip, remind-later button) are unchanged by this sprint's edits — only `hitSlop` was added.
- No `numberOfLines`/layout change was made to any other text element in either file.
- No disabled-state prop was touched.

No regression found in the touched surfaces. Untouched screens were not broad-audited, per scope.

## Accessibility score

Baseline 86/100 (A11Y-001-BASELINE), held down by A11Y-QA-001 (P2, font-scale), A11Y-QA-002 (P3, touch targets), A11Y-QA-003 (P3, contrast) among other findings. All three are genuinely addressed with proportionate fixes; two (font-scale, touch-target) remain at E2 evidence only (no on-device/runtime confirmation, including no TalkBack/VoiceOver pass — **NOT VERIFIED**, not treated as FAIL); one (contrast) has genuine E3-equivalent computed evidence.

**Current score: 91/100** (+5, adjusted down from an initial +6/+7 draft per independent reviewer challenge)

Per-finding credit is not uniform, reflecting the evidence-level split: contrast (GLOBAL-QA-026, E3-equivalent computed evidence) receives full credit (+3); font-scale (GLOBAL-QA-015, P2 but E2-only, no on-device confirmation of an actual large-font-scale render) receives partial credit (+1.5); touch-target (GLOBAL-QA-025, P3, E2-only) receives partial credit (+0.5). The independent reviewer specifically flagged that two of three closures rest on static code review alone (no verified on-device behavior, e.g. no confirmation that a genuinely very long word wraps cleanly rather than overflowing at 200% font scale) and recommended the recovery be scaled to reflect that, rather than crediting all three findings as if equally strong evidence existed for each.

**Confidence: MEDIUM** — contrast fix has strong (near-E3) confidence; font-scale and touch-target fixes are structurally sound and well-reasoned but not runtime-confirmed, so the overall domain confidence is capped below HIGH. Runtime TalkBack/VoiceOver remains **NOT VERIFIED** (not FAIL) for this and prior audits alike — no regression, no new gap, unchanged from baseline's own evidence-level ceiling for those checks.
