import { UserData } from "../models/user";

/** Shape of the pre-Sprint-2 mistake queue, kept only for migration. */
export interface LegacyReviewItem {
  questionId: string;
  mistakeCount?: number;
  lastMistakeAt?: number;
  nextReviewAt?: number;
  intervalDays?: number;
  repetitions?: number;
  easeFactor?: number;
}

export type RawUserData = Partial<UserData> & {
  reviewQueue?: LegacyReviewItem[];
  schemaVersion?: number;
};

