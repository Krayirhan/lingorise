# COMPATIBILITY-001-BASELINE — DEEP PLATFORM COMPATIBILITY / LOCALIZATION AUDIT

Revision: `16b9aab1f776503ec52067d4f543af8ab6f2e9aa` (== origin/main at audit time)

## Compatibility / Localization: 93/100

Confidence: MEDIUM-HIGH

Runtime compatibility evidence: **MODERATE** — one Android emulator configuration was available and confirmed working (app installs/runs); multi-device/multi-API-level runtime verification and an actual switch-to-English visual check were not performed this pass. Per this audit's own fairness rule, this affects confidence, not the score itself.

Derived independently from direct source/config inspection. No expected score and no other domain's findings were consulted before this score was drafted.

## Declared supported product surface (from `app.json`, verified)

- **Android**: full support — native `android/` project, CI builds a release APK, EAS build profiles. This is the real, actively shipped target.
- **iOS**: `ios.bundleIdentifier` present in config, but no committed `ios/` native project and no iOS build/release path exists — **OUT OF CURRENT PRODUCT SCOPE**, not penalized.
- **Web**: `react-native-web` is a dependency, not the release focus — effectively out of primary scope, not penalized.
- **Orientation**: portrait-only, explicitly configured (`app.json`) — intentional, not a defect.
- **Interface locales**: Turkish (default) AND English — both real, first-class, product-supported via a working switcher in `LanguageSettingsCard.tsx`.
- **Learning content language**: English vocabulary, correctly treated as content rather than UI text.

## Scorecard (score-loss ledger)

| Dimension | Max | Score | Lost | Root cause | Evidence | Confidence |
|---|---|---|---|---|---|---|
| Supported-platform compatibility | 20 | 19 | 1 | No defect found; Android works correctly, iOS/web correctly treated as out-of-scope; light token for unverified Android API-level-specific behavior | E1/E2 | MEDIUM-HIGH |
| Screen/layout adaptability | 20 | 19 | 1 | No demonstrated defect; good responsive patterns found (content-width capping, `ScrollView`, `SafeAreaView`); light token for single-device-size verification only | E1/E2 | MEDIUM |
| Keyboard / system UI / lifecycle compatibility | 10 | 10 | 0 | No defect — `AuthScreen`'s `KeyboardAvoidingView` + `keyboardShouldPersistTaps` correctly implemented; Android hardware back button correctly routed | E2 | HIGH |
| Localization architecture / consistency | 15 | 10 | 5 | COMPAT-QA-001 | E2 | HIGH |
| Turkish UI copy correctness | 15 | 15 | 0 | No typo/grammar/broken-character/inconsistent-terminology defect found in extensive sampling — scored separately from COMPAT-QA-001's completeness gap | E2 | HIGH |
| Locale/date/number/content-boundary behavior | 10 | 10 | 0 | No defect — date formatting correctly locale-branched, English content correctly stays English regardless of UI locale | E2 | HIGH |
| Fallback/configuration resilience | 10 | 10 | 0 | No defect — catalogue fallback chain (already established fact from a separate audit) handles missing content gracefully | E2 | MEDIUM-HIGH |
| **TOTAL** | **100** | **93** | **7** | | | |

## Findings

| ID | Title | Severity | Evidence | Status |
|---|---|---|---|---|
| COMPAT-QA-001 | Multiple real, reachable UI components render hardcoded Turkish text unconditionally, bypassing the app's working `copy`/locale system, even though English is a first-class, product-supported interface locale (real switcher in `LanguageSettingsCard.tsx`, confirmed by independent review to flow through a single genuine `copy = copyByLocale[userData.locale]` source consumed by all affected components): `WordDetailModal.tsx:58` ("Türkçe Karşılığı"), `AvatarPicker.tsx:24` ("Avatar Seç:", which never receives a `copy` prop at all), `DataManagementCard.tsx` (the entire in-app Privacy Policy/Terms modal content plus its related reset/export `Alert`/`AppDialog` confirmation dialogs — while the same component's main card view is correctly localized elsewhere), and `WordNotebookModal.tsx:194,116` ("Bu Kelimeyi Çalış →", "Tümü"). Independent review confirmed each is an isolated miss within an otherwise-correctly-localized file (except `AvatarPicker.tsx`, which has no localization wiring at all) and widened the `DataManagementCard.tsx` scope to include its dialogs, without changing the deduction. A user who switches to English will see this Turkish text regardless — most consequentially, the entire Privacy Policy content | P2 | HIGH — independently re-verified against source, including confirming no `locale === "tr"` gating exists anywhere in these files | OPEN |

Findings were not padded to fill severity quotas — this is the complete set found with real, distinct evidence at this depth.

## Independent review

**`code-reviewer` — ADJUST (minor).** Independently confirmed COMPAT-QA-001 in full via direct source reading of all four files, confirmed the locale-switching mechanism is genuine (a single `copy = copyByLocale[userData.locale]` source in `AppNavigator.tsx`, not a fake/dev-only toggle), and confirmed the correct-elsewhere-in-the-same-file pattern that shows these are isolated misses, not evidence the whole feature area is unlocalized. Confirmed no penalization of unclaimed iOS/web support, no i18n-framework over-engineering bias, and correctly distinguished flagged bypass-lines from legitimate `copy.xxx || "Turkish fallback"` patterns (which were correctly NOT flagged, since those resolve to English when `copyByLocale.en` has the corresponding key). The only adjustment was widening COMPAT-QA-001's described scope to explicitly include `DataManagementCard.tsx`'s `Alert`/`AppDialog` confirmation-dialog text (found during the reviewer's own verification pass) as part of the same root cause — this did not change the score, since it was already the lowest-scoring category and the widened description doesn't imply additional distinct root causes. The proposed severity (P2) and total (93/100) were both confirmed as-is.

## Strongest area

Turkish UI copy correctness and keyboard/system-UI compatibility (both full marks): the Turkish text sampled throughout this session (auth flows, onboarding, dialogs, error messages, practice feedback) is consistently well-written with correct diacritics and consistent terminology, and the app's one real text-input-heavy screen correctly implements platform-appropriate keyboard avoidance.

## Weakest area

Localization architecture/consistency, driven entirely by COMPAT-QA-001: despite a genuine, working dual-locale architecture, a handful of real components — most consequentially the entire in-app Privacy Policy — fall outside it entirely.

## Historical reconciliation (performed last, against `.audit/state/FINDING_REGISTRY.md`, read-only)

No Compatibility- or Localization-domain historical findings exist in the registry — this is the first Compatibility-domain audit for this project. (ARCH-001, a dead-duplicate-file finding referencing `i18n/formatters.ts`, is an unrelated Architecture-domain finding about a deleted utility file, not a localization-content finding — no overlap.) No historical registry file was modified.

## Final validation

- `git diff -- src`: empty
- `git diff -- tests`: empty
- `git status --short`: only pre-existing untracked/modified audit-artifact and asset files (no application source or test changes)
