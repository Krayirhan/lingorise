import { MeaningMatchQuestion, PartOfSpeech } from "../domain/models/content";

function normaliseToken(value: string): string {
  return value.replace(/[^a-z' -]/gi, " ").replace(/\s+/g, " ").trim();
}

function targetWords(question: MeaningMatchQuestion): string[] {
  return question.word.toLocaleLowerCase("en").match(/[a-z]+(?:'[a-z]+)?/g) || [];
}

const IRREGULAR_VERB_FORMS: Record<string, string[]> = {
  spend: ["spent"],
  lend: ["lent"],
  forgive: ["forgave", "forgiven"],
  buy: ["bought"],
  bring: ["brought"],
  catch: ["caught"],
  teach: ["taught"],
  think: ["thought"],
  feel: ["felt"],
  leave: ["left"],
  meet: ["met"],
  sleep: ["slept"],
  keep: ["kept"],
  read: ["read"],
  lead: ["led"],
  choose: ["chose", "chosen"],
  speak: ["spoke", "spoken"],
  break: ["broke", "broken"],
  drive: ["drove", "driven"],
  write: ["wrote", "written"],
  give: ["gave", "given"],
  take: ["took", "taken"],
  eat: ["ate", "eaten"],
  grow: ["grew", "grown"],
  know: ["knew", "known"],
  throw: ["threw", "thrown"],
  fly: ["flew", "flown"],
  draw: ["drew", "drawn"],
  run: ["ran"],
  come: ["came"],
  begin: ["began", "begun"],
  sing: ["sang", "sung"],
  drink: ["drank", "drunk"],
  swim: ["swam", "swum"],
  sit: ["sat"],
  win: ["won"],
  hold: ["held"],
  stand: ["stood"],
  understand: ["understood"],
  find: ["found"],
  tell: ["told"],
  sell: ["sold"],
  hear: ["heard"],
  pay: ["paid"],
  say: ["said"],
  lose: ["lost"],
  make: ["made"],
  send: ["sent"],
  build: ["built"],
};

function matchesWordForm(candidate: string, target: string): boolean {
  if (candidate === target) return true;
  if (candidate === `${target}s` || candidate === `${target}es`) return true;
  if (candidate === `${target}er` || candidate === `${target}est`) return true;
  if (target.endsWith("y") && (candidate === `${target.slice(0, -1)}ies` || candidate === `${target.slice(0, -1)}ied`)) return true;
  if (candidate === `${target}d` || candidate === `${target}ed`) return true;
  if (candidate === `${target}ing` || (target.endsWith("e") && candidate === `${target.slice(0, -1)}ing`)) return true;
  if (IRREGULAR_VERB_FORMS[target]?.includes(candidate)) return true;
  return false;
}

export function exampleCollocation(question: MeaningMatchQuestion): string | undefined {
  const sentence = question.exampleSentence || "";
  const words = sentence.match(/[A-Za-z]+(?:'[A-Za-z]+)?/g) || [];
  const lower = words.map((word) => word.toLocaleLowerCase("en"));
  const target = targetWords(question);
  const start = lower.findIndex((_word, index) =>
    target.every((part, offset) => lower[index + offset] && matchesWordForm(lower[index + offset], part))
  );
  if (start < 0) return undefined;
  const from = Math.max(0, start - 1);
  const to = Math.min(words.length, start + target.length + 1);
  const result = normaliseToken(words.slice(from, to).join(" "));
  return result.split(" ").length >= 2 ? result : undefined;
}

export function fallbackCollocation(question: MeaningMatchQuestion): string {
  const target = question.word;
  if (question.learningItemKind === "phrase" || question.partOfSpeech === "phrase") return target;
  if (question.partOfSpeech === "adjective") return `be ${target}`;
  if (question.partOfSpeech === "adverb") return `speak ${target}`;
  if (question.partOfSpeech === "verb") return `can ${target}`;
  return `a ${target}`;
}

function defaultPrompt(question: MeaningMatchQuestion): string {
  const target = question.word;
  const minimumWords = question.level === "A1" ? 3 : 4;
  const suffix = `Use at least ${minimumWords} English words.`;
  if (question.partOfSpeech === "verb") return `Write a sentence using "${target}" for an action you do in everyday life. ${suffix}`;
  if (question.partOfSpeech === "adjective") return `Write a sentence using "${target}" to describe a person, place, or thing. ${suffix}`;
  if (question.partOfSpeech === "adverb") return `Write a sentence using "${target}" to describe how an action happens. ${suffix}`;
  if (question.partOfSpeech === "phrase" || question.learningItemKind === "phrase") return `Use the phrase "${target}" in a short English sentence. ${suffix}`;
  return `Write a sentence using "${target}" to talk about something in your daily life. ${suffix}`;
}

/** Fills only missing production fields; authored fields are never overwritten. */
export function ensureProductionMetadata(question: MeaningMatchQuestion): MeaningMatchQuestion {
  return {
    ...question,
    collocation: question.collocation || exampleCollocation(question) || fallbackCollocation(question),
    productionPrompt: question.productionPrompt || defaultPrompt(question),
  };
}
