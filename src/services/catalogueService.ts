import AsyncStorage from "@react-native-async-storage/async-storage";
import { collection, doc, getDoc, getDocs, query, where } from "firebase/firestore";
import { db } from "./firebase";
import { CONTENT_VERSION, allQuestions } from "../content/questions";
import { LevelCode, MeaningMatchQuestion } from "../types/content";

const CACHE_KEY_PREFIX = "@lingorise_catalogue_cache_v2";

// Neither getDoc nor getDocs has a built-in timeout — on a slow, flaky, or
// unreachable network the very first launch could hang on this call
// indefinitely, stuck on the "Bahçen hazırlanıyor..." loading screen with no
// way forward (surfaced by a CI emulator whose network path to Firestore was
// consistently slow enough to exceed even a 150s wait — a real learner on
// bad mobile data could hit the same thing). Racing against a timeout lets
// the existing cache/bundled fallback below do its job promptly instead.
const REMOTE_FETCH_TIMEOUT_MS = 8000;

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => setTimeout(() => reject(new Error("Catalogue fetch timed out")), ms)),
  ]);
}

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
    const meta = await withTimeout(getDoc(doc(db, "contentMeta", "current")), REMOTE_FETCH_TIMEOUT_MS);
    const activeVersion = (meta.data() as ContentMeta | undefined)?.activeVersion;
    if (!activeVersion) throw new Error("Published content version not found");

    // A single-field query keeps the first launch independent of composite
    // index build timing. We cache only the selected level after filtering.
    const snap = await withTimeout(
      getDocs(query(collection(db, "items"), where("contentVersion", "==", activeVersion))),
      REMOTE_FETCH_TIMEOUT_MS
    );
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
