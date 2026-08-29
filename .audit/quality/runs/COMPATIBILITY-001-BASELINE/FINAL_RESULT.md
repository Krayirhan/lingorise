# COMPATIBILITY-001-BASELINE — FINAL RESULT (CANONICAL)

**This is the canonical Compatibility/Localization score, authoritative for Product Quality calculation, future Master Consolidation, fix planning, and Compatibility reaudits.**

Revision: `16b9aab1f776503ec52067d4f543af8ab6f2e9aa`

## Compatibility / Localization: 93/100

Confidence: MEDIUM-HIGH

Runtime compatibility evidence: **MODERATE**

| Severity | Count |
|---|---|
| P0 | 0 |
| P1 | 0 |
| P2 | 1 |
| P3 | 0 |
| P4 | 0 |

## Declared supported product surface

Android (full support, actively shipped). Turkish (default) and English interface locales, both real and switchable. English-learning content, correctly separated from UI language.

## Out-of-scope platforms

iOS (configured in `app.json` but no native project/build path exists — not shipped). Web (`react-native-web` present as a dependency but not the release focus). Neither is penalized.

## Independent reviewer verdict

**`code-reviewer` — ADJUST (minor, no score change).** Independently confirmed COMPAT-QA-001 via direct source reading of all affected files, confirmed the locale-switching mechanism is genuine and product-supported (not a fake/dev-only toggle), and confirmed correct handling elsewhere in the same files shows these are isolated misses rather than wholesale unlocalized features. Widened the finding's described scope (to include related `Alert`/`AppDialog` dialogs in the same component) without changing severity or score. Confirmed no penalization of unclaimed iOS/web support and no i18n-framework over-engineering bias.

## Canonical findings

| ID | Title | Severity |
|---|---|---|
| COMPAT-QA-001 | Multiple real components (word-detail modal, avatar picker, data-management/privacy modal and its dialogs, word-notebook) hardcode Turkish text bypassing the app's working locale system, despite English being a real, product-supported interface locale — most consequentially, the entire in-app Privacy Policy content | P2 |

## Strongest area

Turkish UI copy correctness and keyboard/system-UI compatibility — consistently well-written Turkish throughout, and correct platform-appropriate keyboard-avoidance behavior on the app's one real input-heavy screen.

## Weakest area

Localization architecture/consistency — a genuine, working dual-locale architecture undermined by a handful of components, most consequentially the Privacy Policy, that fall outside it entirely.

## Known runtime limitations

Only one Android emulator configuration was available this session; multi-device/API-level runtime verification and an actual visual switch-to-English check were not performed. This reduces confidence on the runtime-verification axis specifically but was not used to lower the score for dimensions with strong static (E2) evidence.

## Immutable evidence chain

`SUMMARY.md`, `COMPATIBILITY_MATRIX.md`, `LOCALIZATION_MATRIX.md`, and `LAYOUT_PLATFORM_MATRIX.md` in this same run directory provide full supporting detail and remain the evidence trail behind this canonical result. This file does not alter or supersede their content.

`.audit/state/FINDING_REGISTRY.md` was read only for historical reconciliation (no compatibility/localization-related historical findings exist) and was not modified.
