# Mandatory Closed Testing Requirement

## Determination

**NOT VERIFIED** via API — no Android Publisher API v3 resource exposes an app's current Closed Testing / production-access-gate requirement or timer status. This is only shown as a banner/checklist on Play Console's Policy → "App content" / Publishing overview pages for the specific developer account and app.

## Why this can't be inferred from history

Google's mandatory closed-testing-before-production-access policy applies per developer account based on account age, prior app publishing history, and app category — none of which are queryable via this API. Guessing would risk both a false "applies" (unnecessary owner work) and a false "does not apply" (a blocked production rollout later).

## Owner has already agreed to comply (per instruction)

If it applies: the concrete mechanics (14-consecutive-day, 12-tester-opt-in-and-active-use requirement, as of Google's current published policy) can be automated once the requirement is confirmed — the same `edits.tracks`/`edits.testers` API calls already proven working in `24_STORE_API_DEPLOYMENT.md` would configure a closed track and testers; the 14-day clock itself is not something any automation can accelerate.

## Status

APPLIES / DOES NOT APPLY: **NOT VERIFIED.** Owner action: open Play Console → the app → check the "Publishing overview" / "App content" testing-requirement banner directly; report back what it says (required tester count, duration, current progress if any) so this can be automated from that point forward.
