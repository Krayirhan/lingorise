import AsyncStorage from "@react-native-async-storage/async-storage";
import { collection, doc, getDoc, getDocs, query, where } from "firebase/firestore";
import { db } from "./firebase";
import { CONTENT_VERSION, allQuestions } from "../content/questions";
import { LevelCode, MeaningMatchQuestion } from "../types/content";

const CACHE_KEY_PREFIX = "@lingorise_catalogue_cache_v2";

export type CatalogueSource = "remote" | "cache" | "bundled";
export interface CatalogueResult { questions: MeaningMatchQuestion[]; version: string; source: CatalogueSource }

interface ContentMeta {
  activeVersion?: string;
}

function isQuestion(value: unknown): value is MeaningMatchQuestion {
  const q = value as Partial<MeaningMatchQuestion>;
  return Boolean(q?.id && q.level && q.word && q.meaning && Array.isArray(q.wrongOptions));
}

/**
 * Loads only the learner's active level from the published, versioned content
 * catalogue. Bundled content is deliberately a resilient offline fallback,
 * not a second writable content source.
 */
export async function loadCatalogue(level: LevelCode): Promise<CatalogueResult> {
  const cacheKey = `${CACHE_KEY_PREFIX}:${level}`;
  try {
    const meta = await getDoc(doc(db, "contentMeta", "current"));
    const activeVersion = (meta.data() as ContentMeta | undefined)?.activeVersion;
    if (!activeVersion) throw new Error("Published content version not found");

    // A single-field query keeps the first launch independent of composite
    // index build timing. We cache only the selected level after filtering.
    const snap = await getDocs(query(collection(db, "items"), where("contentVersion", "==", activeVersion)));
    const questions = snap.docs
      .map((item) => item.data())
      .filter(isQuestion)
      .filter((item) => item.level === level && item.status === "published")
      .sort((left, right) => (left.order || 0) - (right.order || 0));
    if (questions.length > 0) {
      const result = { questions, version: activeVersion, source: "remote" as const };
      await AsyncStorage.setItem(cacheKey, JSON.stringify(result));
      return result;
    }
  } catch {}
  try {
    const cached = await AsyncStorage.getItem(cacheKey);
    if (cached) {
      const parsed = JSON.parse(cached) as CatalogueResult;
      if (Array.isArray(parsed.questions) && parsed.questions.every(isQuestion)) return { ...parsed, source: "cache" };
    }
  } catch {}
  return { questions: allQuestions.filter((question) => question.level === level), version: CONTENT_VERSION, source: "bundled" };
}
