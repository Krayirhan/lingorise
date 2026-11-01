export type LocaleCode = "en" | "tr";

/** Fills `{key}` placeholders in a copy template; unknown placeholders are left as they are. */
export function formatTemplate(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) => (key in values ? String(values[key]) : match));
}

export function formatDays(count: number, locale: LocaleCode): string {
  if (locale === "tr") {
    return `${count} gün`;
  }
  return count === 1 ? "1 day" : `${count} days`;
}

export function formatQuestionsCount(count: number, locale: LocaleCode): string {
  if (locale === "tr") {
    return `${count} soru`;
  }
  return count === 1 ? "1 question" : `${count} questions`;
}

export function formatReviewsCount(count: number, locale: LocaleCode): string {
  if (locale === "tr") {
    return `${count} tekrar`;
  }
  return count === 1 ? "1 review" : `${count} reviews`;
}

export function formatXpReward(amount: number): string {
  return `+${amount} XP`;
}

export function formatPartOfSpeech(pos: string | undefined, locale: LocaleCode): string {
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
