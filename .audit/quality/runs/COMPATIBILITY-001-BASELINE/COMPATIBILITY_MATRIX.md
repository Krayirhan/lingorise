# COMPATIBILITY-001-BASELINE — Compatibility Matrix

Revision: `16b9aab1f776503ec52067d4f543af8ab6f2e9aa`

| Area / Journey | Declared support | Static evidence | Runtime evidence | Fallback | Status | Confidence |
|---|---|---|---|---|---|---|
| Android platform | Full support (native project, CI, EAS) | Consistent, no defect found | Confirmed app installs/runs on `emulator-5554` (reused from earlier session evidence) | N/A | PASS | HIGH |
| iOS | Not shipped (config present, no native project) | N/A | N/A | N/A | **OUT OF SCOPE** | HIGH |
| Web (`react-native-web`) | Dependency present, not release focus | Not inspected | Not inspected | N/A | **OUT OF SCOPE** | MEDIUM |
| Small/narrow screen | Implied (phone-first) | Responsive patterns found (`ScrollView`, `maxWidth` capping, `SafeAreaView`) | Only one emulator size available | N/A | PASS | MEDIUM |
| Orientation policy | Portrait-only, explicitly configured | `app.json: orientation: "portrait"` | N/A | N/A | PASS (intentional) | HIGH |
| Keyboard handling | Implied (auth form) | `KeyboardAvoidingView` + `keyboardShouldPersistTaps` correctly implemented | Not runtime-verified this pass | N/A | PASS | MEDIUM |
| Notifications | `expo-notifications` plugin declared | `notificationService.ts` schedules/cancels a daily reminder | Not runtime-verified this pass | N/A | PASS | MEDIUM |
| Sharing/export | `expo-sharing` plugin declared | `exportUserDataJSON()` exists, wired to `DataManagementCard.tsx`'s UI | Not runtime-verified this pass | N/A | PASS | MEDIUM |
| Firebase/auth runtime | Firebase Auth + Firestore | Consistent, no platform-specific defect found | Confirmed working in earlier sessions' Maestro evidence (reused as fact) | Guest mode as offline/no-account fallback | PASS | MEDIUM-HIGH |
| Turkish UI (as an interface locale) | Full support, default locale | No typo/grammar/consistency defect found in extensive sampling | Confirmed rendering correctly on-device in earlier sessions' evidence (reused as fact) | N/A | PASS | HIGH |
| English UI (as an interface locale) | Full support via `LanguageSettingsCard`'s real switcher | **COMPAT-QA-001** — 5 components bypass the locale system with hardcoded Turkish text | Not runtime-verified this pass (switch-to-English + visually inspect not performed) | None — text renders unconditionally regardless of locale | **PARTIAL** | HIGH (for the static finding) |
| English-learning-content boundary | English vocabulary stays English regardless of UI locale | Confirmed correct — content and UI are properly separated axes | N/A | N/A | PASS | HIGH |
| Date/number presentation | Locale-aware | `toLocaleDateString` correctly branches `tr-TR`/`en-US` | Not runtime-verified this pass | N/A | PASS | MEDIUM |
| Missing/fallback content | Bundled fallback for catalogue | Already established (reused fact, not re-scored) | N/A | Remote→cache→bundled chain | PASS | MEDIUM-HIGH |

Legend: PASS = invariant holds. PARTIAL = holds in the common case, a real bounded gap exists. FAIL = a concrete, evidenced defect. NOT VERIFIED = genuinely not established this pass. OUT OF SCOPE = not a claimed/shipped product surface, not penalized.
