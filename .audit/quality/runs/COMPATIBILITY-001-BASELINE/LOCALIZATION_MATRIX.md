# COMPATIBILITY-001-BASELINE — Localization Matrix

Revision: `16b9aab1f776503ec52067d4f543af8ab6f2e9aa`

## Localization model (declared, verified from source)

- **UI locales**: Turkish (`tr`) and English (`en`) are both first-class, product-supported interface locales — `src/features/profile/components/LanguageSettingsCard.tsx` implements a real, working switcher (`onLocaleChange("tr")`/`onLocaleChange("en")`), flowing through `ProfileScreen` → `useUserProgress`'s `userData.locale` → `copy = copyByLocale[userData.locale]`, used throughout the app. This is not experimental/dev-only.
- **Learning content language**: English vocabulary (words, meanings, example sentences) is content, not UI — correctly stays in English regardless of interface locale, as intended (LingoRise teaches English; the interface language is a separate axis).
- **Architecture**: per-domain copy files (`src/i18n/{auth,home,onboarding,practice,profile,progress}.ts`), each exporting separate `xxxEn`/`xxxTr` objects, composed via `src/i18n/en.ts`'s `copyByLocale: Record<Locale, Copy>`.
- **Existing verification**: `tests/testSuite.ts` includes a hardcoded-string scan with an explicit, reasoned allowlist (dev-only screens, the product name, the language-selector's own bilingual labels, one confirmed-dead component) — a genuine discipline, though its structural check for the `game`/practice domain only compares key COUNT between `en`/`tr`, not full key-name matching, and only for that one domain (not home/profile/onboarding/auth/progress). This is a verification-methodology observation, not itself scored as a defect per this audit's boundary against duplicating Testing Assurance concerns.

## Findings

| Component | Hardcoded Turkish text | Locale-system bypass? | Reachable via English UI? |
|---|---|---|---|
| `WordDetailModal.tsx:58` | "Türkçe Karşılığı" | YES | YES |
| `AvatarPicker.tsx:24` | "Avatar Seç:" | YES | YES |
| `DataManagementCard.tsx` (~152, 163, 175, 180, 196) | Entire in-app Privacy Policy/Terms modal ("Gizlilik ve Kullanım Şartları", "1. Gizlilik Politikası", "3. Reklam ve Üçüncü Taraflar", "4. Uygulama İçi Kullanım Kayıtları", "Web'de tam metni görüntüle") | YES | YES |
| `WordNotebookModal.tsx:194,116` | "Bu Kelimeyi Çalış →", "Tümü" | YES | YES |

**COMPAT-QA-001**: these instances render unconditionally, not gated behind `locale === "tr"`, and no English branch exists elsewhere in the same files. Independent review additionally confirmed and widened this finding's scope: within `DataManagementCard.tsx`, it isn't just the 5 originally-spotted lines — the file's `Alert.alert("Hata"/"Başarılı", ...)` calls and its `AppDialog` title/label props ("Verileri Sıfırla", "İptal", "Sıfırla", "Tamam") for the reset/export confirmation flows are equally hardcoded and unconditional, while the same file's main card view correctly uses the `copy.profile?.xxx || fallback` pattern elsewhere (confirmed at lines 79, 92-93, 108, 120, 126, 134, 139). This means the defect isn't several isolated one-off lines — it's that an entire sub-feature (the Privacy Policy modal and its related confirmation dialogs) fell outside the locale system wholesale, while the rest of the same component was properly localized. `WordDetailModal.tsx` and `WordNotebookModal.tsx` show the same pattern: correctly localized elsewhere in the same file (confirmed via the `copy.home?.xxx`/`copy.progress?.xxx` pattern at multiple other lines), with these specific lines an isolated miss. `AvatarPicker.tsx` doesn't receive a `copy` prop at all.

A user who switches the interface to English (a real, documented, product-supported action, confirmed by independent review to flow through a single genuine `copy = copyByLocale[userData.locale]` source in `AppNavigator.tsx` consumed by all four affected components) will see this Turkish text regardless — most notably, the entire Privacy Policy/Terms content and its related dialogs, arguably the most trust-relevant text in the app for a reader who cannot read Turkish.

## Turkish UI copy correctness (separate from the above — language quality, not completeness)

No typo, broken-character, inconsistent-terminology, or inconsistent-capitalization defect was found in the extensive Turkish text read throughout this session (auth flows, onboarding, dialogs, error messages, practice feedback). Diacritics are consistently and correctly used. This is scored as a genuine strength, independent of COMPAT-QA-001's completeness gap.

## Locale-aware presentation

- `QuestHistoryModal.tsx` formats dates via `toLocaleDateString(locale === "tr" ? "tr-TR" : "en-US", ...)` — correctly locale-aware.
- No raw enum/internal-identifier leakage was found in the components read (CEFR level codes render as proper display values).
- English vocabulary content is correctly never "translated" when switching UI locale — the content/UI boundary (Section 15) is respected.
