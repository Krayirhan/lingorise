# 07 — A1–C2 CEFR Level System

| Level | Content exists | isLevelReady (≥100 Qs) | User can access | Practice works | Exam available (≥50 Qs) | Tested |
|---|---|---|---|---|---|---|
| A1 | Yes (327) | Yes | Yes (default) | Yes, full sessions | Yes, seats full 60Q exam | Yes |
| A2 | Yes (254) | Yes | Yes | Yes | Yes | Yes |
| B1 | Yes (5, thin) | **No** | Selectable in LevelSwitcher (not blocked), UI marks "coming soon" | Only 1 tiny session then exhausted | **No** (5&lt;50) | Yes, explicitly asserted as the thin/under-provisioned case |
| B2 | Yes (4, thin) | No | Same as B1 | Same as B1 | No | Same code path as B1, not individually asserted |
| C1 | Yes (4, thin) | No | Same | Same | No | Not individually asserted |
| C2 | Yes (3, thin) | No | Same | Same | No | Not individually asserted |

Level progression/unlock machinery (`evaluatePromotion`, `getNextLevel`, `assessLevelChoice`) is generic and level-agnostic — nothing in the promotion code blocks a user from selecting an under-provisioned level early; `assessLevelChoice` only flags it for UI messaging ("ahead of recommended level").

**Conclusion: A1–C2 labels exist end-to-end in the data model and UI, but only A1 and A2 are functionally real levels today. B1 through C2 are structurally wired (same code path, same UI, same tests-as-template) but content-starved to the point of being non-functional for a real learner.**
