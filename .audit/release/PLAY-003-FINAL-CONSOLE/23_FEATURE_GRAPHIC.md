# Feature Graphic

## Candidate produced

`.store/feature-graphic/feature-graphic-1024x500-v1.png` — 1024×500 (exact spec), 24-bit PNG with alpha flattened out (format `rgb24`, confirmed color type 2 — required, since Play's feature-graphic spec is "no alpha"), 101KB.

Composed via `ffmpeg` from three real existing brand assets — no image was generated from scratch, nothing fabricated:
- Background: solid `#F7F4EC` (the app's real canvas color, `21_STORE_VISUAL_SYSTEM.md`)
- `assets/lingorise-wordmark-ai.png` (existing wordmark), left-aligned
- `assets/sprig-mascot-idle-transparent.png` (existing mascot art, transparent background), right-aligned

## Content check

Represents LingoRise's real brand mark and mascot only. No fake ratings, rankings, awards, Google Play badges, or unsupported claims — just wordmark + mascot on brand background, per policy ("avoid prominent branding that duplicates the icon" is a soft guideline about not just re-showing the icon large; a wordmark + mascot pairing is a distinct, standard feature-graphic pattern, not a icon duplicate).

## Honesty note

This is a **v1 candidate**, produced with `ffmpeg` compositing (no design tool, no image-generation model available in this environment) — functional and policy-compliant, but a genuine graphic designer or a proper design tool pass could likely improve it further (typography kerning, mascot scale/pose choice, possible tagline addition). Flagged for owner visual-taste review rather than declared as final/best-possible.

## Status

EVIDENCE: READY (compliant candidate exists). **PLAY: SUBMITTED AND VERIFIED IN PLAY** — uploaded via `edits.images.upload` (en-US), committed, independently re-read confirming 1 image present. See `24_STORE_API_DEPLOYMENT.md`.
