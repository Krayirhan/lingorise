import { LevelCode, MeaningMatchQuestion } from "../models/content";
import { ProductionRubricResult } from "../models/user";

export const PRODUCTION_MIN_WORDS: Record<LevelCode, number> = { A1: 3, A2: 4, B1: 5, B2: 5, C1: 6, C2: 6 };

function words(value: string): string[] {
  return value.toLocaleLowerCase("en").match(/[a-z]+(?:['-][a-z]+)*/g) || [];
}

const COMMON_IRREGULARS: Record<string, string[]> = {
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

function matchesTokenForm(candidate: string, target: string): boolean {
  if (candidate === target) return true;
  if (candidate === `${target}s` || candidate === `${target}es`) return true;
  if (candidate === `${target}er` || candidate === `${target}est`) return true;
  if (target.endsWith("y") && (candidate === `${target.slice(0, -1)}ies` || candidate === `${target.slice(0, -1)}ied`)) return true;
  if (candidate === `${target}d` || candidate === `${target}ed`) return true;
  if (candidate === `${target}ing` || (target.endsWith("e") && candidate === `${target.slice(0, -1)}ing`)) return true;
  if (COMMON_IRREGULARS[target]?.includes(candidate)) return true;
  return false;
}

function containsTarget(response: string, target: string): boolean {
  const targetWords = words(target);
  const responseWords = words(response);
  if (targetWords.length === 0) return false;
  return targetWords.every((word) => responseWords.some((candidate) => matchesTokenForm(candidate, word)));
}

export function evaluateProductionResponse(question: MeaningMatchQuestion, response: string): ProductionRubricResult {
  const text = response.trim();
  const responseWords = words(text);
  const targetUsed = containsTarget(text, question.word);
  const collocationUsed = Boolean(question.collocation && containsTarget(text, question.collocation));
  const contextScore = responseWords.length >= PRODUCTION_MIN_WORDS[question.level] ? 1 : 0;
  const registerScore = /[.!?]$/.test(text) && responseWords.length >= 3 ? 1 : 0;
  const score = Number(targetUsed) + Number(collocationUsed) + contextScore + registerScore;
  const feedback: string[] = [];
  if (!targetUsed) feedback.push("Hedef sözcüğü doğru biçimde kullan.");
  if (question.collocation && !collocationUsed) feedback.push("İstenen collocation’ı cümleye yerleştir.");
  if (contextScore === 0) feedback.push("En az " + PRODUCTION_MIN_WORDS[question.level] + " kelime kullan.");
  if (registerScore === 0) feedback.push("En az üç kelime yaz ve sonuna noktalama işareti ekle.");
  if (feedback.length === 0) feedback.push("Yazım kontrolleri tamamlandı.");
  return {
    score,
    maxScore: 4,
    passed: score >= 3,
    targetUsed,
    collocationUsed,
    contextScore,
    registerScore,
    feedback,
  };
}
