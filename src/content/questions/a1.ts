import { MeaningMatchQuestion } from "../../domain/models/content";
import { A1_CORE_VOCABULARY } from "../vocabulary/a1CoreVocabulary";
import { A1_EXAMPLE_SENTENCES } from "../vocabulary/a1ExampleSentences";
import { A1_IPA } from "../vocabulary/a1Ipa";
import { A1_PHRASE_QUESTIONS } from "../vocabulary/a1Phrases";
import { A1_COLLOCATIONS } from "../vocabulary/a1Collocations";
import { getA1ProductionPrompt } from "../vocabulary/a1ProductionPrompts";
import { computeDifficulty, computeXpReward } from "./difficulty";
import { ensureProductionMetadata, exampleCollocation } from "../productionMetadata";

const A1_TOPIC_NOTES: Record<string, string> = {
  people: "Kendini ve yakın çevrendeki kişileri anlatırken kullanılır.",
  daily_life: "Günlük zaman, okul ve rutinleri anlatırken kullanılır.",
  home_city: "Ev, şehir ve yön tarifinde kullanılır.",
  food: "Yemek, içecek ve alışveriş bağlamında kullanılır.",
  nature: "Doğa ve hava durumunu anlatırken kullanılır.",
  health_emotions: "Temel sağlık durumunu veya duyguyu anlatırken kullanılır.",
  core_verbs: "Günlük eylem veya ihtiyacı anlatırken kullanılır.",
  descriptions: "Bir kişiyi, nesneyi veya durumu tarif eder.",
  "Sıfatlar": "Bir kişiyi, nesneyi veya durumu tarif eder.",
  "Bahçe & Doğa": "Doğa ve hava durumunu anlatırken kullanılır.",
  "Günlük Yaşam": "Günlük zaman, okul ve rutinleri anlatırken kullanılır.",
  "Duygular": "Temel sağlık durumunu veya duyguyu anlatırken kullanılır.",
  "Zaman & Gün": "Günlük zaman, okul ve rutinleri anlatırken kullanılır.",
  "Renkler & Doğa": "Doğa ve hava durumunu anlatırken kullanılır.",
  "Ev & Bahçe": "Ev, şehir ve yön tarifinde kullanılır.",
};

const A1_TOPIC_ID_MAP: Record<string, string> = {
  people: "a1.people_identity",
  daily_life: "a1.daily_routines",
  home_city: "a1.home_city",
  food: "a1.food_shopping",
  core_verbs: "a1.core_actions",
  descriptions: "a1.descriptions",
  nature: "a1.nature_weather",
  health_emotions: "a1.health_feelings",
  "Sıfatlar": "a1.descriptions",
  "Bahçe & Doğa": "a1.nature_weather",
  "Günlük Yaşam": "a1.daily_routines",
  "Duygular": "a1.health_feelings",
  "Zaman & Gün": "a1.daily_routines",
  "Renkler & Doğa": "a1.nature_weather",
  "Ev & Bahçe": "a1.home_city",
};

function a1EditorialMetadata(question: MeaningMatchQuestion): MeaningMatchQuestion {
  const wordKey = question.word.toLocaleLowerCase("en");
  const senseKey = wordKey.replace(/[^a-z]+/g, "-").replace(/^-|-$/g, "");
  const isPhrase = question.id.startsWith("a1-phrase-");
  const curatedPrompt = isPhrase
    ? question.productionPrompt || `Use the phrase "${question.word}" in a short everyday sentence. Write at least 3 words.`
    : getA1ProductionPrompt(question.word, question.topic);

  const topicId = question.topicId || A1_TOPIC_ID_MAP[question.topic] || "a1.daily_routines";
  const validCollocation = A1_COLLOCATIONS[wordKey] || question.collocation || exampleCollocation(question) || question.word;

  return ensureProductionMetadata({
    ...question,
    topicId,
    unitId: question.unitId || `${topicId}.u01`,
    lessonId: question.lessonId || `${topicId}.l01`,
    collocation: validCollocation,
    productionPrompt: question.productionPrompt || curatedPrompt,
    cefr: "A1",
    learningItemKind: isPhrase ? "phrase" : "word",
    register: question.register ?? "neutral",
    phonetic: question.phonetic || A1_IPA[wordKey],
    contextNote: question.contextNote || A1_TOPIC_NOTES[question.topic] || "Temel A1 günlük yaşam bağlamında kullanılır.",
    source: question.source ?? "A1 editorial rewrite 2026-09",
    reviewer: question.reviewer ?? "LingoRise editorial QA",
    reviewedAt: question.reviewedAt ?? "2026-09-11",
    editorialStatus: question.editorialStatus ?? "needs_review",
    senseId: question.senseId ?? `a1.${isPhrase ? "phrase" : "word"}.${senseKey}.${question.partOfSpeech || "word"}`,
  });
}


export const a1MeaningMatchQuestions: MeaningMatchQuestion[] = [
  {
    id: "a1-mm-01",
    mode: "MEANING_MATCH",
    level: "A1",
    topic: "Sıfatlar",
    word: "quiet",
    meaning: "sessiz",
    wrongOptions: ["hızlı", "mutlu"],
    xp: 10,
    difficulty: 1,
    phonetic: "/ˈkwaɪ.ət/",
    partOfSpeech: "adjective",
    collocation: "quiet room",
    exampleSentence: "I like to study in a quiet room.",
    exampleTranslation: "Sessiz bir odada ders çalışmayı severim.",
    productionPrompt: "Describe your ideal study location using 'quiet'. Write at least 3 words.",
    contextNote: "Gürültü ve sesin bulunmadığı sakin durumları niteler.",
    pronunciation: "quiet",
    hint: "Gürültüsüz, sakin ve huzurlu bir durum.",
    prompt: "quiet",
    answer: "sessiz",
    options: ["sessiz", "hızlı", "mutlu"],
  },
  {
    id: "a1-mm-02",
    mode: "MEANING_MATCH",
    level: "A1",
    topic: "Bahçe & Doğa",
    word: "leaf",
    meaning: "yaprak",
    wrongOptions: ["ağaç", "toprak"],
    xp: 10,
    difficulty: 1,
    phonetic: "/liːf/",
    partOfSpeech: "noun",
    collocation: "green leaf",
    exampleSentence: "Look at that lovely green leaf on the branch.",
    exampleTranslation: "Daldaki şu sevimli yeşil yaprağa bak.",
    productionPrompt: "Describe foliage in spring using 'leaf'. Write at least 3 words.",
    contextNote: "Ağaç ve bitkilerin yeşil parçası.",
    pronunciation: "leaf",
    hint: "Bitkilerin yeşil renkli nefes alan parçası.",
    prompt: "leaf",
    answer: "yaprak",
    options: ["yaprak", "ağaç", "toprak"],
  },
  {
    id: "a1-mm-03",
    mode: "MEANING_MATCH",
    level: "A1",
    topic: "Günlük Yaşam",
    word: "water",
    meaning: "su",
    wrongOptions: ["ekmek", "kahve"],
    xp: 10,
    difficulty: 1,
    phonetic: "/ˈwɔː.tər/",
    partOfSpeech: "noun",
    collocation: "drink water",
    exampleSentence: "Please drink water every day for health.",
    exampleTranslation: "Sağlık için lütfen her gün su için.",
    productionPrompt: "Advise a friend to stay hydrated using 'water'. Write at least 3 words.",
    contextNote: "Tüm canlıların yaşam kaynağı olan berrak sıvı.",
    pronunciation: "water",
    hint: "Bitkilerin ve canlıların yaşam kaynağı.",
    prompt: "water",
    answer: "su",
    options: ["su", "ekmek", "kahve"],
  },
  {
    id: "a1-mm-04",
    mode: "MEANING_MATCH",
    level: "A1",
    topic: "Duygular",
    word: "happy",
    meaning: "mutlu",
    wrongOptions: ["üzgün", "yorgun"],
    xp: 10,
    difficulty: 1,
    phonetic: "/ˈhæp.i/",
    partOfSpeech: "adjective",
    collocation: "feel happy",
    exampleSentence: "I feel happy when I see my family.",
    exampleTranslation: "Ailemi gördüğümde mutlu hissederim.",
    productionPrompt: "Share what brings you joy using 'happy'. Write at least 3 words.",
    contextNote: "Sevinç, neşe ve memnuniyet belirten temel sıfat.",
    pronunciation: "happy",
    hint: "Sevinçli ve neşeli hissetme hali.",
    prompt: "happy",
    answer: "mutlu",
    options: ["mutlu", "üzgün", "yorgun"],
  },
  {
    id: "a1-mm-05",
    mode: "MEANING_MATCH",
    level: "A1",
    topic: "Zaman & Gün",
    word: "morning",
    meaning: "sabah",
    wrongOptions: ["gece", "öğle"],
    xp: 10,
    difficulty: 1,
    phonetic: "/ˈmɔː.nɪŋ/",
    partOfSpeech: "noun",
    collocation: "every morning",
    exampleSentence: "I drink coffee every morning before class.",
    exampleTranslation: "Dersten önce her sabah kahve içerim.",
    productionPrompt: "Describe what you drink upon waking using 'morning'. Write at least 3 words.",
    contextNote: "Günün güneş doğumuyla başlayan ilk periyodu.",
    pronunciation: "morning",
    hint: "Günün güneşle başlayan ilk saatleri.",
    prompt: "morning",
    answer: "sabah",
    options: ["sabah", "gece", "öğle"],
  },
  {
    id: "a1-mm-06",
    mode: "MEANING_MATCH",
    level: "A1",
    topic: "Renkler & Doğa",
    word: "green",
    meaning: "yeşil",
    wrongOptions: ["kırmızı", "sarı"],
    xp: 10,
    difficulty: 1,
    phonetic: "/ɡriːn/",
    partOfSpeech: "adjective",
    collocation: "bright green",
    exampleSentence: "The grass in the park is bright green.",
    exampleTranslation: "Parktaki çimenler parlak yeşildir.",
    productionPrompt: "Describe spring nature colors using 'green'. Write at least 3 words.",
    contextNote: "Doğayı, tazeliği ve bitkileri temsil eden ana renk.",
    pronunciation: "green",
    hint: "Çimenlerin ve yaprakların taze rengi.",
    prompt: "green",
    answer: "yeşil",
    options: ["yeşil", "kırmızı", "sarı"],
  },
  {
    id: "a1-mm-07",
    mode: "MEANING_MATCH",
    level: "A1",
    topic: "Ev & Bahçe",
    word: "seed",
    meaning: "tohum",
    wrongOptions: ["çiçek", "dal"],
    xp: 10,
    difficulty: 1,
    phonetic: "/siːd/",
    partOfSpeech: "noun",
    collocation: "plant a seed",
    exampleSentence: "We plant a seed in the soil together.",
    exampleTranslation: "Toprağa birlikte bir tohum ekeriz.",
    productionPrompt: "Talk about gardening at home using 'seed'. Write at least 3 words.",
    contextNote: "Toprağa ekildiğinde yeni bir bitki oluşturan çekirdek.",
    pronunciation: "seed",
    hint: "Toprağa ekildiğinde yeni bir bitki oluşturan küçük tanecik.",
    prompt: "seed",
    answer: "tohum",
    options: ["tohum", "çiçek", "dal"],
  },
];

const curatedWords = new Set(a1MeaningMatchQuestions.map((question) => question.word));
const generatedA1Questions: MeaningMatchQuestion[] = A1_CORE_VOCABULARY
  .filter((entry) => !curatedWords.has(entry.word))
  .map((entry, index, pool) => {
    // POS- and topic-matched distractor selection:
    // 1) Same partOfSpeech and same topic
    // 2) Same partOfSpeech across pool
    // 3) Fallback: any other entry in pool
    const samePosAndTopic = pool.filter(
      (c) => c.word !== entry.word && c.partOfSpeech === entry.partOfSpeech && c.topic === entry.topic && c.meaningTr !== entry.meaningTr
    );
    const samePos = pool.filter(
      (c) => c.word !== entry.word && c.partOfSpeech === entry.partOfSpeech && c.meaningTr !== entry.meaningTr
    );
    const fallback = pool.filter(
      (c) => c.word !== entry.word && c.meaningTr !== entry.meaningTr
    );

    // Combine candidates preserving preference order while removing duplicate words
    const candidates: typeof pool = [];
    const seenWords = new Set<string>();
    for (const group of [samePosAndTopic, samePos, fallback]) {
      for (const cand of group) {
        if (!seenWords.has(cand.word)) {
          seenWords.add(cand.word);
          candidates.push(cand);
        }
      }
    }

    // Rotate distractor offset with hash and index to avoid overused pairs
    const wrongOptions: string[] = [];
    const poolSize = candidates.length;
    const offset = (entry.word.charCodeAt(0) * 11 + index * 7);
    for (let i = 0; i < poolSize; i++) {
      const cand = candidates[(offset + i) % poolSize];
      if (!wrongOptions.includes(cand.meaningTr) && cand.meaningTr !== entry.meaningTr) {
        wrongOptions.push(cand.meaningTr);
        if (wrongOptions.length === 2) break;
      }
    }

    const wordLower = entry.word.toLowerCase();
    const example = A1_EXAMPLE_SENTENCES[wordLower];
    const exampleSentence = example?.en || `Learn and use the word “${entry.word}” in a simple sentence.`;
    const exampleTranslation = example?.tr || `“${entry.word}” kelimesini basit bir cümlede öğren ve kullan.`;
    const productionPrompt = getA1ProductionPrompt(entry.word, entry.topic);

    return {
      id: `a1-core-${entry.word.replace(/[^a-z]/g, "-")}`,
      mode: "MEANING_MATCH",
      level: "A1",
      topic: entry.topic,
      word: entry.word,
      meaning: entry.meaningTr,
      wrongOptions,
      xp: computeXpReward("A1", entry.word),
      difficulty: computeDifficulty("A1", entry.word),
      partOfSpeech: entry.partOfSpeech,
      exampleSentence,
      exampleTranslation,
      productionPrompt,
      contextNote: A1_TOPIC_NOTES[entry.topic],
      pronunciation: entry.word,
      phonetic: A1_IPA[wordLower],
      hint: `${entry.topic.replace(/_/g, " ")} konusundaki temel kelimeyi seç.`,
      prompt: entry.word,
      answer: entry.meaningTr,
      options: [entry.meaningTr, ...wrongOptions],
    };
  });

const A1_UNIT_SIZE = 30;

// Publishing metadata is stamped here rather than left blank, so every question
// carries the unit and ordering the rest of the app reads.
export const a1Questions: MeaningMatchQuestion[] = [
  ...a1MeaningMatchQuestions,
  ...generatedA1Questions,
  ...A1_PHRASE_QUESTIONS,
].map((question, index) => ({
  ...a1EditorialMetadata(question),
  unitId: `a1-u${String(Math.floor(index / A1_UNIT_SIZE) + 1).padStart(2, "0")}`,
  order: index,
  status: "published" as const,
}));
