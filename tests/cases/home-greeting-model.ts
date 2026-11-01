import { buildGreeting, GreetingState } from "../../src/features/home/greetingModel";
import { copyByLocale } from "../../src/i18n/en";
import { assert } from "../support/assertions";

const base: GreetingState = {
  level: "A1", isNewLearner: false, practiceState: "not_started",
  practiceTargetCount: 20, practiceCompletedCount: 0, isLevelFullyLearned: false, vocabPercent: 10,
};
const en = copyByLocale.en.home;
const tr = copyByLocale.tr.home;

assert(buildGreeting(en, { ...base, isNewLearner: true }).subtitle === "Start by learning your first 20 words.",
  "A new learner is greeted with their first session size");
assert(buildGreeting(tr, { ...base, practiceState: "in_progress", practiceCompletedCount: 1 }).title === "19 kelime kaldı.",
  "An unfinished session greets with the words left");
assert(buildGreeting(en, { ...base, practiceState: "completed" }).title === en.greetingDoneTitle,
  "A completed daily practice gets the done greeting");
assert(buildGreeting(en, { ...base, vocabPercent: 85 }).title === "You’re close to finishing A1.",
  "Close to the end of a level, the greeting says so with the level filled in");
assert(buildGreeting(en, base).title === en.title && buildGreeting(en, base).subtitle === en.subtitle,
  "Otherwise the default greeting is used");
assert(!/[çğışöüÇĞİŞÖÜ]/.test(Object.values(buildGreeting(en, { ...base, isLevelFullyLearned: true })).join(" ")),
  "The English greeting for an exhausted level contains no Turkish text");
