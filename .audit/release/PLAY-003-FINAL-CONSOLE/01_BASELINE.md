# Baseline

## Current exact main SHA (resolved fresh this run, not assumed)

At run start: `578c6a49b4e818e2b91beb780eaa77ba39a6cd48` (confirmed via `git fetch` + `git rev-parse origin/main`, matching the value the prompt itself cited as "known before subsequent PLAY-002 changes").

After SYSTEM_ALERT_WINDOW fix (PR #14, merged): `49057328a3ba2ddccb815732c501b0063482de96`.

**After version-baseline sync fix (PR #15, merged) — current exact main SHA: `68904b7e27ba5258521a3f9d14028ae622d9895b`** (confirmed via `git fetch` + `git rev-parse origin/main`, matching local `main` after a session-termination recovery pass on 2026-08-30).

## Replacement release (recovery run, 2026-08-30)

A prior session was interrupted mid-PLAY-003 by a revoked `gh` OAuth token. Recovery inventory found PR #15 already merged and two EAS Android production builds already existing from post-PR15 SHA `68904b7` (versionCode 3 and versionCode 4), neither yet submitted. The known duplicate versionCode-2 build (from the PR14 SHA) was confirmed unsubmitted and discarded per instruction — it is not, and must never become, the shipped artifact.

Selected replacement artifact: build `a22b0c74-2bd2-4372-a1b9-87fca3ba006f`, versionCode **4**, source SHA `68904b7e27ba5258521a3f9d14028ae622d9895b`.

Verified via `bundletool dump manifest` on the actual `.aab` (not source-only): package `com.lingorise.app`, `versionCode=4`, `versionName=0.1.0`, `targetSdkVersion=36`, `minSdkVersion=24`, **`SYSTEM_ALERT_WINDOW` absent from the merged manifest**.

Artifact SHA-256: `4ea7e7788cec9c9cdd5dcd562b598f69a2dc6335f88cb5fe48991f49ed52d0a7`.

Submitted via `eas submit` to Google Play **internal** track: submission `035fd373-fb73-4778-9f21-6664089b2cc8`, status `FINISHED`, `androidConfig.releaseStatus: COMPLETED`. Verified independently via `eas submit:list` (Android Publisher API-backed), not just the submit command's own exit code.

## Verified infrastructure (not repeated/redone)

Google Play owner `studioskrayirhan@gmail.com` → `lingorise-65cb1` → LingoRise / `com.lingorise.app`; EAS `fusturan@gmail.com` / `mfurkant` → `@mfurkant/lingorise`; service account `lingorise-play-submit@lingorise-65cb1.iam.gserviceaccount.com`; Android Publisher API enabled; EAS Google Play credential configured; automated `eas submit` proven working across two submissions now: original `8c1130bf-fcae-4b06-b035-797122527f47` (track internal, versionCode 2, completed) and replacement `035fd373-fb73-4778-9f21-6664089b2cc8` (track internal, versionCode 4, completed).

None of the above was recreated, re-authenticated, or re-verified from scratch — only read-only confirmations were performed where a specific new claim in this run depended on them (e.g., re-confirming the internal release before building on it).

**taztamam interaction: NONE**, maintained throughout this run exactly as every prior run.
