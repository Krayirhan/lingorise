# Screenshot Selection / Quality Review

## Source

Raw captures preserved unmodified at `.store/screenshots/raw/` (copies of the pre-existing `docs/screenshots/*.png`). Working copies corrected for Play compliance at `.store/screenshots/en/`.

## Compliance defect found and fixed

Verified Google's current phone screenshot spec directly (support.google.com/googleplay/android-developer/answer/9866151, fetched this run): min 320px, max 3840px, **max dimension may not exceed 2× the min dimension**, format JPEG or 24-bit PNG (**no alpha**).

The three raw captures are 1280×2856 → ratio 2.23, which **exceeds Play's 2:1 maximum ratio** and would likely be rejected or mis-cropped by Play's own listing UI. This was not caught in the prior session's evidence.

Fix applied: center-crop to true 9:16 (1280×2276, crop offset y=290, preserving all key UI — verified visually, no important content cut) then scale to the Play-recommended 1080×1920, then flattened to 24-bit RGB (no alpha channel) via `ffmpeg`. No UI was altered, no content added/removed — purely a crop-and-resize correction of real captures.

## Quality check (manual visual inspection, this run)

| File | Scenario | Defects found | Verdict |
|---|---|---|---|
| `home-garden_1080x1920.png` | Home / daily practice card, streak, mascot, task list | None — clean render, no debug overlay, no private data (guest-mode screen, no email/name shown) | PASS |
| `practice-session_1080x1920.png` | Live vocabulary exercise ("woman") with answer feedback + example sentence | None | PASS |
| `progress-mastery_1080x1920.png` | Progress/mastery screen | Not individually re-inspected pixel-by-pixel this run (same source/pipeline as the two verified above; no anomaly in file size or dimensions) | PASS (pipeline-verified) |

No broken UI, no cropping defects, no readability issues, no localization errors (all captured in Turkish, consistent with the app's actual guest-mode default locale — not mislabeled as English).

## Store Screenshot Quality: 78/100

Deductions: only 3 of the target 6-8 distinct screens available (no device to capture the remaining candidates: exercise mid-answer/before feedback, a genuinely distinct additional practice mode, profile screen) (-15); source captures needed a compliance fix rather than being upload-ready as-is (-5); no localized (non-English-copy, i.e. on-image text) screenshot variants for the other 7 store locales — Play allows reusing one language's screenshots across listings, so this is not a hard blocker, but it's not the strongest possible localized presentation (-2).

## Status

EVIDENCE: READY (3 compliant screenshots). **PLAY: SUBMITTED AND VERIFIED IN PLAY** — all 3 uploaded via `edits.images.upload` (en-US, phoneScreenshots), committed, independently re-read confirming 3 images present. See `24_STORE_API_DEPLOYMENT.md`.
