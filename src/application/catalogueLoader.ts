import { LevelCode } from "../domain/models/content";
import { CatalogueResult } from "./ports";

export interface CatalogueSources {
  remote(level: LevelCode): Promise<CatalogueResult | null>;
  readCache(level: LevelCode): Promise<CatalogueResult | null>;
  writeCache(level: LevelCode, result: CatalogueResult): Promise<void>;
  bundled(level: LevelCode): CatalogueResult;
}

export function createCatalogueLoader(sources: CatalogueSources) {
  return async (level: LevelCode): Promise<CatalogueResult> => {
    try {
      const remote = await sources.remote(level);
      if (remote) {
        await sources.writeCache(level, remote);
        return remote;
      }
    } catch {
      // An unavailable/invalid remote catalogue (including a failed cache write)
      // keeps the existing cache/bundled fallback policy.
    }
    try {
      const cached = await sources.readCache(level);
      if (cached) return { ...cached, source: "cache" };
    } catch {
      // Missing or unreadable cache falls back to the shipped catalogue.
    }
    return sources.bundled(level);
  };
}
