# Compatibility / Localization Targeted Reaudit

## In-app Privacy Policy (GLOBAL-QA-012, claimed partial closure)

Independently read `src/features/profile/components/DataManagementCard.tsx`'s Privacy Policy modal in full, and `src/i18n/profile.ts`'s EN (`profileEn`) and TR (`profileTr`) dictionaries:

- Every Privacy Policy text node (`privacyModalTitle`, 4 section title/body pairs, web-link label/text) is routed as `copy.profile?.<key> || "<original Turkish literal>"` — a same-literal-fallback pattern that preserves current (Turkish) behavior if a key were ever missing, confirmed structurally safe (never silently renders `undefined`).
- **EN and TR are genuinely distinct, real translations**, not the same string duplicated: e.g. `privacyPolicySection2Body` EN reads "When you create an account, your progress is securely backed up to Firebase Firestore. You can permanently delete your account and all your cloud data at any time." vs. TR "Hesap oluşturduğunuzda ilerlemeniz Firebase Firestore üzerinde güvenli biçimde yedeklenir. İstediğiniz an hesabınızı ve tüm bulut verilerinizi kalıcı olarak silebilirsiniz." — independently confirmed for all 4 sections plus the modal title and reset-dialog title. No interpolation is used in any of these strings (plain text), so no broken-interpolation risk exists.
- `resetDataDialogTitle` and `resetDataConfirmSynced` (new this sprint) are also present and distinct in both locales.
- No untranslated/missing key found in either dictionary for the Privacy-Policy-specific key set (7 title/body pairs + title + 2 web-link keys + reset-dialog title = 11 keys, all present in both `profileEn` and `profileTr`).

**IMPORTANT scope check:** confirmed the sprint's own artifacts do NOT conflate this with public Privacy Policy hosting — `FINAL_RESULT.md`, `10_RESIDUAL_RISK.md` both explicitly state "Does not block Sprint 3's RELEASE-QA-003 closure (that concerns public hosting, not remaining in-app strings)" and "Sprint 3's own scope (public Privacy Policy hosting...) — untouched." `PRIVACY_POLICY_URL` in `DataManagementCard.tsx` is unchanged by this sprint and still points to the pre-existing (separately tracked, RELEASE-QA-003/GLOBAL-QA-011) placeholder URL — the in-app modal text and the external hosting problem are correctly kept distinct.

**Status: In-app Privacy Policy localization — genuinely CLOSED**, no false-closure risk found.

## Remaining hardcoded strings — independently verified to still exist

Directly inspected the three surfaces Sprint 2 claims are deferred:

- **Avatar picker** (`src/features/profile/components/AvatarPicker.tsx`): hardcoded Turkish confirmed present — `"Avatar Seç:"` (label), avatar option labels `"Işık"`, `"Çiçek"`, `"Doğa"`, and an accessibility-label template `` `${av.label} avatarı` `` (which additionally bakes Turkish into a screen-reader-facing string). None of these route through `copy`.
- **Word-detail modal** (`src/features/home/components/WordDetailModal.tsx`): `"Türkçe Karşılığı"` hardcoded (no `copy` fallback at all, unlike its sibling `wordDetailExample`/`wordDetailPracticeBtn` lines in the same file, which DO use `copy.home?.xxx || "..."`) — confirming this specific string, not the whole file, was missed.
- **Word-notebook** (`src/features/progress/components/WordNotebookModal.tsx`): hardcoded Turkish confirmed present — search placeholder `"Kelime veya Türkçe anlam ara..."`, level-filter `"Tümü"`, and a CTA `"Bu Kelimeyi Çalış →"` with no `copy` fallback.

These are real, current, user-visible strings (not developer-facing/internal) — confirming GLOBAL-QA-012's PARTIAL status is accurate, not falsely closed and not falsely left open either (i.e., not over-claiming remaining scope beyond what's actually there). No attempt found to inflate this into every possible hardcoded string in the app (e.g., `DataManagementCard.tsx`'s own sync-status subtitle strings, `"Tüm cihazlarında otomatik eşitleniyor."`/`"Verilerin bu cihazda güvenle saklanıyor."`, are also hardcoded and untouched — these are a genuinely separate, smaller pre-existing gap not claimed as part of this sprint's scope either way; noted here for completeness, not scored as a new finding since it is neither newly introduced nor part of the audited surface).

**GLOBAL-QA-012 status: PARTIAL, confirmed accurate.** Historical P2 severity remains justified — English-locale users still see real Turkish text on 3 concrete surfaces, not merely a trivial/cosmetic residual.

## Compatibility score

Baseline 93/100 (COMPAT-001-BASELINE), held down primarily by COMPAT-QA-001 (P2, hardcoded Turkish across several surfaces, of which the Privacy Policy was the single most-cited example per Master). The most legally/consumer-sensitive portion (Privacy Policy content) is now genuinely closed; roughly 3 of an estimated 4+ affected surfaces remain open.

**Current score: 95/100** (+2)
**Confidence: HIGH** — both the closed and the still-open portions were independently, directly verified by reading the actual component/dictionary source, not inferred from the sprint's own claims.

**Source of the +2, clarified per independent reviewer request:** the delta reflects genuine closure of the single most-cited, most legally/consumer-sensitive example within COMPAT-QA-001's original finding (the Privacy Policy content) — real, distinct, verified EN translations for 11 keys — while ~3 other concrete surfaces (avatar picker, word-detail, word-notebook) remain open. This is deliberately NOT a proportional 1-of-4-surfaces credit (which would suggest a smaller delta) nor a full-closure credit (which the still-open surfaces rule out) — it reflects that the closed portion was Master's own specific reason for elevating this finding's priority (its output gates Sprint 3's GLOBAL-QA-011), while the finding's overall severity (P2) and PARTIAL status are both left unchanged.

Supported release focus (Android, TR/EN) respected — no iOS/web-specific penalty applied beyond the original support model.
