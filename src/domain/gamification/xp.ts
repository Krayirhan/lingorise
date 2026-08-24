import { GardenProgress, GardenStage } from "../../types/user";

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
 */
const STAGE_BANDS: StageBand[] = [
  { stage: "sprout", nameTr: "Tohum & Filiz", nameEn: "Seed & Sprout", gardenLevel: 1, from: 0, to: 25 },
  { stage: "leaf", nameTr: "Yeşil Yaprak", nameEn: "Green Leaf", gardenLevel: 2, from: 25, to: 75 },
  { stage: "bud", nameTr: "Taze Tomurcuk", nameEn: "Fresh Bud", gardenLevel: 3, from: 75, to: 150 },
  { stage: "flower", nameTr: "Açan Çiçek", nameEn: "Blooming Flower", gardenLevel: 4, from: 150, to: 275 },
];

const FINAL_STAGE: Omit<StageBand, "from" | "to"> = {
  stage: "bloom_tree",
  nameTr: "Ulu Ağaç",
  nameEn: "Flourishing Tree",
  gardenLevel: 5,
};

const FINAL_STAGE_START = 275;
/** The mature tree keeps growing in steps rather than stopping at a ceiling. */
const FINAL_STAGE_STEP = 175;

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
