# 13 — UI Consistency &amp; Accessibility

## UI/UX consistency
- Central design-token system exists (`src/theme/{colors,spacing,radius,typography,tokens}.ts`) — colors, spacing, type scale, icon/component sizes, shadows are all tokenized, not ad hoc per-screen.
- Toasts and skeleton loaders are shared components, used consistently.
- **Inconsistency:** ErrorBoundary bypasses the token/i18n system entirely with hardcoded Turkish strings (see 12_ERROR_RELIABILITY.md).
- A WCAG-AA contrast fix (A11Y-QA-003) is verifiable directly in `theme/colors.ts` and asserted by a real computed-contrast-ratio test (muted text now ≥4.5:1 against both canvas and surface backgrounds; was 4.10:1 before the fix).

## Accessibility — rating: ACCEPTABLE
- `accessibilityLabel` used in 39 files, `accessibilityRole` in 37, `accessibilityState` in 10, `accessibilityLiveRegion` in only 4 (out of 61 `.tsx` files) — solid on primary interactive controls, thin on live-region announcements for dynamic content.
- `reduceMotion` handling is reasonably systemic (26 files reference it; it's a stored user setting, toggle exists in Profile, and `SkeletonLoader` explicitly stops its infinite pulse loop when reduce-motion is on).
- Dynamic font scaling: only 1 file references font-scaling controls — weak explicit handling, likely relying on RN platform defaults.
- The test suite's "ACC-001" block is a source-inspection scanner (asserts specific onboarding/modal/skeleton files contain the right accessibility props) rather than a full accessibility-tree audit — real but narrow coverage, manually enumerated per component rather than exhaustive across all 61 screens/components.

**Net: strong on the specific components the tests target (onboarding flow, level-promotion modal, skeleton loader), thinner and unverified everywhere else in the app.**
