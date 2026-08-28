Current Run: CONSUMER-002-REAUDIT
Current Consumer Appeal: 86/100
AI/Template Risk: 14/100
Rubric: CONSUMER-RUBRIC-v1.0
Target Fit: STRONG
Confidence: HIGH

Delta from previous run: +16 (70 → 86)
Delta from baseline: +16 (70 → 86)

Open high-impact findings:
- CD-004: Memrise already uses a similar "garden-growth" metaphor — competitive-differentiation dilution risk — OPEN (positioning-level, no UI fix planned this round)
- CD-005: XP no longer visible anywhere on Practice Hub after CD-002's duplicate-row removal (Level/Streak were genuinely duplicate with the top bar, XP was not) — OPEN (new, LOW impact)

Closed since baseline:
- CD-001: Native unstyled system AlertDialogs (exit-practice, reset-data, reset-success) — CLOSED (branded AppDialog, verified real-device)
- CD-002: Practice Hub led with configuration before the motivating hero CTA, plus duplicate stat-pill row — CLOSED (hero-first hierarchy, duplicate row removed, verified real-device)
- CD-003: Sprig mascot absent from Profile and Onboarding steps 2-3 — CLOSED (mascot added, 1→2→3→4 continuity verified real-device)

Top opportunities (next round):
1. Home's first-3-second visibility (daily quest/word of the day requires scroll) — largest single remaining score loss
2. Profile's settings-list body still feels generic beneath the new mascot accent
3. CD-004 mechanism-level differentiation work (not a single UI fix)

Protected strengths:
- Calm/non-punitive learning design (non-shading progress bar, water-drop wrong-answer state)
- Plum/cream/gold palette (reinforced by CD-001's dialog polish reusing the same plum token)
- Sprig mascot design and voice (reinforced by CD-003's wider consistent presence)

Last audited revision: f578c923e587fddc984eedd6b18e38af07d11ace (main, HEAD = origin/main, working tree clean except expected unrelated untracked evidence/asset files)
Last audit date: 2026-08-28
