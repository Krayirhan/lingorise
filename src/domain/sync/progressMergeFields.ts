import { updateDailyStreak } from "../gamification/streak";
import { LevelCode } from "../models/content";
import { DailyQuest, PracticeHistoryEntry, ProductionAttempt, QuestHistoryEntry, TopicAssessmentProgress } from "../models/user";

const LEVEL_ORDER: LevelCode[] = ["A1", "A2", "B1", "B2", "C1", "C2"];

function higherLevel(a: LevelCode, b: LevelCode): LevelCode {
  return LEVEL_ORDER.indexOf(a) >= LEVEL_ORDER.indexOf(b) ? a : b;
}

/** Topic checks are additive achievement records: keep the highest score,
 * every attempt count, and a pass observed on either device. */
export function mergeTopicAssessments(
  local: Record<string, TopicAssessmentProgress> = {},
  remote: Record<string, TopicAssessmentProgress> = {}
): Record<string, TopicAssessmentProgress> {
  const topicIds = new Set([...Object.keys(local), ...Object.keys(remote)]);
  return [...topicIds].reduce<Record<string, TopicAssessmentProgress>>((merged, topicId) => {
    const left = local[topicId];
    const right = remote[topicId];
    if (!left && right) {
      merged[topicId] = right;
      return merged;
    }
    if (left && !right) {
      merged[topicId] = left;
      return merged;
    }
    if (left && right) {
      merged[topicId] = {
        attempts: Math.max(left.attempts || 0, right.attempts || 0),
        bestScore: Math.max(left.bestScore || 0, right.bestScore || 0),
        passed: Boolean(left.passed) || Boolean(right.passed),
        lastAttemptAt: Math.max(left.lastAttemptAt || 0, right.lastAttemptAt || 0) || undefined,
      };
    }
    return merged;
  }, {});
}

/**
 * `level` is a free content-selection preference, not an achievement
 * (DATA-QA-005) — whichever side set it more recently wins, even if that
 * means moving to a numerically lower level (an intentional "review an
 * earlier level" choice must survive a merge, not be silently overridden by
 * a stale-but-higher value). Only when neither side has ever stamped
 * `levelSetAt` (data from before this field existed) does this fall back to
 * the old higher-level heuristic, which is a safe, non-regressing default
 * for that transitional case.
 */
export function pickLevelByRecency(
  localLevel: LevelCode,
  remoteLevel: LevelCode,
  localSetAt: number | undefined,
  remoteSetAt: number | undefined
): LevelCode {
  if (localSetAt !== undefined && remoteSetAt !== undefined) {
    return localSetAt >= remoteSetAt ? localLevel : remoteLevel;
  }
  if (localSetAt !== undefined) return localLevel;
  if (remoteSetAt !== undefined) return remoteLevel;
  return higherLevel(localLevel, remoteLevel);
}

export function laterDateString(a: string, b: string): string {
  if (!a) return b;
  if (!b) return a;
  return a >= b ? a : b;
}

export function unionValues<T>(a: T[] = [], b: T[] = []): T[] {
  return Array.from(new Set([...a, ...b]));
}

/**
 * Returns what a side's `streak` WOULD actually be if that side were opened
 * right now — i.e. its own gap since `lastActiveDate` applied against the
 * real current date, without changing `lastActiveDate` itself. Merging raw
 * `streak` values with `Math.max` is only safe once each side's OWN
 * staleness has been accounted for — otherwise a long-unopened device's
 * frozen-high streak can survive a merge against a correctly-decayed side
 * (DATA-QA-006). The caller (`AppBootstrap`) already rolls the LOCAL side
 * over to today before merging (which also correctly refreshes local's
 * daily-scoped fields via `applyDailyRollover`); this normalizes the
 * REMOTE side too, so the fix holds even when the fetched remote document
 * itself is the stale one — the case a real device pairing can produce that
 * a local-only rollover cannot fix by itself.
 */
export function normalizedStreak(streak: number, lastActiveDate: string, today: Date): number {
  return updateDailyStreak(lastActiveDate, streak, today).newStreak;
}

/**
 * A quest-id-keyed richer-progress merge, valid ONLY when both sides
 * genuinely represent the same calendar day. `DailyQuest` carries no date of
 * its own — `applyDailyRollover()` regenerates the list from scratch every
 * day under the same fixed ids (`DAILY_QUEST_PRACTICE_ID`/`DAILY_QUEST_REVIEW_ID`).
 * Applying this merge across a day boundary would let yesterday's remote
 * `completed: true` silently mark today's freshly-rolled-over quest complete
 * by id, blocking the learner from ever earning that day's quest XP again.
 * `mergeDailyScopedValue` (below) is what actually decides which side to use.
 */
export function mergeDailyQuestsSameDay(local: DailyQuest[] = [], remote: DailyQuest[] = []): DailyQuest[] {
  const byId = new Map<string, DailyQuest>();
  for (const quest of remote) byId.set(quest.id, quest);
  for (const quest of local) {
    const existing = byId.get(quest.id);
    byId.set(
      quest.id,
      existing
        ? { ...existing, current: Math.max(existing.current, quest.current), completed: existing.completed || quest.completed }
        : quest
    );
  }
  return Array.from(byId.values());
}

/**
 * Applies `sameDayMerge` only when `local`/`remote` are dated to the same
 * calendar day (via `localDate`/`remoteDate`, both `lastActiveDate` values).
 * Otherwise, whichever side owns the later (more current) date wins outright
 * — the other side's daily-scoped value belongs to an already-rolled-over
 * day and must not be merged into today's, only replaced by it.
 */
export function mergeDailyScopedValue<T>(
  localDate: string,
  remoteDate: string,
  localValue: T,
  remoteValue: T,
  sameDayMerge: (local: T, remote: T) => T
): T {
  if (localDate === remoteDate) {
    return sameDayMerge(localValue, remoteValue);
  }
  return laterDateString(localDate, remoteDate) === localDate ? localValue : remoteValue;
}

/** Unions quest-history entries by (date, questId) identity — an append-only log, never overwritten. */
export function mergeQuestHistory(local: QuestHistoryEntry[] = [], remote: QuestHistoryEntry[] = []): QuestHistoryEntry[] {
  const identity = (entry: QuestHistoryEntry) => `${entry.date}::${entry.questId}`;
  const seen = new Map<string, QuestHistoryEntry>();
  for (const entry of [...remote, ...local]) {
    if (!seen.has(identity(entry))) seen.set(identity(entry), entry);
  }
  return Array.from(seen.values());
}

/** Merges per-day practice-history summaries: same-day entries take the richer counts, distinct days are unioned. */
export function mergePracticeHistory(local: PracticeHistoryEntry[] = [], remote: PracticeHistoryEntry[] = []): PracticeHistoryEntry[] {
  const byDate = new Map<string, PracticeHistoryEntry>();
  for (const entry of remote) byDate.set(entry.date, entry);
  for (const entry of local) {
    const existing = byDate.get(entry.date);
    byDate.set(
      entry.date,
      existing
        ? {
          date: entry.date,
          answers: Math.max(existing.answers, entry.answers),
          correct: Math.max(existing.correct, entry.correct),
          xp: Math.max(existing.xp, entry.xp),
        }
        : entry
    );
  }
  return Array.from(byDate.values());
}

export function mergeProductionAttempts(local: ProductionAttempt[] = [], remote: ProductionAttempt[] = []): ProductionAttempt[] {
  const byId = new Map<string, ProductionAttempt>();
  for (const attempt of [...remote, ...local]) byId.set(attempt.attemptId, attempt);
  return [...byId.values()].sort((left, right) => left.createdAt - right.createdAt).slice(-500);
}

