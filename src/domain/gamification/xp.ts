import { GardenProgress, GardenStage } from "../../types/user";
import { CONTENT_UNIT_SIZE } from "../../content/questions";

interface StageBand {
  stage: GardenStage;
  nameTr: string;
  nameEn: string;
  gardenLevel: number;
  from: number;
  to: number;
}

/**
 * The garden measures words the learner can actually recall, not XP.
 *
 * Tying it to XP made the metaphor run out before the content did: at roughly
 * 200 XP a day the old 2000-XP ceiling was reached in about ten days, while
 * A1 alone holds 320 words. Mastery grows at the speed of real learning, so
 * the garden now grows for months instead of a fortnight.
 *
 * Every threshold is an exact multiple of CONTENT_UNIT_SIZE (the same 30-word
 * chunk daily practice is measured in — "Bölümde X/30 kelime" on the home
 * card) so the garden's stage boundaries and a level's unit boundaries always
 * land on the same numbers, escalating 1, 2, 3, 4, 5 units per stage. Before
 * this the two trackers used unrelated denominators (25 vs. 30) that looked
 * like a bug rather than two deliberately different — but coherent — things:
 * one level's current unit vs. every word ever learned across all levels.
 */
const STAGE_BANDS: StageBand[] = [
  { stage: "sprout", nameTr: "Tohum & Filiz", nameEn: "Seed & Sprout", gardenLevel: 1, from: 0, to: CONTENT_UNIT_SIZE * 1 },
  { stage: "leaf", nameTr: "Yeşil Yaprak", nameEn: "Green Leaf", gardenLevel: 2, from: CONTENT_UNIT_SIZE * 1, to: CONTENT_UNIT_SIZE * 3 },
  { stage: "bud", nameTr: "Taze Tomurcuk", nameEn: "Fresh Bud", gardenLevel: 3, from: CONTENT_UNIT_SIZE * 3, to: CONTENT_UNIT_SIZE * 6 },
  { stage: "flower", nameTr: "Açan Çiçek", nameEn: "Blooming Flower", gardenLevel: 4, from: CONTENT_UNIT_SIZE * 6, to: CONTENT_UNIT_SIZE * 10 },
];

const FINAL_STAGE: Omit<StageBand, "from" | "to"> = {
  stage: "bloom_tree",
  nameTr: "Ulu Ağaç",
  nameEn: "Flourishing Tree",
  gardenLevel: 5,
};

const FINAL_STAGE_START = CONTENT_UNIT_SIZE * 10;
/** The mature tree keeps growing in steps rather than stopping at a ceiling. */
const FINAL_STAGE_STEP = CONTENT_UNIT_SIZE * 5;

export function calculateGardenProgress(masteredWords: number): GardenProgress {
  const mastered = Math.max(0, masteredWords);

  const band = STAGE_BANDS.find((candidate) => mastered < candidate.to);

  if (band) {
    const span = band.to - band.from;
    return {
      stage: band.stage,
      stageNameTr: band.nameTr,
      stageNameEn: band.nameEn,
      gardenLevel: band.gardenLevel,
      stageProgressPercent: Math.round(((mastered - band.from) / span) * 100),
      stageStartWords: band.from,
      nextStageThresholdWords: band.to,
    };
  }

  // Past the last named stage the target moves ahead in fixed steps, so a
  // dedicated learner never arrives at a finished, static garden.
  const stepsCompleted = Math.floor((mastered - FINAL_STAGE_START) / FINAL_STAGE_STEP);
  const from = FINAL_STAGE_START + stepsCompleted * FINAL_STAGE_STEP;
  const to = from + FINAL_STAGE_STEP;

  return {
    stage: FINAL_STAGE.stage,
    stageNameTr: FINAL_STAGE.nameTr,
    stageNameEn: FINAL_STAGE.nameEn,
    gardenLevel: FINAL_STAGE.gardenLevel,
    stageProgressPercent: Math.round(((mastered - from) / FINAL_STAGE_STEP) * 100),
    stageStartWords: from,
    nextStageThresholdWords: to,
  };
}
