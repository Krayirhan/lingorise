# 05-STATIC_ANALYSIS_INDEX

Shared Discovery ID: SHARED-DISCOVERY-001
Revision: 16b9aab

Index of available capabilities and high-value search surfaces only. No findings, no severity, no scoring — future domain audits perform their own independent evaluation.

## Tooling availability

| Tool | Status |
|---|---|
| Semgrep (MCP) | Configured in `.mcp.json` but **failed to connect this session** (CONNECT_TIMEOUT) — connection issue, not confirmed unavailable/unconfigured |
| Graphify | `graphify-out/` present (`GRAPH_REPORT.md`, `graph.json`, `graph.html`, `cache/`, `cost.json`) — freshness against this exact HEAD not verified in this pass |
| Serena (MCP) | Configured in `.mcp.json` |
| TypeScript compiler | Available and functional — `npm run typecheck` ran clean this pass (0 errors) |
| `npm audit` | Available and functional — produced output this pass (moderate-severity entries present, e.g. `@expo/cli` transitive chain; contents not evaluated/scored here) |
| Firebase Rules emulator/tests | Available via `firebase-tools`, requires **JDK 21+**; local machine has JDK 17 (see `04-VERIFICATION_STATE.md`); CI installs JDK 21 and passes |

## Repository-wide indexing performed

- **TODO/FIXME in `src/`:** 0 matches
- **Large source files (>250 lines):** `PracticeHubScreen.tsx` (480), `GardenHeroCard.tsx` (476), `useUserProgress.ts` (463), `DataManagementCard.tsx` (448), `WordNotebookModal.tsx` (420), `storage.ts` (391), `AppNavigator.tsx` (376), `a1ExampleSentences.ts` (351), `AuthScreen.tsx` (337), `a2Generated.ts` (336), `AccountManagementCard.tsx` (294) — listed for reference only, not flagged as a problem
- **Barrel/re-export files checked for dead-duplicate risk:** `src/services/gamification.ts` and `src/services/spacedRepetition.ts` are both thin `export * from "../domain/..."` re-exports, not dead duplicates — confirmed by reading their content (1-4 lines each)
- **No other obvious duplicated-file candidates surfaced** in this lightweight pass (deeper duplication analysis is a future domain-audit task, not performed here)

## Security-sensitive file locations (index only, contents not read/exposed)

- `.env`, `.env.example` — present at repo root
- `android/app/debug.keystore` — standard Android debug keystore (default tooling artifact)
- `android/app/build.gradle` — contains a `signingConfigs` block (not inspected in detail this pass)
- `firestore.rules` — the actual authorization boundary (see `03-EVIDENCE_MAP.md § FIRESTORE_AUTHORIZATION`)
- `src/services/firebase.ts` — Firebase client config init (not a secret boundary by itself)

## Native configuration locations

- `android/build.gradle`, `android/app/build.gradle`, `android/gradle/`, `android/gradle.properties`
- `app.json` (Expo config), `eas.json` (EAS build profiles)

## Explicitly not done in this pass

- No Semgrep scan executed (server unavailable this session)
- No full `npm audit` remediation/triage (only confirmed the command runs)
- No Graphify query run against this exact HEAD (existence confirmed only)
- No severity assignment, no scoring, no findings produced from any of the above
