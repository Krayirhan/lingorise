import { LevelCode } from "../models/content";

export type CurriculumTopicState = "locked" | "available" | "in_progress" | "assessment_due" | "completed" | "mastered";

export interface CurriculumTopic {
  id: string;
  level: LevelCode;
  order: number;
  titleTr: string;
  titleEn: string;
  objectiveTr: string;
  objectiveEn: string;
  icon: string;
  legacyTopics: string[];
}

export interface CurriculumUnit {
  id: string;
  topicId: string;
  order: number;
  titleTr: string;
  titleEn: string;
  questionIds: string[];
}

export interface CurriculumLesson {
  id: string;
  unitId: string;
  topicId: string;
  order: number;
  titleTr: string;
  titleEn: string;
  questionIds: string[];
}

export interface TopicProgressSummary {
  topicId: string;
  title: string;
  objective: string;
  total: number;
  seen: number;
  reliable: number;
  assessmentPassed: boolean;
  state: CurriculumTopicState;
  percent: number;
}

export interface CurriculumTopicAudit {
  topicId: string;
  questionCount: number;
  unitCount: number;
  lessonCount: number;
  missingRequiredMetadataIds: string[];
}

