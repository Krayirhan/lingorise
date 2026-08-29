# COMPATIBILITY-001-BASELINE — Layout / Platform Matrix

Revision: `16b9aab1f776503ec52067d4f543af8ab6f2e9aa`

## Declared platform support (from `app.json`, verified)

| Platform | Declared | Actually shipped | Scope for this audit |
|---|---|---|---|
| Android | `android.package: "com.lingorise.app"` | YES — native `android/` project, CI builds a release APK, EAS has android build profiles | IN SCOPE |
| iOS | `ios.bundleIdentifier` present in config | NO — no committed `ios/` native project, no iOS build/release path found | **OUT OF CURRENT PRODUCT SCOPE** — lack of iOS verification is not a defect |
| Web | `react-native-web` is a dependency | Present but not the release focus (per shared discovery) | Effectively out of primary scope; no broken-web-behavior claim exists to fail against |

Orientation: `"orientation": "portrait"` — explicitly, intentionally configured. Lack of landscape support is **not** a defect.

## Screen/layout adaptability

| Pattern observed | Evidence | Assessment |
|---|---|---|
| Content-width capping on wide/tablet-class screens | `PracticeScreen.tsx`'s `shell: { maxWidth: 580, width: "100%", alignSelf: "center" }` | PASS — a good responsive pattern that avoids over-stretched layouts on larger screens without requiring separate tablet layouts |
| Scrollable content | `ScrollView` used consistently across Practice, Profile, Progress, session-summary screens | PASS |
| Safe area handling | `SafeAreaView` used consistently (`edges={["top","bottom"]}` pattern seen across screens) | PASS |
| Small/narrow-device testing | Only one emulator configuration (`emulator-5554`) was available this session | NOT VERIFIED at multiple screen sizes — no demonstrated clipping/overlap defect found in the layouts inspected; this affects CONFIDENCE, not score, per this audit's own fairness rule |

## Keyboard / system UI compatibility

| Screen | Pattern | Assessment |
|---|---|---|
| `AuthScreen.tsx` (the app's one real TextInput-heavy screen) | `KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"}` wrapping a `ScrollView` with `keyboardShouldPersistTaps="handled"` | PASS — correctly platform-branched keyboard-avoidance behavior, correct tap-dismissal handling |
| Android hardware back button | `PracticeScreen.tsx` registers a `BackHandler` listener routing back-press through the same exit-confirmation flow as the on-screen back button | PASS |

## Fallback / configuration resilience

Already established as fact (not score, reused from RELIABILITY-001-BASELINE/DATA-001-BASELINE) — `catalogueService.ts`'s remote→cache→bundled fallback chain ensures missing/failed remote content never produces blank or broken UI. No raw `undefined`/internal-key rendering was found in any component read this pass.
