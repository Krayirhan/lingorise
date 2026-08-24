import AsyncStorage from "@react-native-async-storage/async-storage";

/**
 * Local event instrumentation (roadmap Birim 5).
 *
 * Honesty note: the project's `firebase` dependency is the Firebase *web*
 * JS SDK. Its Analytics module depends on browser APIs (window,
 * indexedDB) that do not exist in the React Native runtime — it silently
 * no-ops or throws there. Real Firebase Analytics on RN requires the
 * native `@react-native-firebase/analytics` module plus a
 * google-services.json this project doesn't have and native rebuild —
 * out of safe scope for this pass.
 *
 * What this file delivers instead is real: every event call site listed
 * in 05-telemetry-analytics.md §5.2 is wired into the app right now, event
 * names and parameters are typed, and events are persisted locally
 * (AsyncStorage ring buffer) so they can be inspected on-device today.
 * Swapping in a real sink later is a one-line change to `emit()` below —
 * the call sites never need to change.
 *
 * questionId on question_answered, and the unit_completed /
 * practice_session_completed events, exist specifically so the five signals
 * in 02-parameter-validation.md §2.1 are computable once real usage data
 * exists — see docs/roadmap/parameter-calibration-log.md.
 */

export type TelemetryEvent =
  | { name: "session_started"; params: { daysSinceLastOpen: number | null } }
  | { name: "daily_rollover_applied"; params: { streakBefore: number; streakAfter: number; pendingReviewsAtOpen: number } }
  | { name: "practice_session_started"; params: { sessionType: "mixed" | "review_only" | "new_only"; dueCount: number; freshCount: number; reverseMode: boolean } }
  | { name: "question_answered"; params: { questionId: string; isCorrect: boolean; isFirstEncounter: boolean; wasDue: boolean; usedHint: boolean; level: string } }
  | { name: "word_mastery_changed"; params: { fromStatus: string; toStatus: string; questionId: string } }
  | { name: "garden_stage_changed"; params: { fromStage: string; toStage: string; masteredWords: number } }
  | { name: "review_debt_capped"; params: { dueCount: number; sessionSize: number } }
  | { name: "level_promotion_shown"; params: { level: string; masteredPercent: number; nextLevelReady: boolean } }
  | { name: "level_promotion_advanced"; params: { fromLevel: string; toLevel: string } }
  | { name: "level_switch_warning_shown"; params: { currentLevel: string; targetLevel: string; currentMasteredPercent: number } }
  | { name: "level_switch_confirmed_ahead"; params: { currentLevel: string; targetLevel: string } }
  | { name: "daily_quest_completed"; params: { questId: string; xpEarned: number } }
  | { name: "session_abandoned"; params: { questionsAnswered: number; questionsTotal: number } }
  | { name: "practice_session_completed"; params: { questionsAnswered: number; questionsTotal: number; correctCount: number; sessionMode: string } }
  | { name: "unit_completed"; params: { level: string; unitIndex: number; wordsInUnit: number } }
  | { name: "migration_applied"; params: { fromVersion: number; toVersion: number; hadLegacyReviewQueue: boolean; hadLegacyQuestSet: boolean } };

const STORAGE_KEY = "@lingorise_telemetry_ring_v1";
const RING_BUFFER_SIZE = 200;

interface StoredEvent {
  name: TelemetryEvent["name"];
  params: Record<string, unknown>;
  at: number;
}

let buffer: StoredEvent[] = [];
let hydrated = false;

async function hydrate(): Promise<void> {
  if (hydrated) return;
  hydrated = true;
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (raw) buffer = JSON.parse(raw);
  } catch {
    // A cold telemetry buffer is never worth surfacing to the learner.
  }
}

async function persist(): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(buffer.slice(-RING_BUFFER_SIZE)));
  } catch {
    // Same as above — telemetry failures must stay silent to the user.
  }
}

/** The one place a real analytics SDK gets plugged in later. */
function emit(event: StoredEvent): void {
  buffer.push(event);
  if (buffer.length > RING_BUFFER_SIZE) buffer = buffer.slice(-RING_BUFFER_SIZE);
  void persist();
  if (typeof console !== "undefined" && (globalThis as { __DEV__?: boolean }).__DEV__) {
    // eslint-disable-next-line no-console
    console.log(`[telemetry] ${event.name}`, event.params);
  }
}

/** Records one event. Fire-and-forget — never awaited by callers. */
export function track<E extends TelemetryEvent>(name: E["name"], params: E["params"]): void {
  void hydrate().then(() => emit({ name, params, at: Date.now() }));
}

/** For on-device debugging and for the automated tests in this sprint. */
export async function getRecentEvents(): Promise<StoredEvent[]> {
  await hydrate();
  return [...buffer];
}

export async function clearTelemetry(): Promise<void> {
  buffer = [];
  await persist();
}
