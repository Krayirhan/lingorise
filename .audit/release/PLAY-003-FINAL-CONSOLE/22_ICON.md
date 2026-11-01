# Play Icon

## Source

`assets/lingorise-app-icon.png` — the app's real, already-in-use icon (referenced in `app.json`'s `icon` field, already the live EAS/app icon, not a new design).

## Validation against current Play spec

Required: 512×512, 32-bit PNG with alpha, ≤1024KB, no badges/misleading text.

Source file is 1254×1254 — not the required exact 512×512. Resized (not redesigned) via `ffmpeg -vf scale=512:512` to `.store/icon/play-icon-512.png`: confirmed 512×512, PNG color type 6 (RGBA/alpha present, matching spec), 261KB (well under the 1024KB limit). No redesign was performed, per instruction ("if compliant, reuse it") — this is the same icon, correctly sized.

## Status

EVIDENCE: READY (`.store/icon/play-icon-512.png`). **PLAY: SUBMITTED AND VERIFIED IN PLAY** — uploaded via `edits.images.upload` (en-US), committed, independently re-read via `edits.images.list` confirming 1 image present. See `24_STORE_API_DEPLOYMENT.md` for the exact endpoint (an earlier attempt in this same run used a wrong path and wrongly appeared unreachable — corrected against Google's own API reference before retrying).
