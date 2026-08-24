import { Locale } from "./en";

export function formatDays(count: number, locale: Locale): string {
  if (locale === "tr") {
    return `${count} gün`;
  }
  return count === 1 ? "1 day" : `${count} days`;
}

export function formatQuestionsCount(count: number, locale: Locale): string {
  if (locale === "tr") {
    return `${count} soru`;
  }
  return count === 1 ? "1 question" : `${count} questions`;
}

export function formatReviewsCount(count: number, locale: Locale): string {
  if (locale === "tr") {
    return `${count} tekrar`;
  }
  return count === 1 ? "1 review" : `${count} reviews`;
}

export function formatXpReward(amount: number): string {
  return `+${amount} XP`;
}

export function formatPartOfSpeech(pos: string | undefined, locale: Locale): string {
  if (!pos) return "";
  const mapTr: Record<string, string> = {
    noun: "isim",
    verb: "fiil",
    adjective: "sıfat",
    adverb: "zarf",
    phrase: "ifade",
  };
  const mapEn: Record<string, string> = {
    noun: "noun",
    verb: "verb",
    adjective: "adj",
    adverb: "adv",
    phrase: "phrase",
  };
  return locale === "tr" ? mapTr[pos] || pos : mapEn[pos] || pos;
}
