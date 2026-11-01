import {
  MeaningMatchQuestion
} from "../models/content";
import { auditItemDetailed } from "./itemAudit";
import { normaliseExample, normaliseTranslation, templateSignature, translationTemplateSignature } from "./shared";
import { CatalogueAuditContext } from "./types";

export function auditCatalogueQuality(questions: MeaningMatchQuestion[]) {
  const byExample = new Map<string, string[]>();
  const byTranslation = new Map<string, string[]>();
  const byDistractorPair = new Map<string, string[]>();
  const senseMap = new Map<string, string[]>();
  const byPrompt = new Map<string, string[]>();
  const byCollocation = new Map<string, string[]>();

  questions.forEach((q) => {
    const normEx = normaliseExample(q);
    if (normEx) {
      const sig = templateSignature(normEx);
      byExample.set(sig, [...(byExample.get(sig) || []), q.id]);
    }
    const normTr = normaliseTranslation(q);
    if (normTr) {
      const sig = translationTemplateSignature(normTr);
      byTranslation.set(sig, [...(byTranslation.get(sig) || []), q.id]);
    }
    const pair = [...(q.wrongOptions || [])].map((o) => o.trim().toLocaleLowerCase("tr")).sort().join("|");
    if (pair) byDistractorPair.set(pair, [...(byDistractorPair.get(pair) || []), q.id]);

    if (q.senseId) {
      senseMap.set(q.senseId, [...(senseMap.get(q.senseId) || []), q.id]);
    }

    if (q.productionPrompt) {
      const pNorm = q.productionPrompt.toLowerCase().replace(/['"‘“][a-z0-9 -]+['"’”]/gi, "{TARGET}").trim();
      byPrompt.set(pNorm, [...(byPrompt.get(pNorm) || []), q.id]);
    }

    if (q.collocation) {
      const cNorm = q.collocation.toLowerCase().trim();
      byCollocation.set(cNorm, [...(byCollocation.get(cNorm) || []), q.id]);
    }
  });

  const templateExampleIds = new Set([...byExample.values()].filter((ids) => ids.length >= 3).flat());
  const templateTranslationIds = new Set([...byTranslation.values()].filter((ids) => ids.length >= 3).flat());
  const overusedDistractorPairs = new Set(
    [...byDistractorPair.entries()].filter(([, ids]) => ids.length >= 5).map(([pair]) => pair)
  );
  const duplicateSenseIds = new Set(
    [...senseMap.entries()].filter(([, ids]) => ids.length > 1).map(([senseId]) => senseId)
  );
  const overusedPromptIds = new Set(
    [...byPrompt.values()].filter((ids) => ids.length >= 5).flat()
  );
  const overusedCollocations = new Set(
    [...byCollocation.entries()].filter(([, ids]) => ids.length >= 5).map(([col]) => col)
  );

  const context: CatalogueAuditContext = {
    templateExampleIds,
    templateTranslationIds,
    overusedDistractorPairs,
    duplicateSenseIds,
    overusedPromptIds,
    overusedCollocations,
  };

  const itemResults = questions.map((q) => auditItemDetailed(q, context));
  return {
    itemResults,
    context,
    templateExampleCount: templateExampleIds.size,
    templateTranslationCount: templateTranslationIds.size,
    overusedDistractorPairCount: overusedDistractorPairs.size,
    duplicateSenseCount: duplicateSenseIds.size,
  };
}
