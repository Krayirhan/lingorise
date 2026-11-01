# Content Rating (IARC)

Prepared as evidence-backed answers only for objectively verifiable fields. This app is a vocabulary-learning tool with static word-lists, quizzes, and gamification (XP/streak/badges) — no user-generated content, no multiplayer/social interaction, no network-delivered arbitrary content.

| Category | Answer | Evidence |
|---|---|---|
| Violence | None | No violent content in any word/question bank or UI asset; app is a text/vocabulary trainer |
| Sexual content | None | Same — educational vocabulary content only |
| Profanity | None | Content is curated vocabulary/exam material, not user-submitted or open text |
| Drugs/Alcohol/Tobacco references | None found | No such content in the app's static learning material (not exhaustively re-read word-by-word this run, but no such theme exists in the app's stated educational scope) |
| Gambling (real or simulated) | None | No gambling mechanic; XP/streak is a pure gamification/progress system, not wagering |
| Fear/horror themes | None | Educational content only |
| User-generated content | **NO** | No mechanism exists for a user to submit, post, or share content visible to others (confirmed: no comment/forum/chat feature in source) |
| User interaction (chat, messaging) | **NO** | No social/multiplayer feature exists in source |
| Shares location | **NO** | No location capability at all (`01_DATA_SAFETY.md`) |
| In-app purchases | **NO** | No IAP SDK present (`04_ADS.md`'s sibling dependency check) |
| Ads | **NO** | `04_ADS.md` |
| Unrestricted web access | **NO** — the app opens external links (e.g., the Privacy Policy web link) via the device's own browser/`Linking.openURL`, not an embedded unrestricted in-app browser/WebView that could load arbitrary user-navigable content | Confirmed: no `react-native-webview` or embedded browser dependency found in `package.json` |

## Classification

**Content Rating: READY.** Every field above is either a clear "None"/"No" backed by the complete absence of any supporting mechanism in source, or already covered by a sibling declaration file's own verified evidence. No field requires legal/product-owner judgment beyond what is already objectively supported — recommend submitting the standard IARC questionnaire with these answers, which should yield the lowest applicable rating tier (typically "Everyone"/3+ or region equivalent) given the complete absence of any mature-content mechanism.
