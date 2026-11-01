# Ads

## Evidence

`package.json` dependencies (both `dependencies` and `devDependencies`) inspected in full — no match for any of: `admob`, `google-mobile-ads`, `react-native-google-mobile-ads`, `unity-ads`, `applovin`, `ironsource`, `facebook-ads`, or any other advertising SDK. No `AD_ID` permission, no `com.google.android.gms.ads.*` reference anywhere in the AndroidManifest.xml or the production AAB's own merged manifest (independently checked via `strings` extraction during `10_TARGET_SDK.md`'s own manifest inspection — no `ads` or `admob` string present).

## Result

**CONTAINS ADS: NO**

Evidence-backed, not inferred from absence of mention alone — directly confirmed by dependency list and manifest inspection.
