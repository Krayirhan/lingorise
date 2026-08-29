# SPRINT-002 — Accessibility Evidence

## Font scaling (A11Y-QA-001 / GLOBAL-QA-015)

**Before:** `WordPrompt.tsx`'s prompt text used `numberOfLines={1}` + `adjustsFontSizeToFit` at a fixed base `fontSize={28}` — at a large OS font-scale setting, React Native would shrink the rendered size back down to fit one line, defeating the user's accessibility preference entirely.

**After:** `numberOfLines={2}`, `adjustsFontSizeToFit` removed. The `<Text>` component's `allowFontScaling` is not overridden anywhere in this component (confirmed by reading the full file — no `allowFontScaling={false}` present), so it retains React Native's default `true`: the OS font-scale multiplier is now genuinely applied to the 28pt base size, and a word that would overflow one line at a large scale wraps to a second line instead of shrinking.

**Manual/runtime verification:** NOT PERFORMED this pass — no device/emulator session with an adjusted system font-scale setting was run. This is a structural, source-level fix verified by reading the actual component and RN's documented default `Text` behavior, not by an on-device screenshot at 200% scale. Flagged honestly as a residual verification gap, not claimed as an on-device PASS.

**Manual verification limitation is consistent with the project's existing constraint:** the historical `ACCESSIBILITY-001-BASELINE` audit itself noted "no TalkBack/accessibility-tree runtime session was performed" for the same reason (out of this session's tooling scope) — this sprint's approach is consistent with that established, disclosed limitation, not a new gap.

## Touch targets (A11Y-QA-002 / GLOBAL-QA-025)

| Control | Visual size (unchanged) | `hitSlop` added | Effective tappable size |
|---|---|---|---|
| Hint toggle chip (`WordPrompt.tsx`) | ~18dp tall | `{top:14, bottom:14, left:10, right:10}` | ~46dp tall, ~38dp wider — exceeds the 44dp guidance |
| "Remind later" button (`PracticeScreen.tsx`) | ~36dp tall | `{top:8, bottom:8, left:12, right:12}` | ~52dp tall — exceeds the 44dp guidance |

**Implementation evidence:** `hitSlop` is a standard React Native `Pressable`/`TouchableOpacity` prop expanding the responder region without affecting layout or visual rendering — confirmed by reading React Native's own type definitions (no custom/wrapped touch handling exists in either component that could override this). No visual regression: both controls render pixel-identical to before (only the invisible hit-test region changed).

**Manual/runtime verification:** NOT PERFORMED (no on-device tap-precision test run). Structural/implementation-level evidence only, honestly disclosed.

## Contrast (A11Y-QA-003 / GLOBAL-QA-026)

**Calculation (WCAG 2.1 relative luminance / contrast ratio formula, standard sRGB):**

| Pair | Before (`#7A7672`) | After (`#6B6763`) |
|---|---:|---:|
| `muted` vs. `canvas` (`#F7F4EC`) | 4.10:1 (below AA 4.5:1) | 5.10:1 |
| `muted` vs. `surface` (`#FFFFFF`) | 4.50:1 (borderline) | 5.61:1 |

**Executable evidence:** `tests/testSuite.ts` §60 independently implements the WCAG relative-luminance formula (not a library call — spot-checked against the standard formula by direct reading) and asserts both ratios are ≥ 4.5, with the actual computed value included in the assertion message for traceability. This is genuine E3 evidence — the test would fail if `C.muted` were reverted to `#7A7672` or any other sub-4.5:1 value.

**Affected contexts:** `C.muted` is used pervasively across small body/secondary text throughout the app (confirmed by its broad usage in the codebase, e.g. `WordPrompt.tsx`'s instruction text, `ErrorBoundary.tsx`'s subtitle, various screen subtitles) — a single token change propagates the fix everywhere it's used, without a global interface darkening (only this one specific token moved, not `ink`/`primary`/other tokens).

**Manual/runtime verification:** NOT PERFORMED (no on-device visual comparison). The WCAG formula itself is the industry-standard, deterministic definition of contrast — computed evidence is treated as sufficient here, consistent with how color-contrast findings are conventionally verified (this is not a subjective visual judgment call).

## Screen-reader semantics

Not touched this sprint — the historical baseline rated this area as the app's strongest accessibility control, and no Sprint 2 finding required changes here. No regression expected or introduced (no `accessibilityRole`/`accessibilityLabel`/`accessibilityState` prop was touched by any Sprint 2 change).
