Current Run: CONSUMER-003-REAUDIT
Current Consumer Appeal: 89/100
AI/Template Risk: 14/100
Rubric: CONSUMER-RUBRIC-v1.0
Target Fit: STRONG
Confidence: HIGH

Delta from previous run: +3 (86 → 89)
Delta from baseline: +19 (70 → 89)

Open findings:
- CD-004: Memrise already uses a similar "garden-growth" metaphor — competitive-differentiation dilution risk — OPEN (positioning-level, no UI fix planned)
- CD-005: XP no longer visible anywhere on Practice Hub after CD-002's duplicate-row removal — OPEN (LOW impact)
- CD-006: The "Hesap & Bulut Senkronizasyonu" Profile group label reads slightly more technical/corporate than the app's warm garden-metaphor tone — OPEN (new, LOW impact)

Closed since baseline:
- CD-001: Native unstyled system AlertDialogs — CLOSED (branded AppDialog, re-verified real-device this run, no regression)
- CD-002: Practice Hub config-before-CTA + duplicate stat-pill row — CLOSED (re-verified real-device this run, no regression)
- CD-003: Sprig mascot absent from Profile and Onboarding steps 2-3 — CLOSED (re-verified real-device this run, no regression)

Top opportunities (next round):
1. Home's Word-of-the-Day card still needs a small scroll to see in full
2. Auth's excessive empty vertical space — never addressed
3. CD-004 mechanism-level differentiation work (not a single UI fix)

Protected strengths:
- Calm/non-punitive learning design (non-shading progress bar, water-drop wrong-answer state)
- Plum/cream/gold palette
- Sprig mascot design and voice
- Home's now-visible daily content (quests + word of day) right after the hero
- Profile's now-grouped identity/preferences hierarchy

Last audited revision: 16b9aab1f776503ec52067d4f543af8ab6f2e9aa (main, HEAD = origin/main, working tree clean except expected unrelated untracked evidence/asset files)
Last audit date: 2026-08-28
