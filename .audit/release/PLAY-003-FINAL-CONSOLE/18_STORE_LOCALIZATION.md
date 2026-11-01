# Store Localization — 8 Locales

## App-language support audit (real, from `src/i18n/`)

Only two in-app UI languages exist in source: `src/i18n/en.ts` and `src/i18n/tr.ts`. No `de.ts`, `es.ts`, `fr.ts`, `it.ts`, `pt.ts`, or `ar.ts` exist.

| Locale | App UI | Store listing |
|---|---|---|
| en (English) | FULL APP SUPPORT | Master, live (pre-existing) |
| tr (Turkish) | FULL APP SUPPORT | STORE-ONLY was missing → now live (this run) |
| de (German) | NOT READY (no in-app translation) | STORE-ONLY LOCALIZATION (this run) |
| es (Spanish) | NOT READY | STORE-ONLY LOCALIZATION (this run) |
| fr (French) | NOT READY | STORE-ONLY LOCALIZATION (this run) |
| it (Italian) | NOT READY | STORE-ONLY LOCALIZATION (this run) |
| pt-BR (Portuguese, Brazil) | NOT READY | STORE-ONLY LOCALIZATION (this run) |
| ar (Arabic) | NOT READY | STORE-ONLY LOCALIZATION (this run) |

This is disclosed deliberately, not hidden: a user who installs from a `de`/`es`/`fr`/`it`/`pt-BR`/`ar` Play listing will see an English or Turkish in-app UI (the app's own locale detection only recognizes `en`/`tr`). This is a legitimate, common Play pattern (store-listing localization ahead of in-app localization) and is not deceptive as long as the listing copy itself doesn't claim in-app translation it doesn't have — the copy deployed does not make that claim.

## Translation pipeline used

English master (`17_STORE_MASTER_COPY.md`) → direct LLM translation into tr-TR, de-DE, es-ES, fr-FR, it-IT, pt-BR, ar, preserving the exact same positioning, feature list, and truth constraints (no fluency/ranking/fake-review claims in any locale) → character-limit check against Play's actual limits (title ≤30, short ≤80, full ≤4000 — all locales passed, shortest short-description 64 chars (ar), longest 76 chars (tr-TR); see raw values in `deploy-listings.js` output this run) → deployed.

**Honesty note on QA depth:** "linguistic QA" and "terminology QA" here mean LLM-produced, meaning- and tone-preserving translation, checked by the same model that wrote it — not independent native-speaker review. This is disclosed rather than presented as professional-grade localization. Recommend native-speaker spot-checks (especially ar, given RTL/script) before any paid marketing spend targeting these locales.

## Result

All 8 listings (en-US, tr-TR, de-DE, es-ES, fr-FR, it-IT, pt-BR, ar) are **live on Google Play**, verified by an independent post-commit `GET /edits/{id}/listings` read (not just trusting the PUT/commit response codes). See `24_STORE_API_DEPLOYMENT.md`.

## Status

EVIDENCE: READY. PLAY: SUBMITTED AND VERIFIED IN PLAY (all 8 locales).
