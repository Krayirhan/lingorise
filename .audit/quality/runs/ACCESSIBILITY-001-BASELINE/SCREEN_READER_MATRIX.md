# ACCESSIBILITY-001-BASELINE — Screen Reader (TalkBack) Semantics Matrix

Revision: `16b9aab1f776503ec52067d4f543af8ab6f2e9aa`

No runtime TalkBack/accessibility-tree inspection was performed this pass (would require enabling a device-level accessibility service — the audit's own instructions caution against irreversible-ish global device-setting changes, and "do not install new accessibility tooling"). All entries below are E2 static-certain (source directly establishes the semantics) unless noted.

| Component | Accessible name | Role | State/value | Evidence |
|---|---|---|---|---|
| `AnswerOption` (practice/exam answer choice) | Dynamic — label + state-dependent suffix (", seçildi" / ", doğru cevap" / ", yanlış seçim" / ", doğru karşılık bu seçenekti") | `radio` | `{selected, disabled}` | E2 — the accessible name itself changes to carry correct/incorrect/revealed information, not just visual styling |
| `PrimaryButton` (Check Answer, Continue, dialog actions, etc.) | Passed-in `label` prop | `button` | `{disabled, busy}` | E2 |
| `AppDialog` (exit-confirm, reset-confirm, etc.) | Title/message content | `alert`, `accessibilityViewIsModal={true}`, `accessibilityLiveRegion="assertive"` | N/A (static content) | E2 — decorative icon explicitly marked `accessible={false}` |
| `AuthScreen` TextInputs (name/email/password) | Real `accessibilityLabel` (not placeholder-only) | Native `TextInput` role | Error state surfaced via a separate `accessibilityLiveRegion="assertive"` box | E2 |
| `HomeBottomNav` tab items | `label` prop | `tab` (container: `tablist`) | `{selected: isSel}` | E2 |
| `GlobalTopBar` level/streak indicators | `"{levelLabel}: {level}"` / `"{streak} {streakLabel}"` | `button` (level, with hint "Seviye seçicisini aç") / `text` (streak) | N/A | E2 |
| `WordPrompt` hint/audio icon buttons | State-dependent label ("İpucu"/"İpucu açık", "Telaffuzu dinle"/"Seslendiriliyor...") | `button` | Implicit via label text change | E2 |
| `PracticeScreen` "remind later" bookmark button | `copy.game?.remindLater` | `button` | N/A | E2 |

## Summary

Screen-reader semantics are consistently well-implemented across every component sampled, including the single most consequential case: the practice/exam answer option correctly exposes selected/correct/incorrect/revealed state through its accessible NAME (not merely through color or an icon a screen reader can't see), directly satisfying this audit's Section 7 requirement. No missing-role, missing-state, or icon-only-unlabeled-button defect was found in any component inspected. No finding in this matrix — screen-reader semantics is this audit's strongest area.
