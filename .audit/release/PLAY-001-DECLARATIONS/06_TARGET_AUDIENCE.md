# Target Audience

## Evidence available

- App is an English-vocabulary-learning tool for Turkish speakers (per `CLAUDE.md`'s own product description) — content and UX are general-audience educational, not specifically child-directed (no child-specific characters, COPPA-style simplified UI, or marketing found).
- Account creation uses standard email/password Firebase Authentication with no age-gate or parental-consent flow.
- No evidence in source of an explicit intended age range (no onboarding age question, no content-maturity branching).

## Why this cannot be settled from evidence alone

Google Play's Target Audience declaration has direct legal consequences (COPPA/Families Policy obligations, ad and data-collection restrictions for child-directed apps) that hinge on business/marketing intent, not just technical capability — an app *usable* by teenagers or older learners is not automatically "general audience" in Play's own policy sense, and this is explicitly a judgment call this run must not make unilaterally (per Section 3's "never guess policy/legal answers").

## Consequence if a child age range were selected

If any age range under 13 (or under 16 in some regions) were selected, the app would become subject to Google Play's Families Policy: mandatory Data Safety re-review under child-directed rules, restrictions on any future ad/analytics SDK, a Families-specific content rating pathway, and additional store-listing requirements. Given the app currently collects optional account-linked data (email, Firebase UID) with standard (non-child-specific) authentication, selecting a child-inclusive audience without also implementing COPPA-appropriate consent flows would itself become a compliance gap — not a mere declaration checkbox.

## Classification

**Target Audience: OWNER CONFIRMATION REQUIRED.** Recommend, based on the app's actual current design (standard email auth, no parental consent flow, general-audience content) — an audience declaration of **13+ (or the region-equivalent "not primarily for children")** is the option most consistent with what the app actually does today, but the final selection must be made by the account owner, not inferred here.
