import { PartOfSpeech } from "../../types/content";

export type A1VocabularyTopic =
  | "people"
  | "daily_life"
  | "home_city"
  | "food"
  | "nature"
  | "health_emotions"
  | "core_verbs"
  | "descriptions";

export interface VocabularyEntry {
  id: string;
  word: string;
  meaningTr: string;
  topic: A1VocabularyTopic;
  partOfSpeech: PartOfSpeech;
  safety: "safe";
  status: "approved";
}

type Row = readonly [string, string, PartOfSpeech];
const rows = (topic: A1VocabularyTopic, values: Row[]): VocabularyEntry[] =>
  values.map(([word, meaningTr, partOfSpeech]) => ({
    id: `a1-core-${word.replace(/[^a-z]/g, "-")}`,
    word,
    meaningTr,
    topic,
    partOfSpeech,
    safety: "safe",
    status: "approved",
  }));

// Editorial policy: high-frequency everyday language only. Profanity, slurs,
// sexual content, drugs, violence and political persuasion are excluded.
export const A1_CORE_VOCABULARY: VocabularyEntry[] = [
  ...rows("people", [
    ["I", "ben", "phrase"], ["you", "sen/siz", "phrase"], ["he", "o (erkek)", "phrase"], ["she", "o (kadın)", "phrase"], ["we", "biz", "phrase"], ["they", "onlar", "phrase"], ["person", "kişi", "noun"], ["people", "insanlar", "noun"], ["man", "adam", "noun"], ["woman", "kadın", "noun"], ["child", "çocuk", "noun"], ["baby", "bebek", "noun"], ["friend", "arkadaş", "noun"], ["family", "aile", "noun"], ["mother", "anne", "noun"], ["father", "baba", "noun"], ["parent", "ebeveyn", "noun"], ["brother", "erkek kardeş", "noun"], ["sister", "kız kardeş", "noun"], ["son", "oğul", "noun"], ["daughter", "kız evlat", "noun"], ["husband", "eş", "noun"], ["wife", "eş", "noun"], ["name", "isim", "noun"], ["teacher", "öğretmen", "noun"], ["student", "öğrenci", "noun"], ["doctor", "doktor", "noun"], ["worker", "çalışan", "noun"], ["neighbor", "komşu", "noun"], ["boy", "erkek çocuk", "noun"], ["girl", "kız çocuk", "noun"], ["adult", "yetişkin", "noun"], ["guest", "misafir", "noun"], ["visitor", "ziyaretçi", "noun"], ["team", "takım", "noun"], ["group", "grup", "noun"], ["class", "sınıf", "noun"], ["member", "üye", "noun"], ["kind", "nazik", "adjective"], ["welcome", "hoş geldin", "phrase"],
  ]),
  ...rows("daily_life", [
    ["day", "gün", "noun"], ["week", "hafta", "noun"], ["month", "ay", "noun"], ["year", "yıl", "noun"], ["morning", "sabah", "noun"], ["afternoon", "öğleden sonra", "noun"], ["evening", "akşam", "noun"], ["night", "gece", "noun"], ["today", "bugün", "adverb"], ["tomorrow", "yarın", "adverb"], ["yesterday", "dün", "adverb"], ["now", "şimdi", "adverb"], ["later", "sonra", "adverb"], ["early", "erken", "adjective"], ["late", "geç", "adjective"], ["time", "zaman", "noun"], ["hour", "saat", "noun"], ["minute", "dakika", "noun"], ["breakfast", "kahvaltı", "noun"], ["lunch", "öğle yemeği", "noun"], ["dinner", "akşam yemeği", "noun"], ["work", "iş", "noun"], ["school", "okul", "noun"], ["lesson", "ders", "noun"], ["homework", "ödev", "noun"], ["book", "kitap", "noun"], ["page", "sayfa", "noun"], ["pen", "kalem", "noun"], ["paper", "kağıt", "noun"], ["bag", "çanta", "noun"], ["phone", "telefon", "noun"], ["computer", "bilgisayar", "noun"], ["music", "müzik", "noun"], ["movie", "film", "noun"], ["game", "oyun", "noun"], ["picture", "resim", "noun"], ["question", "soru", "noun"], ["answer", "cevap", "noun"], ["story", "hikâye", "noun"], ["idea", "fikir", "noun"],
  ]),
  ...rows("home_city", [
    ["home", "ev", "noun"], ["house", "ev", "noun"], ["room", "oda", "noun"], ["door", "kapı", "noun"], ["window", "pencere", "noun"], ["wall", "duvar", "noun"], ["floor", "zemin", "noun"], ["table", "masa", "noun"], ["chair", "sandalye", "noun"], ["bed", "yatak", "noun"], ["kitchen", "mutfak", "noun"], ["bathroom", "banyo", "noun"], ["garden", "bahçe", "noun"], ["street", "sokak", "noun"], ["road", "yol", "noun"], ["city", "şehir", "noun"], ["town", "kasaba", "noun"], ["village", "köy", "noun"], ["shop", "mağaza", "noun"], ["market", "pazar", "noun"], ["bank", "banka", "noun"], ["park", "park", "noun"], ["station", "istasyon", "noun"], ["bus", "otobüs", "noun"], ["train", "tren", "noun"], ["car", "araba", "noun"], ["bike", "bisiklet", "noun"], ["taxi", "taksi", "noun"], ["ticket", "bilet", "noun"], ["map", "harita", "noun"], ["left", "sol", "adjective"], ["right", "sağ", "adjective"], ["near", "yakın", "adjective"], ["far", "uzak", "adjective"], ["open", "açık", "adjective"], ["closed", "kapalı", "adjective"], ["address", "adres", "noun"], ["place", "yer", "noun"], ["here", "burada", "adverb"], ["there", "orada", "adverb"],
  ]),
  ...rows("food", [
    ["water", "su", "noun"], ["tea", "çay", "noun"], ["coffee", "kahve", "noun"], ["milk", "süt", "noun"], ["juice", "meyve suyu", "noun"], ["bread", "ekmek", "noun"], ["rice", "pirinç", "noun"], ["pasta", "makarna", "noun"], ["soup", "çorba", "noun"], ["salad", "salata", "noun"], ["meat", "et", "noun"], ["fish", "balık", "noun"], ["egg", "yumurta", "noun"], ["cheese", "peynir", "noun"], ["fruit", "meyve", "noun"], ["apple", "elma", "noun"], ["banana", "muz", "noun"], ["orange", "portakal", "noun"], ["lemon", "limon", "noun"], ["vegetable", "sebze", "noun"], ["potato", "patates", "noun"], ["tomato", "domates", "noun"], ["cake", "kek", "noun"], ["sugar", "şeker", "noun"], ["salt", "tuz", "noun"], ["snack", "atıştırmalık", "noun"], ["menu", "menü", "noun"], ["restaurant", "restoran", "noun"], ["cafe", "kafe", "noun"], ["bottle", "şişe", "noun"], ["cup", "fincan", "noun"], ["plate", "tabak", "noun"], ["spoon", "kaşık", "noun"], ["fork", "çatal", "noun"], ["hungry", "aç", "adjective"], ["thirsty", "susamış", "adjective"], ["delicious", "lezzetli", "adjective"], ["hot", "sıcak", "adjective"], ["cold", "soğuk", "adjective"], ["fresh", "taze", "adjective"],
  ]),
  ...rows("nature", [
    ["sun", "güneş", "noun"], ["moon", "ay", "noun"], ["star", "yıldız", "noun"], ["sky", "gökyüzü", "noun"], ["cloud", "bulut", "noun"], ["rain", "yağmur", "noun"], ["snow", "kar", "noun"], ["wind", "rüzgar", "noun"], ["weather", "hava durumu", "noun"], ["tree", "ağaç", "noun"], ["leaf", "yaprak", "noun"], ["flower", "çiçek", "noun"], ["seed", "tohum", "noun"], ["grass", "çimen", "noun"], ["soil", "toprak", "noun"], ["river", "nehir", "noun"], ["sea", "deniz", "noun"], ["mountain", "dağ", "noun"], ["forest", "orman", "noun"], ["animal", "hayvan", "noun"], ["dog", "köpek", "noun"], ["cat", "kedi", "noun"], ["bird", "kuş", "noun"], ["horse", "at", "noun"], ["cow", "inek", "noun"], ["sheep", "koyun", "noun"], ["green", "yeşil", "adjective"], ["blue", "mavi", "adjective"], ["red", "kırmızı", "adjective"], ["yellow", "sarı", "adjective"], ["white", "beyaz", "adjective"], ["black", "siyah", "adjective"], ["brown", "kahverengi", "adjective"], ["beautiful", "güzel", "adjective"], ["clean", "temiz", "adjective"], ["dry", "kuru", "adjective"], ["wet", "ıslak", "adjective"], ["warm", "ılık", "adjective"], ["cool", "serin", "adjective"], ["bright", "parlak", "adjective"],
  ]),
  ...rows("health_emotions", [
    ["body", "vücut", "noun"], ["head", "baş", "noun"], ["face", "yüz", "noun"], ["eye", "göz", "noun"], ["ear", "kulak", "noun"], ["nose", "burun", "noun"], ["mouth", "ağız", "noun"], ["hand", "el", "noun"], ["arm", "kol", "noun"], ["leg", "bacak", "noun"], ["foot", "ayak", "noun"], ["heart", "kalp", "noun"], ["health", "sağlık", "noun"], ["medicine", "ilaç", "noun"], ["hospital", "hastane", "noun"], ["happy", "mutlu", "adjective"], ["sad", "üzgün", "adjective"], ["tired", "yorgun", "adjective"], ["angry", "kızgın", "adjective"], ["afraid", "korkmuş", "adjective"], ["calm", "sakin", "adjective"], ["quiet", "sessiz", "adjective"], ["busy", "meşgul", "adjective"], ["ready", "hazır", "adjective"], ["well", "iyi", "adjective"], ["sick", "hasta", "adjective"], ["strong", "güçlü", "adjective"], ["weak", "zayıf", "adjective"], ["careful", "dikkatli", "adjective"], ["safe", "güvenli", "adjective"], ["help", "yardım", "noun"], ["smile", "gülümseme", "noun"], ["love", "sevgi", "noun"], ["hope", "umut", "noun"], ["sleep", "uyku", "noun"], ["rest", "dinlenme", "noun"], ["pain", "ağrı", "noun"], ["exercise", "egzersiz", "noun"], ["healthy", "sağlıklı", "adjective"], ["fine", "iyi", "adjective"],
  ]),
  ...rows("core_verbs", [
    ["be", "olmak", "verb"], ["have", "sahip olmak", "verb"], ["do", "yapmak", "verb"], ["go", "gitmek", "verb"], ["come", "gelmek", "verb"], ["get", "almak", "verb"], ["make", "yapmak", "verb"], ["take", "almak", "verb"], ["give", "vermek", "verb"], ["put", "koymak", "verb"], ["keep", "tutmak", "verb"], ["know", "bilmek", "verb"], ["think", "düşünmek", "verb"], ["want", "istemek", "verb"], ["need", "ihtiyaç duymak", "verb"], ["like", "sevmek", "verb"], ["enjoy", "keyif almak", "verb"], ["use", "kullanmak", "verb"], ["find", "bulmak", "verb"], ["look", "bakmak", "verb"], ["see", "görmek", "verb"], ["watch", "izlemek", "verb"], ["hear", "duymak", "verb"], ["listen", "dinlemek", "verb"], ["say", "söylemek", "verb"], ["speak", "konuşmak", "verb"], ["ask", "sormak", "verb"], ["tell", "anlatmak", "verb"], ["read", "okumak", "verb"], ["write", "yazmak", "verb"], ["learn", "öğrenmek", "verb"], ["teach", "öğretmek", "verb"], ["study", "ders çalışmak", "verb"], ["play", "oynamak", "verb"], ["walk", "yürümek", "verb"], ["run", "koşmak", "verb"], ["sit", "oturmak", "verb"], ["stand", "ayakta durmak", "verb"], ["unlock", "kilidini açmak", "verb"], ["close", "kapatmak", "verb"],
  ]),
  ...rows("descriptions", [
    ["big", "büyük", "adjective"], ["small", "küçük", "adjective"], ["long", "uzun", "adjective"], ["short", "kısa", "adjective"], ["new", "yeni", "adjective"], ["old", "eski", "adjective"], ["good", "iyi", "adjective"], ["bad", "kötü", "adjective"], ["easy", "kolay", "adjective"], ["difficult", "zor", "adjective"], ["fast", "hızlı", "adjective"], ["slow", "yavaş", "adjective"], ["young", "genç", "adjective"], ["full", "dolu", "adjective"], ["empty", "boş", "adjective"], ["cheap", "ucuz", "adjective"], ["expensive", "pahalı", "adjective"], ["important", "önemli", "adjective"], ["different", "farklı", "adjective"], ["same", "aynı", "adjective"], ["many", "çok", "adjective"], ["few", "az", "adjective"], ["more", "daha fazla", "adjective"], ["less", "daha az", "adjective"], ["all", "hepsi", "adjective"], ["every", "her", "adjective"], ["some", "bazı", "adjective"], ["other", "diğer", "adjective"], ["first", "ilk", "adjective"], ["last", "son", "adjective"], ["one", "bir", "adjective"], ["two", "iki", "adjective"], ["three", "üç", "adjective"], ["four", "dört", "adjective"], ["five", "beş", "adjective"], ["six", "altı", "adjective"], ["seven", "yedi", "adjective"], ["eight", "sekiz", "adjective"], ["nine", "dokuz", "adjective"], ["ten", "on", "adjective"],
  ]),
];

export function getApprovedA1Vocabulary(): VocabularyEntry[] {
  return A1_CORE_VOCABULARY.filter((entry) => entry.safety === "safe" && entry.status === "approved");
}

export function validateA1VocabularyPool(): string[] {
  const errors: string[] = [];
  const seen = new Set<string>();
  for (const entry of A1_CORE_VOCABULARY) {
    if (seen.has(entry.word)) errors.push(`duplicate:${entry.word}`);
    if (!entry.word || !entry.meaningTr || entry.safety !== "safe" || entry.status !== "approved") errors.push(`invalid:${entry.id}`);
    seen.add(entry.word);
  }
  return errors;
}
