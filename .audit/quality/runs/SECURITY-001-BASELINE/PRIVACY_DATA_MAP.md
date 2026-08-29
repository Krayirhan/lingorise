# SECURITY-001-BASELINE — Privacy / Data Lifecycle Map

Revision: `16b9aab1f776503ec52067d4f543af8ab6f2e9aa`

| Data type | Collected? | Stored locally (AsyncStorage) | Stored in cloud (Firestore/Auth) | Purpose | Deletion path | Export path |
|---|---|---|---|---|---|---|
| Email | Only if user registers (optional — guest mode has no email) | No (Auth SDK manages its own session cache) | Yes (Firebase Auth) | Sign-in identity | `deleteAccount()` deletes the Auth account | None |
| Display name | Only if user sets one | Yes (as part of merged user object) | Yes | Personalization | Deleted with account/Firestore doc | None |
| XP / streak / badges / passedLevelExams / per-item progress | Always (guest or authenticated) | Yes | Only if authenticated | Core gamification/progress | Local reset available (`DataManagementCard`); cloud copy deleted with account | None |
| Settings (sound, motion, notifications, goal minutes, locale, avatar) | Always | Yes | Only if authenticated | Preferences | Same as above | None |
| Telemetry events (question IDs, levels, correctness, timings) | Always | Yes (local ring buffer, 200 events, `src/services/telemetry.ts`) | No — no analytics sink is wired up; the file's own code comment states RN can't use the Firebase Web SDK's Analytics module and no native `@react-native-firebase/analytics` was added | On-device debugging/future instrumentation | Cleared via `clearTelemetry()`, also implicitly bounded by ring-buffer eviction | None |
| Device date/telemetry ring buffer | Always | Yes | No | Streak/rollover correctness (`suspicious_date_jump` event) | Same as above | None |

## Observations

- No third-party analytics/ad SDK is integrated (Firebase Analytics is present as a dependency but non-functional on RN and never wired in per the code's own comment) — no cross-app tracking surface exists.
- No data-export ("download your data") feature exists. This is noted as an observation, not scored as a defect — no evidence was found of an applicable legal requirement (e.g., confirmed GDPR/CCPA obligation) driving this for the current user base, so it is out of this audit's evidenced scope per the "evidence, not best-practice" rule.
- Account deletion (`src/services/auth.ts: deleteAccount()`) deletes the Firestore document(s) and the Firebase Auth account, but the two operations are not atomic — a failure between them can leave one deleted and the other intact. This was already root-caused and scored as a data-consistency defect (DATA-QA-004, P3) in DATA-001-BASELINE. For this audit it is counted again only for its privacy-guarantee framing (SEC-QA-003: "user believes account/data are fully erased, but partial failure could leave a live Auth identity or lingering Firestore data") with a deliberately light score deduction to avoid double-counting the same root cause across two independent audits.
