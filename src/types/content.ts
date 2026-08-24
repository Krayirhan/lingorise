export type LevelCode = "A1" | "A2" | "B1" | "B2" | "C1" | "C2";

export type Level = {
  code: LevelCode;
  title: string;
  hint: string;
};

export type GameMode = "MEANING_MATCH" | "PICK_THE_WORD" | "QUICK_REVIEW";

export type PartOfSpeech = "noun" | "verb" | "adjective" | "adverb" | "phrase";

export interface MeaningMatchQuestion {
  id: string;
  mode: "MEANING_MATCH";
  level: LevelCode;
  topic: string;
  word: string;
  meaning: string;
  wrongOptions: string[];
  xp: number;
  difficulty?: 1 | 2 | 3 | 4 | 5;
  phonetic?: string;
  partOfSpeech?: PartOfSpeech;
  exampleSentence?: string;
  exampleTranslation?: string;
  contextNote?: string;
  pronunciation?: string;
  hint?: string;
  // Backward compatibility aliases
  prompt?: string;
  answer?: string;
  options?: string[];
  // Immutable published-catalogue metadata. These are absent only for the
  // bundled offline fallback content.
  contentVersion?: string;
  unitId?: string;
  order?: number;
  status?: "published" | "draft" | "archived";
}

export type Question = MeaningMatchQuestion;
