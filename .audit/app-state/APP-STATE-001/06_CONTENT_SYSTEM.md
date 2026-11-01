# 06 — Content / Question Data System

- Location: static TypeScript literals under `src/content/questions/{a1,a2,a2Generated,b1,b2,c1,c2}.ts`, aggregated in `index.ts`. Firestore (`catalogueService.ts`) is an override layer, cached in AsyncStorage per level, with 3-tier fallback: remote (8s timeout) → AsyncStorage cache → bundled JSON.
- A1/A2 are partly hand-authored, partly procedurally expanded at module-load from vocabulary tables (`A1_CORE_VOCABULARY` 320 tuples/8 topics; `a2Generated` 249 tuples/7 topics). B1–C2 are entirely small hand-authored arrays.

## Question counts per level (actual, counted from source)

| Level | Hand-authored | Generated | **Total** |
|---|---|---|---|
| A1 | 7 | 320 | **327** |
| A2 | 5 | 249 | **254** |
| B1 | 5 | 0 | **5** |
| B2 | 4 | 0 | **4** |
| C1 | 4 | 0 | **4** |
| C2 | 3 | 0 | **3** |

Gating constants: `LEVEL_READY_MIN_QUESTIONS = 100` (`isLevelReady`), exam needs ≥50 questions to seat (`isExamAvailable`).

**A1 and A2 clear the readiness bar. B1, B2, C1, and C2 do not — each has under 5% of the minimum question count and cannot seat an exam at all.**

- Duplicate handling: `validateQuestionDatabase()` scans for duplicate ids and requires complete learning metadata (partOfSpeech, exampleSentence, exampleTranslation, contextNote, pronunciation, hint, valid options).
- Categories/difficulty: each question has a Turkish-language `topic`, `difficulty` (1-5, derived from level + word length), `partOfSpeech`; grouped into 30-word publishing units.
- Content exhaustion: see 05_PRACTICE_SYSTEM.md (CORE-004) — handled gracefully in UI once a level/unit is drained.

**Content status: A1/A2 are production-usable content sets. B1–C2 are placeholder-scale stubs (3–5 questions) — the level ladder and promotion machinery are fully built and level-agnostic, but there is essentially no real content behind B1 through C2 today.**
