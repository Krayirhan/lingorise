export type TelemetryEvent =
  | { name: "session_started"; params: { daysSinceLastOpen: number | null } }
  | { name: "daily_rollover_applied"; params: { streakBefore: number; streakAfter: number; pendingReviewsAtOpen: number } }
  // Reinforcement/spaced-repetition review was retired entirely (roadmap
  // 18-srs-flow-hardening.md "sınav" redesign, 2026-08-26) — every practice
  // session is new words only; level completion is decided by the exam
  // (see level_exam_started/level_exam_completed below).
  | { name: "practice_session_started"; params: { freshCount: number; reverseMode: boolean } }
  | {
    name: "question_answered";
    params: {
      questionId: string;
      isCorrect: boolean;
      isFirstEncounter: boolean;
      wasDue: boolean;
      usedHint: boolean;
      level: string;
      /** roadmap Birim 3 §3.1 — observational only, not yet used to schedule reviews. */
      responseTimeMs: number | null;
      inferredQuality: 0 | 1 | 2 | 3 | 4 | 5 | null;
    };
  }
  | { name: "word_mastery_changed"; params: { fromStatus: string; toStatus: string; questionId: string } }
  | { name: "garden_stage_changed"; params: { fromStage: string; toStage: string; masteredWords: number } }
  | { name: "level_promotion_shown"; params: { level: string; nextLevelReady: boolean } }
  | { name: "level_promotion_advanced"; params: { fromLevel: string; toLevel: string } }
  | { name: "level_switch_warning_shown"; params: { currentLevel: string; targetLevel: string } }
  | { name: "level_switch_confirmed_ahead"; params: { currentLevel: string; targetLevel: string } }
  | { name: "level_exam_started"; params: { level: string; questionCount: number } }
  | { name: "level_exam_completed"; params: { level: string; correctCount: number; totalCount: number; passed: boolean } }
  | { name: "topic_checkpoint_started"; params: { level: string; topicId: string; questionCount: number } }
  | { name: "topic_checkpoint_completed"; params: { level: string; topicId: string; correctCount: number; totalCount: number; passed: boolean } }
  | { name: "daily_quest_completed"; params: { questId: string; xpEarned: number } }
  | { name: "session_abandoned"; params: { questionsAnswered: number; questionsTotal: number } }
  | { name: "practice_session_completed"; params: { questionsAnswered: number; questionsTotal: number; correctCount: number; sessionMode: string } }
  | { name: "unit_completed"; params: { level: string; unitIndex: number; wordsInUnit: number } }
  | { name: "word_marked_leech"; params: { questionId: string; consecutiveWrongCount: number } }
  | { name: "suspicious_date_jump"; params: { deviceDate: string; lastKnownServerDate: string; daysDifference: number } }
  | { name: "migration_applied"; params: { fromVersion: number; toVersion: number; hadLegacyReviewQueue: boolean; hadLegacyQuestSet: boolean } }
  | { name: "local_save_failed"; params: { consecutiveFailures: number } }
  | { name: "cloud_sync_failed"; params: { consecutiveFailures: number } }
  | { name: "production_attempt_recorded"; params: { questionId: string; level: string; sessionMode: string; score: number; targetWordUsed: boolean; collocationAccurate: boolean } }
  | { name: "account_deletion_partial"; params: { phase: "auth" } };
