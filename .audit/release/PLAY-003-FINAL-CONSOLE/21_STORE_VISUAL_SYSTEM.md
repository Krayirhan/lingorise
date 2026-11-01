# Store Visual System

Defined from the app's own real, already-shipped design tokens (`src/theme/colors.ts`, `src/theme/spacing.ts`, `src/theme/radius.ts`) — not invented separately for the store.

| Token | Value | Source |
|---|---|---|
| Background (canvas) | `#F7F4EC` (warm off-white) | `colors.canvas` |
| Primary brand | `#6B4355` (muted plum) | `colors.primary` |
| Ink / text | `#1C1B1A` | `colors.ink` |
| Accent (reward/XP) | `#F3B23F` | `colors.reward` |
| Corner radius | app's existing `radius` scale | `src/theme/radius.ts` |

## Layout rules applied (feature graphic, `23_FEATURE_GRAPHIC.md`)

- Canvas-color background (matches in-app canvas exactly — no separate "marketing palette" invented)
- Wordmark left-aligned, generous left margin; mascot right-aligned, vertically centered
- No text-over-mascot overlap; ~40px safe margin from every edge
- No AI-haze gradients, no stock-photo people, no fake review stars/ratings/rankings/badges, no artificial urgency language

## Screenshot framing

Raw device captures, no marketing device-frame chrome added (kept as **RAW REAL APP CAPTURE**, per `20_SCREENSHOT_SELECTION.md` — a separate marketing-composition pass with headline/subheadline text bands was explicitly out of scope for this run given no device was available to produce enough source material to justify building that layer yet).

## Status

EVIDENCE: READY — system defined and applied consistently to the one asset produced (feature graphic). Not yet applied to a marketing-composition screenshot layer (raw screenshots used as-is, which is Play-compliant on its own).
