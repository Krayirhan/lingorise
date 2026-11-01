# PLAY-003 FINAL — GOOGLE PLAY CONSOLE + STORE COMPLETION

## Overall status

**PASS WITH OWNER ACTIONS REMAINING.** Recovery was already complete going into this run (see the recovery report earlier in this session). This run completed everything technically automatable from the current state, and stopped only at genuine Console-UI-only or owner-judgment boundaries.

## Current release

`com.lingorise.app`, internal track, `0.1.0` / versionCode **4**, status `completed`. Build `a22b0c74-2bd2-4372-a1b9-87fca3ba006f`, source SHA `68904b7e27ba5258521a3f9d14028ae622d9895b`, SHA-256 `4ea7e7788cec9c9cdd5dcd562b598f69a2dc6335f88cb5fe48991f49ed52d0a7`, targetSdk 36, `SYSTEM_ALERT_WINDOW` absent (artifact-verified). Submission `035fd373-fb73-4778-9f21-6664089b2cc8`.

## Play declarations

EVIDENCE: READY (Ads, App Access, Content Rating, Data Safety, Account Deletion, Government, Financial, Health — `PLAY-001-DECLARATIONS/`). PLAY: **OWNER UI REQUIRED** for all of them — confirmed this run, via the API's own discovery document, that no v3 write endpoint exists for any of these declaration forms. Markdown evidence was never conflated with actual Play submission.

## Target audience

Owner-specified: 5-and-under NOT targeted; 6-8/9-12/13-15/16-17/18+ targeted. EVIDENCE: READY. PLAY: OWNER UI REQUIRED (same API limitation).

## Families / Data Safety / Android permissions

Families readiness and Data Safety matrices unchanged and still accurate (`07_FAMILIES_READINESS.md`, `08_DATA_SAFETY.md`). Android permissions: `14_ANDROID_PERMISSIONS.md` + `15_SYSTEM_ALERT_WINDOW.md`, artifact-verified this run — PASS.

## Store category / tags / contact

Contact email correct, verified live, no change needed. Category (Education) and tags: target identified, **OWNER UI REQUIRED** — no writable API field exists (confirmed via `edits.details` response shape).

## English listing

Already live before this run (title, short & full description) — verified, unchanged, no re-push needed.

## 7 additional locales (tr-TR, de-DE, es-ES, fr-FR, it-IT, pt-BR, ar)

**SUBMITTED AND VERIFIED IN PLAY** this run — translated from the English master, all within Play's character limits, deployed via `edits.listings.update` → validate → commit, independently re-verified by reading them back. LLM-quality translation, not native-speaker-reviewed; disclosed as such.

## Screenshots

3 real, Play-compliant screenshots (1080×1920, no alpha, correct ratio) **uploaded and verified live** on the en-US listing. Only 3 of the target 6-8 — no Android emulator was available in this session to capture the rest.

## Screenshot automation

`.maestro/store-screenshots.yaml` implemented (real flow, reuses the proven `smoke.yaml` navigation path), committed via PR #16. Not yet run end-to-end (no device); ready for the next session/CI run with a booted emulator.

## Icon

Play-compliant 512×512 icon (resized from the app's real existing icon, not redesigned) **uploaded and verified live**.

## Feature graphic

1024×500 compliant candidate, composed from real brand assets (wordmark + mascot) **uploaded and verified live**. Flagged as a first-pass candidate worth a designer/owner taste review, not a final polished asset.

## Release notes

English + Turkish drafted from real git history, factual, no dev jargon. Not yet attached to a release (release notes apply prospectively to the *next* rollout, not retroactively to the already-completed versionCode 4).

## Countries

**VERIFIED IN PLAY**: production track carries no country restriction — worldwide, as instructed.

## Internal Testing / tester group

Internal track confirmed live at versionCode 4. Testers: confirmed empty via API — **OWNER ACTION REQUIRED** to attach the "Test" list or specific tester identities; none were invented.

## Closed Testing

**NOT VERIFIED** — genuinely no API surface exists to determine whether Google's mandatory closed-testing gate applies to this developer account. **OWNER ACTION REQUIRED**: check Play Console's Publishing overview banner.

## Play App Signing

**NOT VERIFIABLE VIA API** — confirmed authoritatively via the API's own discovery document that no read/get method exists for signing certificates (only KMS-specific `enrollApp`/`rotateAppSigningKey`, neither called). **OWNER ACTION REQUIRED**: Console → Setup → App signing.

## Store API deployment

8/8 locale listings + 5 images (icon, feature graphic, 3 screenshots) live-deployed and independently re-verified this run. See `24_STORE_API_DEPLOYMENT.md` for the full method, including a self-caught and corrected path mistake (extra `/images/` segment) found by checking Google's authoritative discovery document rather than assuming the first 404 was a real limitation.

## Dashboard rescan

Performed; no new automatable surface unlocked (`32_FINAL_DASHBOARD_RESCAN.md`).

## Store quality / conversion readiness

71/100 and 64/100 respectively — substance is strong (truthful, live, evidence-backed); polish is capped by this run's real tooling gaps (no emulator, no design tool, no professional translator).

## Production automation

Architecture documented end-to-end through Internal Testing, every stage proven working. Production rollout intentionally not implemented.

## Production rollout

**NO.**

## Remaining owner actions (only genuinely unavoidable ones)

1. Play Console → Publishing overview: confirm whether mandatory Closed Testing applies, and if so its current tester-count/duration progress.
2. Play Console → Setup → App signing: confirm enrollment + record public SHA-1/SHA-256 (no API path exists).
3. Play Console → Store settings: set category (Education) and pick real current tags.
4. Play Console → attach the "Test" tester list (or supply specific emails/a Google Group) to the internal track.
5. Boot an Android emulator (locally or in CI) and run `maestro test .maestro/store-screenshots.yaml` to capture the remaining 3-5 screenshots.
6. Merge PR #16 once CI passes (in progress as of this report).
7. (Standing, unchanged) Privacy Policy field remains owner-managed; not touched.

## Next action

Merge PR #16 (`release/play-003-store-automation`) once its CI checks finish passing.
