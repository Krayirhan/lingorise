import fs from "node:fs";
import path from "node:path";
import { allQuestions } from "../src/content/questions/index";
import {
  auditEditorialQuestions,
  auditItemDetailed,
  auditIpaProvenance,
  auditCatalogueQuality,
  MANDATORY_AUDIT_FIELDS,
} from "../src/content/editorialQuality";
import {
  buildEditorialReviewQueue,
  summarizeEditorialReviewQueue,
  EDITORIAL_RUBRIC_VERSION,
} from "../src/content/editorialReviewWorkflow";
import { LevelCode, MeaningMatchQuestion, PartOfSpeech } from "../src/domain/models/content";

const levels: LevelCode[] = ["A1", "A2", "B1", "B2", "C1", "C2"];
const queue = buildEditorialReviewQueue(allQuestions);
const queueSummary = summarizeEditorialReviewQueue(queue);

function pct(value: number, total: number): string {
  return `${total ? Math.round((value / total) * 100) : 0}%`;
}

function count(rows: MeaningMatchQuestion[], predicate: (q: MeaningMatchQuestion) => boolean): number {
  return rows.filter(predicate).length;
}

const catalogueQuality = auditCatalogueQuality(allQuestions);

interface EnhancedLevelRow {
  level: LevelCode;
  totalItems: number;
  posDistribution: Record<PartOfSpeech, number>;
  exampleCoverage: number;
  translationCoverage: number;
  senseCoverage: number;
  ipaCoverage: number;
  ipaVerified: number;
  ipaPending: number;
  collocationCoverage: number;
  productionCoverage: number;
  targetEnforcedProduction: number;
  distractorSuitability: number;
  repeatedDistractorPairs: number;
  repeatedExampleTemplates: number;
  repeatedTranslationTemplates: number;
  cefrMismatch: number;
  registerMismatch: number;
  p0Count: number;
  p1Count: number;
  p2Count: number;
  p3Count: number;
  humanReviewCount: number;
  humanReviewRate: string;
  approvedCount: number;
  approvedRate: string;
  localFirestoreDiff: number;
  auditErrors: number;
  auditWarnings: number;
  fieldCoverageRate: string;
  automaticStructuralPassRate: string;
  editoriallyVerifiedRate: string;
}

const rows: EnhancedLevelRow[] = levels.map((level) => {
  const items = allQuestions.filter((q) => q.level === level);
  const audit = auditEditorialQuestions(items);
  const approved = queue.filter((q) => q.level === level && q.humanApprovalPresent).length;

  const itemAudits = items.map((q) => auditItemDetailed(q, catalogueQuality.context));

  let p0 = 0;
  let p1 = 0;
  let p2 = 0;
  let p3 = 0;
  let totalFieldChecks = 0;
  let passedFieldChecks = 0;

  for (const itemRes of itemAudits) {
    p0 += itemRes.errors.filter((e) => e.priority === "P0").length;
    p1 += itemRes.errors.filter((e) => e.priority === "P1").length;
    p2 += itemRes.warnings.filter((w) => w.priority === "P2").length;
    p3 += itemRes.warnings.filter((w) => w.priority === "P3").length;

    for (const field of MANDATORY_AUDIT_FIELDS) {
      totalFieldChecks++;
      if (itemRes.fieldResults[field] === "pass") {
        passedFieldChecks++;
      }
    }
  }

  const posDist: Record<PartOfSpeech, number> = {
    noun: count(items, (q) => q.partOfSpeech === "noun"),
    verb: count(items, (q) => q.partOfSpeech === "verb"),
    adjective: count(items, (q) => q.partOfSpeech === "adjective"),
    adverb: count(items, (q) => q.partOfSpeech === "adverb"),
    phrase: count(items, (q) => q.partOfSpeech === "phrase"),
  };

  const ipaProvenances = items.map(auditIpaProvenance);
  const ipaVerifiedCount = ipaProvenances.filter((p) => p.verificationStatus === "verified").length;
  const ipaPendingCount = ipaProvenances.filter((p) => p.verificationStatus === "pending").length;

  const targetEnforcedCount = count(items, (q) => {
    if (!q.productionPrompt) return false;
    const promptLower = q.productionPrompt.toLowerCase();
    const targetLower = q.word.toLowerCase();
    return promptLower.includes(targetLower) || promptLower.includes(`"${targetLower}"`) || promptLower.includes(`'${targetLower}'`);
  });

  const distractorSuitability = count(items, (q) => {
    return (
      Array.isArray(q.wrongOptions) &&
      q.wrongOptions.length === 2 &&
      new Set(q.wrongOptions).size === 2 &&
      !q.wrongOptions.includes(q.meaning)
    );
  });

  const cefrMismatchCount = count(items, (q) => !q.cefr || q.cefr !== q.level);
  const registerMismatchCount = count(items, (q) => {
    if (!q.register) return true;
    if (level === "C2" && q.register === "informal") return true;
    return false;
  });

  const repeatedExampleCount = items.filter((q) => catalogueQuality.context.templateExampleIds?.has(q.id)).length;
  const repeatedTranslationCount = items.filter((q) => catalogueQuality.context.templateTranslationIds?.has(q.id)).length;
  const repeatedDistractorCount = items.filter((q) => {
    const pair = [...(q.wrongOptions || [])].map((o) => o.trim().toLocaleLowerCase("tr")).sort().join("|");
    return catalogueQuality.context.overusedDistractorPairs?.has(pair);
  }).length;

  const structuralPassCount = items.filter((q) => {
    const res = auditItemDetailed(q);
    return res.errors.filter((e) => e.priority === "P0").length === 0;
  }).length;

  return {
    level,
    totalItems: items.length,
    posDistribution: posDist,
    exampleCoverage: count(items, (q) => Boolean(q.exampleSentence)),
    translationCoverage: count(items, (q) => Boolean(q.exampleTranslation)),
    senseCoverage: count(items, (q) => Boolean(q.senseId)),
    ipaCoverage: count(items, (q) => Boolean(q.phonetic)),
    ipaVerified: ipaVerifiedCount,
    ipaPending: ipaPendingCount,
    collocationCoverage: count(items, (q) => Boolean(q.collocation)),
    productionCoverage: count(items, (q) => Boolean(q.productionPrompt)),
    targetEnforcedProduction: targetEnforcedCount,
    distractorSuitability,
    repeatedDistractorPairs: repeatedDistractorCount,
    repeatedExampleTemplates: repeatedExampleCount,
    repeatedTranslationTemplates: repeatedTranslationCount,
    cefrMismatch: cefrMismatchCount,
    registerMismatch: registerMismatchCount,
    p0Count: p0,
    p1Count: p1,
    p2Count: p2,
    p3Count: p3,
    humanReviewCount: approved,
    humanReviewRate: pct(approved, items.length),
    approvedCount: approved,
    approvedRate: pct(approved, items.length),
    localFirestoreDiff: 0,
    auditErrors: audit.errors.length,
    auditWarnings: audit.warnings.length,
    fieldCoverageRate: pct(passedFieldChecks, totalFieldChecks),
    automaticStructuralPassRate: pct(structuralPassCount, items.length),
    editoriallyVerifiedRate: pct(approved, items.length),
  };
});

const actionByLevel: Record<LevelCode, string> = {
  A1: "Temel sözcük türü, doğal örnek/çeviri, sense ayrımı, gerçek öğrenen distractorları; phrase/collocation kapsamı ve kısa üretim görevleri.",
  A2: "Eksik productionPrompt/collocation alanlarını tamamla; çok anlamlı kelimelerde sense kontrolü; doğal çeviri ve A2 zorluk doğrulaması.",
  B1: "120 öğenin tamamında İngilizce kullanım, Türkçe anlam, IPA, CEFR ve bağlam editör incelemesi; ardından final karar.",
  B2: "108 öğenin tamamında akademik/profesyonel register, gerekçeli üretim görevi, nüanslı çeviri ve CEFR sınırı kontrolü.",
  C1: "108 öğenin tamamında kanıt/eleştirel analiz bağlamı, register, hassas anlam ayrımı ve üretim rubriği kontrolü.",
  C2: "100 öğenin tamamında uzmanlık söylemi, doğal native kullanım, hassas sense/register ayrımı; otomatik audit temiz olsa da insan onayı bekliyor.",
};

const markdown = `# Editorial Level Readiness Report

Generated: ${new Date().toISOString()}  
Rubric: ${EDITORIAL_RUBRIC_VERSION}

> [!IMPORTANT]
> Bu rapor otomatik envanter/audit sonucudur. \`humanApproved\` değeri gerçek review kanıtı olmadan 1 olamaz; otomatik test geçmesi editoryal onay değildir.
> Üç ana kalite metriği bağımsız olarak değerlendirilir ve tek bir başarı oranında birleştirilmez:
> 1. **Field Coverage:** 23 zorunlu alanın doluluk ve geçerlilik oranı.
> 2. **Automatic Structural Pass:** P0 kritik şema hatası içermeyen öğelerin oranı.
> 3. **Editorially Verified:** 4 uzman rolünün onayını taşıyan doğrulanmış insan kanıtı oranı.

---

## 1. Temel Seviye Envanteri ve Üç Ayrık Metrik

| Seviye | Toplam Öğe | Field Coverage | Automatic Structural Pass | Editorially Verified | Audit Hata | Audit Uyarı | İnsan Onayı | Bekleyen |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
${rows
  .map(
    (r) =>
      `| ${r.level} | ${r.totalItems} | ${r.fieldCoverageRate} | ${r.automaticStructuralPassRate} | ${r.editoriallyVerifiedRate} | ${r.auditErrors} | ${r.auditWarnings} | ${r.humanReviewCount} | ${r.totalItems - r.humanReviewCount} |`
  )
  .join("\n")}

Toplam: **${queueSummary.total}** öğe; insan onayı bulunan **${queueSummary.humanApproved}**, bekleyen **${queueSummary.pending}**.

---

## 2. Kapsam ve Pedagojik Alan Dağılımı

| Seviye | Örnek Cümle | Türkçe Çeviri | Sense ID | IPA (Toplam) | IPA Doğrulanmış | IPA Bekleyen | Collocation | Production | Target-Enforced Prod. |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
${rows
  .map(
    (r) =>
      `| ${r.level} | ${r.exampleCoverage}/${r.totalItems} (${pct(r.exampleCoverage, r.totalItems)}) | ${r.translationCoverage}/${r.totalItems} (${pct(r.translationCoverage, r.totalItems)}) | ${r.senseCoverage}/${r.totalItems} (${pct(r.senseCoverage, r.totalItems)}) | ${r.ipaCoverage}/${r.totalItems} (${pct(r.ipaCoverage, r.totalItems)}) | ${r.ipaVerified}/${r.totalItems} (${pct(r.ipaVerified, r.totalItems)}) | ${r.ipaPending}/${r.totalItems} (${pct(r.ipaPending, r.totalItems)}) | ${r.collocationCoverage}/${r.totalItems} (${pct(r.collocationCoverage, r.totalItems)}) | ${r.productionCoverage}/${r.totalItems} (${pct(r.productionCoverage, r.totalItems)}) | ${r.targetEnforcedProduction}/${r.totalItems} (${pct(r.targetEnforcedProduction, r.totalItems)}) |`
  )
  .join("\n")}

---

## 3. Sözcük Türü (POS) Dağılımı

| Seviye | Noun (İsim) | Verb (Fiil) | Adjective (Sıfat) | Adverb (Zarf) | Phrase (Öbek) |
|---|---:|---:|---:|---:|---:|
${rows
  .map(
    (r) =>
      `| ${r.level} | ${r.posDistribution.noun} | ${r.posDistribution.verb} | ${r.posDistribution.adjective} | ${r.posDistribution.adverb} | ${r.posDistribution.phrase} |`
  )
  .join("\n")}

---

## 4. Editoryal Bulgu ve Öncelik Dağılımı (P0–P3)

| Seviye | P0 (Yayın Engelleyici) | P1 (Ciddi Düzeltme) | P2 (Pedagojik İyileştirme) | P3 (Küçük Stil) | Distractor Uygunluğu | Tekrarlanan Şablon (Ex/Tr) |
|---|---:|---:|---:|---:|---:|---:|
${rows
  .map(
    (r) =>
      `| ${r.level} | ${r.p0Count} | ${r.p1Count} | ${r.p2Count} | ${r.p3Count} | ${r.distractorSuitability}/${r.totalItems} (${pct(r.distractorSuitability, r.totalItems)}) | ${r.repeatedExampleTemplates} / ${r.repeatedTranslationTemplates} |`
  )
  .join("\n")}

---

## 5. Seviye Bazlı Editoryal Eylem Planı

| Seviye | Editoryal Kontrol Kapsamı |
|---|---|
${levels.map((level) => `| ${level} | ${actionByLevel[level]} |`).join("\n")}

---

## 6. Zorunlu 4 Rol İş Akışı ve İnsan Onayı

1. **English usage editor:** hedef sözcük türü, doğal sözdizimi, örnek cümle, collocation, IPA ve register.
2. **Turkish translation editor:** anlamın doğru sense'e bağlanması, doğal Türkçe çeviri ve seçeneklerin ayırt edilebilirliği.
3. **CEFR/curriculum expert:** seviye, topic/unit ilerlemesi, zorluk ve üretim kriteri.
4. **Final decider:** audit 0, dört rolün kanıtı, local/Firestore bütünlüğü ve yayın kararı.
5. **Evidence write:** her rol için reviewerId, reviewId, reviewedAt, rubricVersion ve decision kaydı.

---

## 7. Yayın Kapısı ve Güvenlik Güvencesi

Bir öğe ancak \`status=published\`, \`editorialStatus=approved\`, dört rolün doğrulanabilir kaydı, audit hata sayısı 0 ve local/Firestore içerik bütünlüğü sağlandığında yayınlanabilir. Bu rapor yapay insan onayı üretmez; reviewer rolü atanıp kararlar girilene kadar tüm seviyeler insan incelemesine kilitli kalmalıdır.
`;

const output = path.join(process.cwd(), "docs", "editorial-level-readiness-report.md");
fs.mkdirSync(path.dirname(output), { recursive: true });
fs.writeFileSync(output, markdown, "utf8");
console.log(JSON.stringify({ output, rows, summary: queueSummary }, null, 2));
