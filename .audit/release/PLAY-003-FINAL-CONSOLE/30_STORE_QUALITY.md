# Store Quality / Conversion Readiness

## Play Store Quality: 71/100

| Dimension | Score | Reasoning |
|---|---|---|
| Store copy | 13/15 | Evidence-backed, truth-checked, on-brand; -2 for no A/B-tested short-description variant |
| Screenshot quality | 12/20 | 3 real, compliant screenshots live; -8 for missing the remaining 3-5 (no device available this run) |
| Visual consistency | 9/10 | Feature graphic and icon share the app's real palette; -1 since screenshots aren't yet framed in the same visual system (raw captures) |
| Feature graphic | 7/10 | Compliant, on-brand, real assets; -3 as a first ffmpeg-composited pass, not a designer-reviewed final |
| Localization | 13/15 | 8 locales live; -2 for LLM-only translation QA (no native-speaker pass yet) |
| Metadata completeness | 6/10 | Listings/images done; category, tags, countries-explicit-confirmation, tester group still owner-UI-only gaps |
| Policy accuracy | 9/10 | No false claims anywhere; -1 pending native-speaker confirmation that translated copy makes the same claims, not stronger ones |
| Conversion clarity | 2/10 | No marketing-composition layer (headline/subheadline over screenshots) yet — raw screenshots convey real UI but weaker first-impression punch than a composed set |

## Store Conversion Readiness: 64/100

Reflects that the *substance* (truthful, evidence-backed, policy-compliant, live) is strong, but the *polish* (full screenshot set, native-reviewed translations, a marketing-composition pass, designer-refined feature graphic) is intentionally incomplete given this run's real tooling limits (no emulator, no image-generation/design tool, no professional translator).

## Status

Both scores are self-assessed against the checklist in the recovery brief, not an external benchmark. Primary lever to move both scores materially: run `.maestro/store-screenshots.yaml` on a real device to get the full screenshot set.
