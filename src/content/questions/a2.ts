import { MeaningMatchQuestion } from "../../domain/models/content";
import { a2GeneratedQuestions } from "./a2Generated";
import { A2_IPA } from "../vocabulary/a2Ipa";
import { A2_PHRASE_QUESTIONS } from "../vocabulary/a2Phrases";
import { A2_COLLOCATIONS } from "../vocabulary/a2Collocations";
import { getA2ProductionPrompt } from "../vocabulary/a2ProductionPrompts";
import { ensureProductionMetadata, exampleCollocation } from "../productionMetadata";

const A2_PHRASE_IPA: Record<string, string> = {
  "exchange rate": "/ɪksˈtʃeɪndʒ reɪt/",
  "shopping mall": "/ˈʃɑːpɪŋ mɔːl/",
  "online shopping": "/ˈɑːnlaɪn ˈʃɑːpɪŋ/",
  "credit card": "/ˈkredɪt kɑːrd/",
  "global warming": "/ˈɡloʊbəl ˈwɔːrmɪŋ/",
};

export const A2_TOPIC_ID_MAP: Record<string, string> = {
  "İş & Kariyer": "a2.work_career",
  "Seyahat": "a2.travel_mobility",
  "Seyahat & Keşif": "a2.travel_mobility",
  "Teknoloji": "a2.technology_media",
  "Alışveriş & Para": "a2.money_services",
  "Duygular & Görüşler": "a2.opinions_emotions",
  "Sıfatlar & Duygular": "a2.opinions_emotions",
  "Çevre & Hava Durumu": "a2.environment_weather",
  "Çevre & Yaşam": "a2.environment_weather",
  "Doğa & Çevre": "a2.environment_weather",
  "Doğa & Bitkiler": "a2.environment_weather",
  "Sosyal Yaşam": "a2.social_life",
};

function a2EditorialMetadata(question: MeaningMatchQuestion): MeaningMatchQuestion {
  const key = question.word.toLocaleLowerCase("en");
  const isPhrase = question.learningItemKind === "phrase" || question.partOfSpeech === "phrase";
  const validCollocation = question.collocation || A2_COLLOCATIONS[key] || exampleCollocation(question) || (isPhrase ? question.word : undefined);
  const prompt = question.productionPrompt || getA2ProductionPrompt(question.word, question.topic);
  const topicId = question.topicId || A2_TOPIC_ID_MAP[question.topic] || "a2.work_career";

  return ensureProductionMetadata({
    ...question,
    topicId,
    unitId: question.unitId || `${topicId}.u01`,
    lessonId: question.lessonId || `${topicId}.l01`,
    collocation: validCollocation,
    productionPrompt: prompt,
    cefr: "A2",
    learningItemKind: question.learningItemKind ?? (isPhrase ? "phrase" : "word"),
    register: question.register ?? "neutral",
    phonetic: question.phonetic || A2_IPA[key] || A2_PHRASE_IPA[key],
    senseId: question.senseId ?? `a2.${isPhrase ? "phrase" : "word"}.${key.replace(/[^a-z]+/g, "-").replace(/^-|-$/g, "")}.${question.partOfSpeech || "word"}`,
    source: question.source ?? "A2 core vocabulary editorial review 2026-09",
    reviewer: question.reviewer ?? "LingoRise editorial QA",
    reviewedAt: question.reviewedAt ?? "2026-09-11",
    editorialStatus: question.editorialStatus ?? "needs_review",
  });
}

export const a2MeaningMatchQuestions: MeaningMatchQuestion[] = [
  {
    id: "a2-mm-01",
    mode: "MEANING_MATCH",
    level: "A2",
    topic: "Doğa & Bitkiler",
    word: "blossom",
    meaning: "çiçek açmak",
    wrongOptions: ["solmak", "yaprak dökmek"],
    xp: 15,
    difficulty: 2,
    phonetic: "/ˈblɒs.əm/",
    partOfSpeech: "verb",
    exampleSentence: "Cherry trees blossom in spring with beautiful pink flowers.",
    exampleTranslation: "Kiraz ağaçları ilkbaharda güzel pembe çiçeklerle çiçek açar.",
    contextNote: "Ağaçların veya bitkilerin baharda çiçek üretme eylemi.",
    pronunciation: "blossom",
    hint: "Ağaçların baharda rengarenk çiçeklerle kaplanması.",
    prompt: "blossom",
    answer: "çiçek açmak",
    options: ["çiçek açmak", "solmak", "yaprak dökmek"],
    collocation: "blossom in spring",
    productionPrompt: "Describe how trees blossom in spring in your city. Use \"blossom\" and at least 4 words.",
    senseId: "a2.word.blossom.verb",
  },
  {
    id: "a2-mm-02",
    mode: "MEANING_MATCH",
    level: "A2",
    topic: "Seyahat & Keşif",
    word: "journey",
    meaning: "yolculuk",
    wrongOptions: ["ulaşım bileti", "seyahat rotası"],
    xp: 15,
    difficulty: 2,
    phonetic: "/ˈdʒɜː.ni/",
    partOfSpeech: "noun",
    exampleSentence: "I wished my sister a safe journey before her train left.",
    exampleTranslation: "Tren kalkmadan önce kız kardeşime iyi bir yolculuk diledim.",
    contextNote: "Bir noktadan diğerine giden seyahat veya yolculuk.",
    pronunciation: "journey",
    hint: "Bir yerden başka bir yere yapılan seyahat.",
    prompt: "journey",
    answer: "yolculuk",
    options: ["yolculuk", "ulaşım bileti", "seyahat rotası"],
    collocation: "safe journey",
    productionPrompt: "Wish a traveling friend a safe journey by train. Use \"journey\" and at least 4 words.",
    senseId: "a2.word.journey.noun",
  },
  {
    id: "a2-mm-03",
    mode: "MEANING_MATCH",
    level: "A2",
    topic: "Sıfatlar & Duygular",
    word: "gentle",
    meaning: "nazik",
    wrongOptions: ["sert", "kaba"],
    xp: 15,
    difficulty: 2,
    phonetic: "/ˈdʒen.təl/",
    partOfSpeech: "adjective",
    exampleSentence: "A gentle breeze cooled the garden on a hot afternoon.",
    exampleTranslation: "Nazik bir esinti sıcak bir öğleden sonra bahçeyi serinletti.",
    contextNote: "Yumuşak, ılımlı ve sakin durumları tanımlar.",
    pronunciation: "gentle",
    hint: "Yumuşak huylu, kibar ve incelikli davranış.",
    prompt: "gentle",
    answer: "nazik",
    options: ["nazik", "sert", "kaba"],
    collocation: "gentle breeze",
    productionPrompt: "Describe how a gentle breeze feels on a summer afternoon. Use \"gentle\" and at least 4 words.",
    senseId: "a2.word.gentle.adjective",
  },
  {
    id: "a2-mm-04",
    mode: "MEANING_MATCH",
    level: "A2",
    topic: "Çevre & Yaşam",
    word: "shelter",
    meaning: "barınak",
    wrongOptions: ["açık alan", "kamp çadırı"],
    xp: 15,
    difficulty: 2,
    phonetic: "/ˈʃel.tər/",
    partOfSpeech: "noun",
    exampleSentence: "Street animals find shelter under the roof during rainy nights.",
    exampleTranslation: "Sokak hayvanları yağmurlu gecelerde çatının altında barınak bulur.",
    contextNote: "Hava koşullarından ve tehlikeden koruyan güvenli sığınak.",
    pronunciation: "shelter",
    hint: "Yağmurdan veya tehlikeden koruyan güvenli sığınak.",
    prompt: "shelter",
    answer: "barınak",
    options: ["barınak", "açık alan", "kamp çadırı"],
    collocation: "find shelter",
    productionPrompt: "Explain where stray animals find shelter in stormy weather. Use \"shelter\" and at least 4 words.",
    senseId: "a2.word.shelter.noun",
  },
  {
    id: "a2-mm-05",
    mode: "MEANING_MATCH",
    level: "A2",
    topic: "Doğa & Çevre",
    word: "soil",
    meaning: "verimli toprak",
    wrongOptions: ["kuru kum", "taşlı zemin"],
    xp: 15,
    difficulty: 2,
    phonetic: "/sɔɪl/",
    partOfSpeech: "noun",
    exampleSentence: "Plant the tomato seeds in moist soil and water them daily.",
    exampleTranslation: "Domates tohumlarını nemli toprağa ekin ve her gün sulayın.",
    contextNote: "Bitki yetiştirmeye uygun nemli veya verimli toprak yapısını ifade eder.",
    pronunciation: "soil",
    hint: "Bitkilerin kök salıp beslendiği verimli yeryüzü katmanı.",
    prompt: "soil",
    answer: "verimli toprak",
    options: ["verimli toprak", "kuru kum", "taşlı zemin"],
    collocation: "moist soil",
    productionPrompt: "Explain why seeds need moist soil to grow healthy roots. Use \"soil\" and at least 4 words.",
    senseId: "a2.word.soil.fertile_ground",
  },
];

const A2_UNIT_SIZE = 30;

export const a2Questions: MeaningMatchQuestion[] = [
  ...a2MeaningMatchQuestions,
  ...a2GeneratedQuestions,
  ...A2_PHRASE_QUESTIONS,
].map((question, index) => {
  const enriched = a2EditorialMetadata(question);
  return {
    ...enriched,
    unitId: enriched.unitId || `a2-u${String(Math.floor(index / A2_UNIT_SIZE) + 1).padStart(2, "0")}`,
    order: index,
    status: "published" as const,
  };
});
