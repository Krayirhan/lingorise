# Families Readiness Audit

Triggered because the final Target Audience decision includes ages 6–8 and 9–12.

## Current age model (owner-confirmed, independently verified in source)

The app does not request age, birth date, or age range anywhere — confirmed via source search (`age`/`birthdate`/`parental`/`consent`/`COPPA` patterns found no age-collection UI, no consent flow, no age-gate component in `src/features/onboarding/` or anywhere else). **UNKNOWN AGE is the app's genuine current architecture**, treated here as a real condition, not an exemption.

## Age readiness matrix

| Age | Targeted | UX ready | Families ready | Data ready | Blocker | Final |
|---|---|---|---|---|---|---|
| 5 and under | NO | N/A | N/A | N/A | N/A (excluded, permanently) | **NOT TARGETED** |
| 6–8 | YES | YES — core practice/exam flow requires only tapping/reading, no text input needed for the core loop, age-appropriate | **FINDINGS (see below)** | **FINDINGS (see below)** | Account creation collects email with no age-gate or parental-consent flow | **BLOCKED pending owner/legal decision — see below** |
| 9–12 | YES | YES | **FINDINGS** | **FINDINGS** | Same | **BLOCKED pending owner/legal decision** |
| 13–15 | YES | YES | YES (COPPA's under-13 threshold does not apply; most jurisdictions' "teen" data rules are materially less restrictive than child rules and are satisfied by this app's existing minimal, disclosed, deletable data model) | YES | None found | **READY** |
| 16–17 | YES | YES | YES | YES | None found | **READY** |
| 18+ | YES | YES | YES | YES | None found | **READY** |

## The actual finding (not invented, not overstated)

**Guest mode itself is genuinely Families-safe as-is**: fully local, zero data collection, zero network transmission of personal information (`01_DATA_SAFETY.md`'s guest-mode row). A 6–12-year-old using LingoRise as a guest, never creating an account, is not exposed to any data-collection concern at all.

**The gap is specifically the account-creation path**: `src/services/firebase.ts`'s standard email/password sign-up has no age question, no branching for a child-age user, and no parental-consent mechanism of any kind. If a user identified (by Play's Families framework) as being in the 6–8 or 9–12 declared band creates an account, the app collects an email address (personal information) with no COPPA-compliant verifiable-parental-consent flow — this is a real compliance gap, not a hypothetical one, given the account-creation code path is generic and undifferentiated by age.

## Why this cannot be resolved by this run alone

Google Play's Families Policy compliance for an app targeting under-13 users is not a checkbox — it requires either: (a) the app never collects personal data from users in that age band (which would mean gating account-creation behind an age/parental check for the declared child audience), or (b) implementing an actual COPPA-compliant consent flow. Neither exists today. Building one is real product/engineering work (the "parent-created protected child account" vision in `16_...`'s own owner-stated future plan) — not a same-run fix, and this run must not invent that it already exists.

## Recommendation (not a unilateral decision)

Two honest options exist, and the choice is the owner's:
1. **Declare only 13–15, 16–17, 18+ as targeted now**, ship account creation as-is (fully compliant for this age range), and treat 6–8/9–12 targeting plus a real parental-consent flow as a genuine future release (matching the owner's own stated "future vision" framing in Section 16).
2. **Keep 6–8/9–12 in the declaration now**, and treat implementing a minimal COPPA-compliant gate (e.g., requiring guest-mode-only for any user who indicates a child age, with account creation restricted to an adult-confirmed context) as a **mandatory pre-submission engineering task** before this specific declaration can be truthfully submitted.

This run does not choose between these — it is exactly the kind of legal/product decision Section 64 forbids inventing.

## Classification

**CHILD/UNKNOWN-AGE DATA SAFETY: FINDINGS.**
**Families compliance for 6–8/9–12: OWNER/LEGAL INPUT REQUIRED** — a real, current gap, not a false alarm and not overstated as unsolvable; guest mode alone is already compliant, only the account-creation path needs a decision.
