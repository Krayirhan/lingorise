# 14 — Localization (App UI, not store listings)

- Real dictionary-based i18n split by feature (`src/i18n/{auth,home,onboarding,practice,profile,progress}.ts` composed into `en.ts`/`tr.ts`), typed so a missing key fails typecheck rather than silently falling back — this is a genuine compile-time safety net, not a superficial translation layer.
- Two locales only: Turkish (default) and English. No `i18n-js`, `expo-localization`, `I18nManager`, or RTL handling found anywhere in `src/` — **no RTL support, no automatic device-locale detection** (locale is a manual user setting, defaulting to `"tr"`).
- UI is fully translated for both locales across all main screens (10 files consume the `copy`/locale pattern).
- **Gap:** `ErrorBoundary.tsx` hardcodes Turkish text and never consults locale — the one confirmed untranslated surface in the app.
- App content (vocabulary/questions) was not verified for TR/EN parity in this pass; the audit above covers UI chrome only.

| LOCALE | UI TRANSLATED | CONTENT TRANSLATED | RTL | FALLBACK | STATUS |
|---|---|---|---|---|---|
| English | Yes (except ErrorBoundary) | Question meanings pair TR↔EN by design (bilingual content, not a translation gap) | N/A | n/a | WORKING BUT PARTIAL |
| Turkish | Yes | Yes (native content language) | N/A | n/a | COMPLETE |
| German/Spanish/French/Italian/Portuguese/Arabic | Not present | Not present | Not present | — | NOT IMPLEMENTED |
