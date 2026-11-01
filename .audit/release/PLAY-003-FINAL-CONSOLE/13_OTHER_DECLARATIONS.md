# Other App Content Declarations

Carried forward from `PLAY-001-DECLARATIONS/08_PLAY_DECLARATIONS.md`, re-confirmed against the new (SYSTEM_ALERT_WINDOW-removed) production manifest this run — no change to any of these findings resulted from that removal (it was a permission removal, not an addition):

| Surface | Applicability | Evidence |
|---|---|---|
| News | NOT APPLICABLE | No news-content feature |
| Advertising ID | NOT APPLICABLE | No ads SDK (`04_ADS.md`) |
| Photo/video permissions | Legacy-only (`READ/WRITE_EXTERNAL_STORAGE`, capped `maxSdkVersion=32`) for local backup-export; inactive on Android 13+ | `14_ANDROID_PERMISSIONS.md` |
| Exact alarms | NOT APPLICABLE | `SCHEDULE_EXACT_ALARM` absent from the production manifest |
| Foreground services | NOT APPLICABLE | No `<service>` with `foregroundServiceType` declared |
| Full-screen intent | NOT APPLICABLE | `USE_FULL_SCREEN_INTENT` absent |
| VPN | NOT APPLICABLE | No VPN capability |
| Accessibility API | NOT APPLICABLE | No `AccessibilityService` implementation (standard RN a11y props only) |
| SMS / Call Log | NOT APPLICABLE | No such permission or dependency |
| All files access (`MANAGE_EXTERNAL_STORAGE`) | NOT APPLICABLE | Not present; the app uses only the scoped, legacy, capped storage permissions |
| Social/UGC features | NOT APPLICABLE | `05_CONTENT_RATING.md` |
| AI-generated content declaration | NOT APPLICABLE | No generative-AI feature exists in the app (static, curated vocabulary content and exercises only) |

All determinations are evidence-backed (confirmed absence of the specific permission/SDK/manifest element), not category-assumed.
