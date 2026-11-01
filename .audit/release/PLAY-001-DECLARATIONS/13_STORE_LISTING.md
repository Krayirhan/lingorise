# Store Listing Readiness

No Play Console browser/API surface exposes store-listing draft content (title, descriptions, screenshots, graphics) to this run — the Android Publisher API's `listings` resource could be queried, but doing so risks reading/asserting content that may already be owner-authored and in-progress, and this run has not been asked to inventory it. Instead, this file records what is verifiably **available as source material** versus **not producible by this run** (per Section 17: "Do not generate assets during this run").

| Item | Status | Note |
|---|---|---|
| App title | Known | "LingoRise" — consistent across `app.json`, Play API responses (`app.name` in build metadata), and the hosted privacy pages |
| Short description | **MISSING (not authored)** | Not found in any repository file; must be authored by the owner (this run should not invent marketing copy) |
| Full description | **MISSING (not authored)** | Same |
| App icon | **Present in source** | `assets/lingorise-app-icon.png`, referenced in `app.json`, already used as the EAS project icon (confirmed during `EAS-PROJECT-LINK-001`'s own `eas init` output: "Set the project icon from icon in your app config") |
| Feature graphic (1024×500) | **MISSING** | Not found in `assets/` |
| Phone screenshots | **MISSING** | Not found in `assets/`; would need to be captured from a running build |
| Category | **NOT SET (unverified)** | Requires Play Console; likely "Education" given the app's own description, but this is the owner's choice, not this run's |
| Contact email | Known | `fusturan@gmail.com` (used consistently in the hosted privacy/account-deletion pages) |
| Website | Known | `https://lingorise-65cb1.web.app/` (root, redirects to the privacy policy) — a dedicated marketing site was not found; may be acceptable as-is or may need a proper landing page depending on Play's current requirements |
| Privacy policy URL (for the listing form) | **READY** | `https://lingorise-65cb1.web.app/privacy-policy/` — live, verified |
| Countries/regions | **NOT SET (unverified)** | Owner's distribution choice |
| Release notes (for this internal release) | **MISSING** | Not authored; recommend a short "Initial internal testing build" note when the owner is ready to move beyond Internal Testing |

## Classification

**Store listing: INCOMPLETE.** Missing items are exactly: short description, full description, feature graphic, phone screenshots, category selection, countries/regions, release notes. None of these were fabricated. This is expected at this stage (Internal Testing does not require a complete public store listing — a complete listing becomes mandatory only when moving toward Production or public testing tracks).
