# Google Play Identity

## Account model (confirmed, per Section 3)

Expo/EAS identity (`mfurkant`, `fusturan@gmail.com`) and the Google Play Developer account are correctly treated as separate systems — no attempt was made to reconcile or match them.

## Play Console app existence check

**NOT VERIFIED — no access path available in this environment.**

Two possible verification paths were considered:

1. **Browser session:** `mcp__claude-in-chrome__tabs_context_mcp` returned "Browser extension is not connected" — no interactive Play Console session is reachable from this session.
2. **Google Play Android Developer API:** this API can only be queried using the very service-account credential this bootstrap run was tasked with creating — a chicken-and-egg dependency. It cannot be used to check app existence *before* it exists and has been granted Play Console access.

**This determination requires the user's own direct knowledge or a manual Play Console check** — it is not something this run can resolve from the information/tools available to it. Per Section 4's own instruction ("if no LingoRise application exists: identify this clearly before API submission setup"), this is flagged as an open question rather than assumed either way.

## Package

`com.lingorise.app` — unchanged, confirmed from the locked source revision (`b8d0687d7217f46ce28bf269b6fc6a2eb9815ae4`).
