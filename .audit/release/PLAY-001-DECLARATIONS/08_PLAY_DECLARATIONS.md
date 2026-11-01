# Play App Content Surfaces — Applicability

| Surface | Applicability | Evidence |
|---|---|---|
| Data Safety | **APPLIES** | App collects optional account data (`01_DATA_SAFETY.md`) |
| Ads | **APPLIES** (declared as "No ads") | `04_ADS.md` |
| App Access | **APPLIES** (declared as fully open, no credentials needed) | `05_APP_ACCESS.md` |
| Target Audience | **APPLIES** | `06_TARGET_AUDIENCE.md` — owner input needed |
| Content Rating | **APPLIES** (mandatory for all Play apps) | `07_CONTENT_RATING.md` |
| Account deletion | **APPLIES** — app supports account creation | `03_ACCOUNT_DELETION.md` |
| News | **NOT APPLICABLE** | App is not a news app; no news-content aggregation/publishing feature exists in source |
| Health | **NOT APPLICABLE** | No health-data collection, no health-claim content; app is a language-learning tool |
| Financial features | **NOT APPLICABLE** | No payments, lending, investment, or financial-data feature exists (`04_ADS.md`'s sibling IAP check confirms no payment SDK at all) |
| Government | **NOT APPLICABLE** | Not a government-affiliated app |
| Sensitive permissions declaration | **PARTIALLY APPLIES** — see `09_ANDROID_PERMISSIONS.md` for `SYSTEM_ALERT_WINDOW` specifically, which does require a declaration form | `09_ANDROID_PERMISSIONS.md` |
| Foreground service declaration | **NOT APPLICABLE** | No foreground service declared in the manifest (confirmed: no `<service>` element with `foregroundServiceType` in `android/app/src/main/AndroidManifest.xml`) |
| Exact alarms (`SCHEDULE_EXACT_ALARM`) | **NOT APPLICABLE** — not present in the app-level manifest; `expo-notifications`' merged manifest contribution does not add this permission for the simple daily-reminder scheduling this app uses (confirmed via the AAB's own merged-manifest permission list in `09_ANDROID_PERMISSIONS.md` — `SCHEDULE_EXACT_ALARM` is not present) | `09_ANDROID_PERMISSIONS.md` |
| Photo/video permissions | **PARTIALLY APPLIES** — legacy `READ/WRITE_EXTERNAL_STORAGE` (capped at `maxSdkVersion=32`, i.e., inactive on Android 13+) exists for the local backup-export feature; see `09_ANDROID_PERMISSIONS.md` | Same |
| Advertising ID | **NOT APPLICABLE** | No ads SDK, no Advertising ID usage anywhere (`04_ADS.md`) |
| VPN | **NOT APPLICABLE** | No VPN/network-proxy capability in source |
| Accessibility API | **NOT APPLICABLE** | No `AccessibilityService` implementation; app uses only standard React Native accessibility props (labels/roles), not the Android Accessibility Service API |
| SMS / Call Log | **NOT APPLICABLE** | No `READ_SMS`/`READ_CALL_LOG` permission, no such dependency |
| Full-screen intent | **NOT APPLICABLE** | No `USE_FULL_SCREEN_INTENT` permission or full-screen notification usage found |

All "NOT APPLICABLE" determinations above are evidence-backed (absence of the specific permission, SDK, or manifest element confirmed directly), not assumed by category.
