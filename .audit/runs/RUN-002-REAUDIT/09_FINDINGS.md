# 09 — Findings (REAUDIT)

Full current status lives in `.audit/state/FINDING_REGISTRY.md` (authoritative, updated live through each FIX pass). This document summarizes the lifecycle verification required by `14_REAUDIT_PROTOCOL.md` §5 and documents the 3 new findings discovered during this session's `ACT-ACC-001` pass.

## Finding lifecycle verification (all 17 findings, baseline + new)

| ID | Severity | Status | Verified how |
|---|---|---|---|
| CORE-001 | P1 | CLOSED | Re-read `streak.ts` — fix present; re-ran the 2 new tests — pass. |
| DATA-001 | P1 | **PARTIAL** (not closed) | Re-read `useUserProgress.ts` — structural fix present and sound; the finding's own acceptance criteria (real two-device signed-in test) was never performed — correctly kept open rather than claimed closed on code-change alone, per `13_FIX_PROTOCOL.md`'s "code changes alone do not close it." |
| CORE-002 | P2 | CLOSED | Re-ran the 9 new tests — pass. |
| DATA-002 | P2 | CLOSED | Re-read `storage.ts`/`useUserProgress.ts`/`AppNavigator.tsx` — full chain present and consistent. |
| REL-001 | P2 | CLOSED | Re-read `refresh()` — try/catch present. |
| ARCH-003 | P2 | CLOSED | Re-confirmed file sizes (337/292 lines) and re-verified on-device rendering this reaudit pass matches pre-refactor screenshots. |
| CORE-003 | P3 | CLOSED | Re-ran the 6 new tests — pass. |
| ARCH-001 | P3 | CLOSED (scope corrected) | Confirmed `i18n/formatters.ts` deleted, `tsc`/tests clean; confirmed `services/spacedRepetition.ts` correctly left alone (live, used by tests). |
| ACC-001 | P3 | **PARTIAL** (not closed) | Real TalkBack + dynamic-type testing performed and 3 sub-bugs found/fixed (see below), but the finding's full original scope (5 flows, Scanner, reduceMotion) remains partially untested — correctly kept `PARTIAL`, not claimed `CLOSED`. |
| DEPLOY-001 | P3 | ACCEPTED_RISK | CI confirmed fully removed (`gh run list` shows no new runs after the removal push); status correctly reflects a deliberate accepted risk, not a fix. |
| ARCH-002 | P4 | CLOSED | Re-read both corrected import statements. |
| ARCH-004 | P4 | CLOSED (scope corrected) | Confirmed `getDailyTaskCollection` removed; confirmed `firestore.rules`/`firestoreRules.test.ts` deliberately untouched (rule is live-tested, not orphaned). |
| SEC-002 | P4 | CLOSED | Re-read `.env.example` — placeholders confirmed. |
| DEP-001 | P4 | ACCEPTED_RISK | `npm audit` output and dependency-chain tracing re-confirmed this session. |
| **ACC-002** (new) | P4 | CLOSED | New finding, found and closed within `FIX-2026-08-25-07` — see below. |
| **ACC-003** (new) | P3 | CLOSED | New finding, found and closed within `FIX-2026-08-25-07` — see below. |
| **ACC-004** (new) | P3 | CLOSED | New finding, found and closed within `FIX-2026-08-25-07` — see below. |

**No previously-closed finding was found to have regressed** (see `13_REGRESSION_REPORT.md`).

---

## New findings this reaudit cycle (discovered and closed within the same FIX pass, `FIX-2026-08-25-07`)

### ACC-002 — Hint button malformed accessibility label
- Severity: P4 · Domain: Accessibility · Status: CLOSED · Evidence: `uiautomator dump` before/after
- Problem: `src/features/practice/components/WordPrompt.tsx`'s hint-toggle `Pressable` had no `accessibilityLabel`; RN's default child-concatenation behavior (empty-named icon + text) produced a malformed `", İpucu"` label (leading comma) as read by TalkBack.
- Fix: explicit `accessibilityRole="button"` + `accessibilityLabel` added.
- Verification: re-dumped accessibility tree shows clean `content-desc="İpucu"`.

### ACC-003 — Audio/pronunciation button had zero accessible name
- Severity: P3 · Domain: Accessibility · Status: CLOSED · Evidence: `uiautomator dump` before/after
- Problem: same file's pronunciation-toggle `Pressable` had no `accessibilityLabel` and no text child with content — TalkBack would announce only a generic "Button," exactly the failure mode `docs/roadmap/09-accessibility.md`'s own 9.1 checklist warns against.
- Fix: wired the already-existing (previously unused in this component) `copy.game.listenTooltip`/`playingAudio` i18n strings into `accessibilityLabel`.
- Verification: re-dumped tree shows `content-desc="Telaffuzu dinle"` / `"Seslendiriliyor..."`.
- Severity note: P3, not P4 — a completely silent interactive control (not merely awkwardly-worded) is a more serious accessibility gap than a malformed-but-present label.

### ACC-004 — Mascot speech bubble breaks a word mid-character at maximum system font scale
- Severity: P3 · Domain: Accessibility · Status: CLOSED · Evidence: cropped screenshot comparison, 3 build/install/verify cycles
- Problem: `src/features/home/components/GardenHeroCard.tsx`'s home-screen mascot speech bubble rendered "Hazırsan başlayalım!" as "Hazırsan b" / "aşlayalım!" at `font_scale=2.0` (Android's accessibility maximum). Root cause: `adjustsFontSizeToFit` only shrinks on line-count overflow; the mid-word break still fit within `numberOfLines={3}`, so the shrink logic never engaged.
- Fix attempt 1 (`minimumFontScale={0.5}`) — verified **ineffective** via rebuild + redump, correctly not claimed as a fix.
- Fix attempt 2 (`maxFontSizeMultiplier={1.3}`) — verified effective via a second rebuild + cropped screenshot comparison at the same 2.0× scale.
- Severity note: P3 — this is a genuine WCAG 1.4.4 (Resize Text)-relevant defect: content became less readable, not more, at a user's chosen larger text size.

---

## Correction log (evidence errors from RUN-001-BASELINE fixed during FIX passes, not new product defects)
- `ARCH-001`'s original scope wrongly named `src/services/spacedRepetition.ts` as dead code (search only covered `src/`, missed `tests/`). Corrected in-place in `RUN-001-BASELINE/09_FINDINGS.md` with the error and correction both disclosed, per Constitution C12 ("uncertainty must be explicit") rather than silently rewritten.
