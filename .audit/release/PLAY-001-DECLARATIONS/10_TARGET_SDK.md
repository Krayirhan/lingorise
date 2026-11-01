# Target SDK Verification

## Evidence (not inferred from Expo SDK number alone)

`android/build.gradle` and `android/app/build.gradle` define no explicit SDK-version overrides (`grep` for `Sdk`/`sdk` in both files returned no numeric assignment) — meaning the project inherits Expo's own default Android SDK versions for its resolved Expo SDK release (`56.0.0`, independently confirmed via the actual EAS build's own metadata in `RC-001-RETRY-EAS-PRODUCTION-AAB/06_EAS_BUILD.md`: `"sdkVersion": "56.0.0"`).

Traced the actual default directly from the installed native module's own Gradle plugin (`node_modules/expo-modules-core/android/ExpoModulesCorePlugin.gradle`, `useDefaultAndroidSdkVersions` block):

```
compileSdkVersion project.ext.safeExtGet("compileSdkVersion", 36)
minSdkVersion project.ext.safeExtGet("minSdkVersion", 24)
targetSdkVersion project.ext.safeExtGet("targetSdkVersion", 36)
```

No project-level override exists for any of these three `ext` properties (confirmed: no `ext.compileSdkVersion`/`ext.minSdkVersion`/`ext.targetSdkVersion` assignment anywhere in either `build.gradle` file), so the defaults apply exactly as shown.

## Result

**targetSdk: 36** (Android 16)
**compileSdk: 36**
**minSdk: 24** (Android 7.0)

## Android 16 / API 36 readiness

**PASS.** Google Play's current mandatory minimum target SDK requirement for new app updates (API 34 as of the 2024 policy, with the requirement floor advancing roughly one version per year — API 35 was the 2025 floor) is met with margin: this app already targets **API 36**, at or ahead of the current requirement floor. No release blocker exists on this axis.
