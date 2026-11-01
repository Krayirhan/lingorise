import { MeaningMatchQuestion } from "../../domain/models/content";
import { computeDifficulty, computeXpReward } from "./difficulty";
import { C2_PRECISE_ITEMS, C2ItemRaw } from "./c2PreciseData";
import { C2_SPECIALIST_ITEMS } from "./c2SpecialistData";

function buildQuestions(items: readonly C2ItemRaw[], topic: string, prefix: string, startOrder: number): MeaningMatchQuestion[] {
  return items.map((item, i) => {
    return {
      id: "c2-" + prefix + "-" + String(i + 1).padStart(2, "0"),
      mode: "MEANING_MATCH",
      level: "C2",
      cefr: "C2",
      topic,
      topicId: "c2." + prefix,
      unitId: "c2." + prefix + ".u01",
      lessonId: "c2." + prefix + ".l01",
      word: item.word,
      meaning: item.meaning,
      wrongOptions: [item.d1, item.d2],
      options: [item.meaning, item.d1, item.d2],
      xp: computeXpReward("C2", item.word),
      difficulty: computeDifficulty("C2", item.word),
      partOfSpeech: item.pos,
      learningItemKind: "word",
      senseId: item.senseId,
      register: item.register,
      phonetic: item.ipa,
      pronunciation: item.word,
      exampleSentence: item.exampleSentence,
      exampleTranslation: item.exampleTranslation,
      contextNote: "C2 " + topic.toLocaleLowerCase("tr") + " bağlamında " + item.senseId + " anlamı.",
      collocation: item.collocation,
      productionPrompt: item.productionPrompt,
      hint: "Bu sözcüğü \"" + item.collocation + "\" eşdizimiyle ve " + item.register + " kayıtta düşün.",
      prompt: item.word,
      answer: item.meaning,
      order: startOrder + i,
      status: "draft",
      editorialStatus: "needs_review",
      source: "C2 editorial rewrite set · 2026-09-12 · independent academic & specialist corpus",
    };
  });
}

export const c2Questions: MeaningMatchQuestion[] = [
  ...buildQuestions(C2_PRECISE_ITEMS, "Kesin ve Esnek Anlatım", "precise", 0),
  ...buildQuestions(C2_SPECIALIST_ITEMS, "Uzmanlık Söylemi", "specialist", C2_PRECISE_ITEMS.length),
];
