import { buildCollection, buildSkillProgress } from "../../src/features/home/homeViewModelParts";
import { MeaningMatchQuestion } from "../../src/domain/models/content";
import { copyByLocale } from "../../src/i18n/en";
import { assert } from "../support/assertions";

const q = (id: string, word: string): MeaningMatchQuestion => ({ id, word, meaning: `${word}-tr`, level: "A1", topic: "people" } as MeaningMatchQuestion);
const level = [q("a", "we"), q("b", "go"), q("c", "home")];

const collection = buildCollection(level, ["a", "x-other-level", "c", "b"], 2);
assert(collection.map((word) => word.word).join(",") === "go,home", "The collection lists the newest learned words first and stops at the size limit");
assert(buildCollection(level, ["x-other-level"], 8).length === 0, "Words from other levels are not collected");

const fresh = buildSkillProgress(copyByLocale.en.home, "A1", 0, 0)[0];
assert(fresh.meta === `A1 · ${copyByLocale.en.home.vocabularyEmptyCta}`, "With no learned words the vocabulary row invites the first one");
const started = buildSkillProgress(copyByLocale.tr.home, "A1", 3, 1)[0];
assert(started.meta.includes("3") && !started.meta.includes("{count}"), "Once words are learned the vocabulary row shows the count");
