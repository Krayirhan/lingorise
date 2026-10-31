import { LevelCode, MeaningMatchQuestion } from "../domain/models/content";
import { TelemetryEvent } from "../domain/models/telemetry";
import { UserData } from "../domain/models/user";
import { RemoteUserDataResult } from "../domain/sync/remoteSync";
import { WritingTask } from "../domain/learning/writing";

export interface Account {
  uid: string;
  email: string | null;
  displayName: string | null;
  emailVerified: boolean;
}
export interface AccountGateway {
  current(): Account | null;
  subscribe(listener: (account: Account | null) => void): () => void;
  register(email: string, password: string, displayName: string): Promise<Account>;
  login(email: string, password: string): Promise<Account>;
  logout(): Promise<void>;
  resetPassword(email: string): Promise<void>;
  sendVerificationEmail(): Promise<void>;
  updateDisplayName(userId: string, name: string): Promise<void>;
  deleteCredential(userId: string): Promise<void>;
  enableGuestMode(): Promise<void>;
  disableGuestMode(): Promise<void>;
}
export interface LocalProgressRepository {
  load(): Promise<UserData>;
  save(data: UserData): Promise<boolean>;
  clear(): Promise<{ success: boolean; data: UserData }>;
  saveWritingAttempt?(attempt: { questionId: string; response: string; createdAt: number }, profile?: string): Promise<boolean>;
  loadProfile?(profile: string): Promise<UserData | null>;
  saveProfile?(profile: string, data: UserData): Promise<void>;
  removeProfile?(profile: string): Promise<void>;
  backupLegacyProfile?(): Promise<boolean>;
  readUnassignedLegacyProfile?(): Promise<UserData | null>;
  resolveLegacyProfile?(importAsGuest: boolean): Promise<void>;
  loadPending?(uid: string): Promise<{ uid: string; data: UserData; choice: "merge" | "account" } | null>;
  savePending?(pending: { uid: string; data: UserData; choice: "merge" | "account" }): Promise<void>;
  clearPending?(uid: string): Promise<void>;
  clearWritingAttempts?(profile?: string): Promise<void>;
  flushWritingAttempts?(): Promise<void>;
}
export interface RemoteProgressRepository {
  fetch(userId: string): Promise<RemoteUserDataResult>;
  saveProfile(userId: string, data: UserData): Promise<void>;
  saveProgress(userId: string, data: UserData): Promise<void>;
  saveLearningItem(userId: string, question: MeaningMatchQuestion, data: UserData, correct: boolean): Promise<void>;
  delete(userId: string): Promise<void>;
}
export interface CatalogueResult {
  questions: MeaningMatchQuestion[];
  version: string;
  source: "remote" | "cache" | "bundled";
}
export interface CatalogueRepository {
  load(level: LevelCode): Promise<CatalogueResult>;
  getWritingTask?(questionId: string): WritingTask | undefined;
}
export interface Clock {
  now(): number;
  todayISO(): string;
  nowDate(): Date;
  /** Real wall clock used by existing profile/assessment timestamps. */
  wallNow(): number;
}
export interface RandomSource { next(): number }
export interface TelemetryPort {
  track<E extends TelemetryEvent>(name: E["name"], params: E["params"]): void;
  clear(): Promise<void>;
}
export interface NotificationPort {
  scheduleDailyReminder(locale?: "tr" | "en", askPermission?: boolean): Promise<boolean>;
  cancelDailyReminder(): Promise<void>;
}
export interface BackupSharePort {
  export(json: string): Promise<boolean>;
}
export interface SpeechPort {
  speak(text: string, options?: {
    language?: string; rate?: number; pitch?: number;
    onStart?: () => void; onDone?: () => void; onStopped?: () => void;
    onError?: (error: Error) => void;
  }): Promise<void>;
  stop(): Promise<void>;
}
export interface ApplicationDependencies {
  local: LocalProgressRepository;
  remote: RemoteProgressRepository;
  catalogue: CatalogueRepository;
  account: AccountGateway;
  clock: Clock;
  random: RandomSource;
  telemetry: TelemetryPort;
  notifications: NotificationPort;
  backup: BackupSharePort;
  speech: SpeechPort;
}
