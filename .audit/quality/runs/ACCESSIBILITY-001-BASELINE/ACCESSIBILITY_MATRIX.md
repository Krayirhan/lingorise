# ACCESSIBILITY-001-BASELINE — Journey/Component Accessibility Matrix

Revision: `16b9aab1f776503ec52067d4f543af8ab6f2e9aa`

| Journey / Component | Accessible name | Role | State/value | Touch target | Font scaling | Color-independent meaning | Runtime evidence | Status |
|---|---|---|---|---|---|---|---|---|
| Practice — answer options | PASS (dynamic, state-aware) | PASS (`radio`) | PASS (`selected`/`disabled`) | PASS (54dp) | NOT VERIFIED (not individually re-checked; label text itself doesn't clip since it's not `numberOfLines`-capped in `AnswerOption`) | PASS (icon + label-text change, not color-only) | NOT VERIFIED (no TalkBack session run) | **PASS** |
| Practice — word prompt (question text) | PASS | N/A (static text) | N/A | N/A | **FAIL** (A11Y-QA-001) | N/A | NOT VERIFIED | **PARTIAL** |
| Practice — Check Answer / Continue button | PASS | PASS (`button`) | PASS (`disabled`) | PASS (52dp) | NOT VERIFIED | N/A | NOT VERIFIED | **PASS** |
| Practice — hint toggle | PASS (label) | PASS (`button`) | Implicit (label change) | **FAIL** (A11Y-QA-002, ~18dp) | NOT VERIFIED | N/A | NOT VERIFIED | **PARTIAL** |
| Practice — audio/pronunciation button | PASS (state-aware label) | PASS (`button`) | Implicit (label change) | PARTIAL (44dp, borderline) | NOT VERIFIED | N/A | NOT VERIFIED | **PASS** |
| Practice — "remind later" bookmark | PASS (label) | PASS (`button`) | N/A | **FAIL** (A11Y-QA-002, ~36dp) | NOT VERIFIED | N/A | NOT VERIFIED | **PARTIAL** |
| Practice — exit confirmation dialog | PASS | PASS (`alert`, modal, live region) | N/A | PASS (uses `AppDialog`'s button components) | NOT VERIFIED | N/A | NOT VERIFIED | **PASS** |
| Authentication — email/password/name inputs | PASS (real labels, not placeholder-only) | Native `TextInput` | Error surfaced via live region | NOT VERIFIED (not measured) | NOT VERIFIED | N/A | NOT VERIFIED | **PASS** |
| Authentication — submit/back/guest buttons | PASS | PASS (`button`) | NOT VERIFIED | NOT VERIFIED | NOT VERIFIED | N/A | NOT VERIFIED | **PASS** |
| Home — bottom navigation tabs | PASS | PASS (`tab`/`tablist`) | PASS (`selected`) | NOT VERIFIED | NOT VERIFIED | N/A | NOT VERIFIED | **PASS** |
| Home — level/streak indicators | PASS | PASS (`button`/`text`) | N/A | NOT VERIFIED | PARTIAL (mascot-prompt text deliberately capped at 1.3x, reasoned) | N/A | NOT VERIFIED | **PASS** |
| Muted/secondary text (phonetic, hint labels, streak labels, post-submit muted answers) | N/A | N/A | N/A | N/A | N/A | **PARTIAL** (A11Y-QA-003 — contrast) | NOT VERIFIED | **PARTIAL** |
| Modals/dialogs generally | PASS (semantics) | PASS (`alert`, `accessibilityViewIsModal`) | N/A | N/A | NOT VERIFIED | N/A | NOT VERIFIED (native focus-containment assumed sufficient per this audit's own instruction not to demand custom focus-trapping) | **PASS** |
| Animations (feedback, mascot, celebrations) | N/A | N/A | N/A | N/A | N/A | N/A | N/A | **PASS** (`reduceMotion` threaded consistently across every animated component sampled) |

Legend: PASS = invariant holds. PARTIAL = holds in the common case, a real bounded gap exists. FAIL = a concrete, evidenced defect. NOT VERIFIED = genuinely not established this pass (not treated as FAIL, per UNKNOWN ≠ FAIL).
