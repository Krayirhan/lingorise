/**
 * The single clock the app's daily-cycle logic reads from.
 *
 * Every "what day is it" decision in the app — rollover, streak, mastery
 * scheduling, garden growth, word-of-the-day rotation — flows through this
 * file instead of calling Date.now()/new Date() directly. That is what
 * makes it possible to simulate days passing without waiting for them.
 *
 * This matters because the Android emulator used throughout development
 * refuses `adb root` (production system image), which blocks changing the
 * device clock entirely — the one avenue that would otherwise let a real
 * multi-day flow be observed on a screen. advanceDevClock() is the
 * replacement: it shifts every clock read in the app forward, in-process,
 * with no OS-level permission needed.
 *
 * Production behavior is byte-for-byte unchanged: the offset starts at 0
 * and advanceDevClock() is a no-op outside __DEV__, so a release build
 * always reads the real system clock.
 */

let devTimeOffsetMs = 0;

/** The clock every domain function should read instead of Date.now(). */
export function now(): number {
  return Date.now() + devTimeOffsetMs;
}

/** now(), as a Date object — for callers that need calendar fields. */
export function nowDate(): Date {
  return new Date(now());
}

/** now(), as a YYYY-MM-DD string — the app's canonical "today". */
export function todayISO(): string {
  return nowDate().toISOString().slice(0, 10);
}

/**
 * Shifts the app's clock forward by whole days. Dev-only: a release build
 * ships with this permanently inert, so there is no way for it to affect a
 * real user's data even if the guard were somehow bypassed.
 */
/**
 * React Native provides `__DEV__` as an ambient global at runtime, but
 * plain `ts-node` (used to run tests/testSuite.ts) has no RN type
 * declarations loaded and doesn't define it either — so this is read
 * defensively rather than referencing the bare identifier.
 */
function isDevBuild(): boolean {
  return Boolean((globalThis as { __DEV__?: boolean }).__DEV__);
}

export function advanceDevClock(days: number): void {
  if (!isDevBuild()) return;
  devTimeOffsetMs += days * 24 * 60 * 60 * 1000;
}

export function resetDevClock(): void {
  if (!isDevBuild()) return;
  devTimeOffsetMs = 0;
}

/** How many whole days the dev clock is currently shifted, for display. */
export function getDevClockOffsetDays(): number {
  return Math.round(devTimeOffsetMs / (24 * 60 * 60 * 1000));
}
