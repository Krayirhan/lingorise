# Developer Account Production Requirements

## What was checked

The Android Publisher API has no endpoint exposing a developer account's "production access eligibility" or "mandatory closed testing" status — this information exists only in the Play Console UI (Publishing overview / App content → Testing page), which requires an interactive browser session this run does not have.

## What is known

Google's 2023+ policy requires **new personal Play Developer accounts** to run a closed test with a minimum tester count (historically 12, later revised) for a minimum duration (historically 14 days) before being granted production access for a first app. This requirement does **not** apply to already-established developer accounts in good standing, and does not apply uniformly to organization-type accounts.

This run has no verified evidence of `studioskrayirhan@gmail.com`'s Play Developer account age, type (personal vs. organization), or whether it has previously published an app — none of this was assumed.

## Classification

**MANDATORY CLOSED TESTING: NOT VERIFIED.**

Per Section 16's own explicit instruction, Internal Testing is **not** to be assumed equivalent to Closed Testing for satisfying this requirement even if it applies — Google's policy specifically requires a **Closed** test track (not Internal) with its own minimum tester/duration thresholds.

## Owner action required

Check Play Console → **Publishing overview** (or the app's own "Set up your app" checklist) for a specific note about a production-access testing requirement. If present, it will state the exact tester-count and day-count thresholds currently in effect for this account. Report that back and this run can help set up the required Closed Testing track without needing to guess the numbers.
