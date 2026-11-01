# Content Rating

## Owner answers (all confirmed as current-state facts)

Violence: NO. Fear/horror: NO. Sexual content: NO. Profanity: NO. Drugs: NO. Alcohol: NO. Tobacco: NO. Gambling: NO. UGC: NO. User-to-user communication: NO. Location sharing: NO. Unrestricted web/browser access: NO. Current ads: NO. Current purchases: NO.

## Source audit (confirms every owner answer, no contradiction found)

- No violent/sexual/profane/substance/gambling content possible: app is a static vocabulary/exercise/exam engine with no user-authorable or third-party content feed.
- UGC / user-to-user communication: no chat, comment, forum, or content-sharing feature exists anywhere in `src/`.
- Location sharing: no location capability at all (no `expo-location`, no location permission).
- Unrestricted web access: no embedded WebView/browser component (`react-native-webview` absent from dependencies); external links open via the OS browser (`Linking.openURL`), which is the correct, restricted pattern.
- Ads: `04_ADS.md`.
- Purchases: no IAP SDK present.

## Prepared IARC questionnaire answers

All fields above answered exactly as the owner specified — full agreement between owner input and source evidence, no conflicting field found.

## Status

**Content Rating: READY.**
