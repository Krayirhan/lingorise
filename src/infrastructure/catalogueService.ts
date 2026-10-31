import AsyncStorage from "@react-native-async-storage/async-storage";
import { collection, doc, getDoc, getDocs, query, where } from "firebase/firestore";
import { createCatalogueLoader } from "../application/catalogueLoader";
import { compareCatalogueIntegrity, createCatalogueIntegritySnapshot } from "../content/catalogueIntegrity";
import { isPublishableEditorialItem } from "../content/editorialReviewWorkflow";
import { CONTENT_VERSION, allQuestions } from "../content/questions";
import { LevelCode, MeaningMatchQuestion } from "../domain/models/content";
import { db } from "./firebase";

const CACHE_KEY_PREFIX = "@lingterra_catalogue_cache_v2";

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
  integrity?: ReturnType<typeof createCatalogueIntegritySnapshot>;
}

function isQuestion(value: unknown): value is MeaningMatchQuestion {
  const q = value as Partial<MeaningMatchQuestion>;
  return Boolean(q?.id && q.level && q.word && q.meaning && Array.isArray(q.wrongOptions));
}

/** Keeps a malformed or duplicated remote row from replacing a valid bundled question. */
export function validateCatalogueQuestions(values: unknown[]): MeaningMatchQuestion[] {
  const seen = new Set<string>();
  return values.filter((value): value is MeaningMatchQuestion => {
    if (!isQuestion(value)) return false;
    const correct = value.meaning || value.answer;
    const options = value.options || [correct, ...value.wrongOptions];
    if (!correct || !options.includes(correct) || options.length < 2 || seen.has(value.id)) return false;
    seen.add(value.id);
    return true;
  });
}

/**
 * Loads only the learner's active level from the published, versioned content
 * catalogue. Bundled content is deliberately a resilient offline fallback,
 * not a second writable content source.
 */
async function fetchPublishedCatalogue(level: LevelCode): Promise<CatalogueResult | null> {
  const meta = await withTimeout(getDoc(doc(db, "contentMeta", "current")), REMOTE_FETCH_TIMEOUT_MS);
  const activeVersion = (meta.data() as ContentMeta | undefined)?.activeVersion;
  if (!activeVersion) throw new Error("Published content version not found");
  const versionSnap = await withTimeout(getDoc(doc(db, "contentVersions", activeVersion)), REMOTE_FETCH_TIMEOUT_MS);
  const versionData = versionSnap.data() as { integrity?: ReturnType<typeof createCatalogueIntegritySnapshot> } | undefined;
  if (!versionData?.integrity) throw new Error("Published content integrity metadata not found");

  // A single-field query keeps the first launch independent of composite
  // index build timing. We cache only the selected level after filtering.
  const snap = await withTimeout(
    getDocs(query(collection(db, "items"), where("contentVersion", "==", activeVersion))),
    REMOTE_FETCH_TIMEOUT_MS
  );
  const remoteAll = validateCatalogueQuestions(snap.docs.map((item) => item.data()))
    .filter((item) => item.contentVersion === activeVersion && isPublishableEditorialItem(item));
  const remoteIntegrity = createCatalogueIntegritySnapshot(remoteAll);
  const expectedLocal = allQuestions.filter(isPublishableEditorialItem);
  const integrityErrors = [
    ...compareCatalogueIntegrity(versionData.integrity, remoteIntegrity),
    ...compareCatalogueIntegrity(createCatalogueIntegritySnapshot(expectedLocal), remoteIntegrity),
  ];
  if (integrityErrors.length > 0) throw new Error("Catalogue integrity mismatch: " + integrityErrors.join("; "));
  const questions = remoteAll
    .filter((item) => item.level === level)
    .sort((left, right) => (left.order || 0) - (right.order || 0));
  if (questions.length > 0) {
    const result = { questions, version: activeVersion, source: "remote" as const };
    return result;
  }
  return null;
}

export const loadCatalogue = createCatalogueLoader({
  remote: fetchPublishedCatalogue,
  async writeCache(level, result) {
    await AsyncStorage.setItem(`${CACHE_KEY_PREFIX}:${level}`, JSON.stringify(result));
  },
  async readCache(level) {
    const cached = await AsyncStorage.getItem(`${CACHE_KEY_PREFIX}:${level}`);
    if (!cached) return null;
    const parsed = JSON.parse(cached) as CatalogueResult;
    return Array.isArray(parsed.questions) && parsed.questions.every(isQuestion) ? parsed : null;
  },
  bundled(level) {
    return { questions: allQuestions.filter(question => question.level === level), version: CONTENT_VERSION, source: "bundled" };
  },
});
