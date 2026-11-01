import { createSessionCommands } from "../../src/application/sessionCommands";
import { createLearningCatalogue } from "../../src/application/learningCatalogue";
import { createSessionBuilder } from "../../src/application/sessionBuilder";
import { createQuestionCatalogue } from "../../src/application/catalogue";
import { allQuestions, CONTENT_VERSION } from "../support/bundledCatalogue";
import { buildDailySession, isExamAvailable } from "../support/learningFixtures";
import { DEFAULT_USER_DATA } from "../../src/domain/user/normalization";
import { UserData } from "../../src/domain/models/user";
import { useHomeViewModel } from "../../src/features/home/hooks/useHomeViewModel";
import { createGardenHeroModel } from "../../src/features/home/gardenHeroModel";
import { buildGreeting } from "../../src/features/home/greetingModel";
import { copyByLocale } from "../../src/i18n/en";
import { C } from "../../src/theme/colors";
import * as fs from "fs";
import * as path from "path";
import { assert } from "../support/assertions";
import { a1Pool } from "./daily-practice-never-repeats-a-word";
// 58. Level-Exhausted Terminal State (CORE-004): once every word in a level
// is learned, buildDailySession has nothing left to draw from — the daily
// practice CTA must not stay a live, silently-dead-ending button. This block
// checks the pure logic the fix relies on directly, and checks the UI
// components/hook that consume it via source inspection (same pattern as
// Birim 44/57), since this test harness has no React renderer.
console.log("\n58. Level-Exhausted Terminal State (CORE-004):");
{
  const srcRoot = path.join(__dirname, "..", "..", "src");

  // A. Pure logic: a fully-learned level yields an empty daily session.
  const fullyLearnedUser: UserData = {
    ...DEFAULT_USER_DATA,
    level: "A1",
    rewardedQuestionIds: a1Pool.map((q) => q.id),
    solvedQuestionIds: a1Pool.map((q) => q.id),
  };
  const exhaustedSession = buildDailySession(fullyLearnedUser);
  assert(
    exhaustedSession.length === 0,
    "buildDailySession returns an empty list once every A1 word is rewarded (the state CORE-004's dead CTA was reachable from)"
  );

  // The same "fully learned" formula the fix's isLevelFullyLearned flag uses,
  // checked directly against content data rather than duplicating UI code.
  const levelQuestionIds = new Set(a1Pool.map((q) => q.id));
  const solvedInLevel = fullyLearnedUser.rewardedQuestionIds.filter((id) => levelQuestionIds.has(id)).length;
  assert(
    solvedInLevel === a1Pool.length,
    "The fully-learned user's rewarded-in-level count matches the level's total word count"
  );

  // A level with a real exam available stays available regardless of the
  // learner's own progress — exam availability behavior is unchanged by this fix.
  assert(isExamAvailable("A1"), "A1 still seats a real exam once fully learned (exam availability unaffected by CORE-004 fix)");

  // B. Regression: a level that is NOT fully learned still returns a normal,
  // non-empty session — the fix must not over-trigger the terminal state.
  const partiallyLearnedUser: UserData = {
    ...DEFAULT_USER_DATA,
    level: "A1",
    rewardedQuestionIds: a1Pool.slice(0, 5).map((q) => q.id),
    solvedQuestionIds: a1Pool.slice(0, 5).map((q) => q.id),
  };
  const inProgressSession = buildDailySession(partiallyLearnedUser);
  assert(
    inProgressSession.length > 0,
    "A level that still has unlearned words keeps returning a normal daily session (in-progress behavior unchanged)"
  );

  const commands = createSessionCommands(createSessionBuilder(createQuestionCatalogue(allQuestions, CONTENT_VERSION), { next: () => 0.5 }),
    createLearningCatalogue(createQuestionCatalogue([], CONTENT_VERSION)), () => {}, { next: () => 0.5 });
  assert(commands.practice(fullyLearnedUser) === null, "Exhausted practice command explicitly reports no session");
  assert(commands.exam("A1") === null, "An empty exam catalogue explicitly reports no session");

  // D. useHomeViewModel.ts: exposes the terminal-state flag screens key off of.
  const viewModelSrc = fs.readFileSync(path.join(srcRoot, "features/home/hooks/useHomeViewModel.ts"), "utf-8");
  assert(viewModelSrc.includes("isLevelFullyLearned"), "useHomeViewModel computes and exposes isLevelFullyLearned");
  assert(
    !viewModelSrc.includes("yarın devam edelim"),
    "The old 'come back tomorrow' copy (misleading once a level is permanently exhausted) is gone from useHomeViewModel"
  );
  // The greeting has its own "completed" case with a come-back-tomorrow
  // promise. It must lose to isLevelFullyLearned, or a level finished on the
  // same day the daily quest completes would show that false promise above
  // the (correct) level-done hero card.
  const sameDayGreeting = buildGreeting(copyByLocale.tr.home, {
    level: "A1", isNewLearner: false, practiceState: "completed",
    practiceTargetCount: 20, practiceCompletedCount: 20, isLevelFullyLearned: true, vocabPercent: 100,
  });
  assert(
    sameDayGreeting.title === "A1 seviyesindeki tüm kelimeleri öğrendin." && sameDayGreeting.subtitle === copyByLocale.tr.home.greetingLevelDoneSubtitle,
    "The Home greeting shows the level-done text, not the come-back-tomorrow text, when the level is exhausted on the same day the daily quest completes"
  );

  // E. PracticeHubScreen.tsx: the hero CTA is gated on isLevelFullyLearned —
  // it no longer unconditionally calls onStartDailyPractice regardless of
  // whether there are fresh words to practice.
  // The hero card lives in PracticeHubHero.tsx; the screen computes when it is an exam entry point.
  const hubSrc = fs.readFileSync(path.join(srcRoot, "screens/PracticeHubScreen.tsx"), "utf-8");
  const heroSrc = fs.readFileSync(path.join(srcRoot, "screens/PracticeHubHero.tsx"), "utf-8");
  assert(heroSrc.includes("if (props.isLevelFullyLearned) {"), "PracticeHubScreen branches its hero card on isLevelFullyLearned");
  assert(hubSrc.includes("const heroIsExamCta = isLevelFullyLearned && isExamAvailable && !isExamPassed"), "PracticeHubScreen's level-done hero becomes the exam CTA when an exam is pending");
  assert(heroSrc.includes("disabled={!props.heroIsExamCta}"), "PracticeHubScreen's level-done hero is non-interactive when there is no exam action to take (no silent dead button)");

  // F. GardenHeroCard.tsx: the "practice again" dead-end button is not shown
  // once the level is fully learned.
  const onPress = () => undefined;
  const onViewProgress = () => undefined;
  const onGoToPracticeHub = () => undefined;
  const levelDoneHero = createGardenHeroModel({ practiceState: "completed", isLevelFullyLearned: true,
    onPress, onViewProgress, onGoToPracticeHub });
  assert(levelDoneHero.isLevelDone && !levelDoneHero.showPracticeAgain,
    "a fully-learned level hides the repeat-practice CTA");
  assert(levelDoneHero.onCtaPress === onGoToPracticeHub,
    "the fully-learned hero takes the learner to the practice hub");
  const completedHero = createGardenHeroModel({ practiceState: "completed", onPress, onViewProgress });
  assert(completedHero.showPracticeAgain && completedHero.onCtaPress === onViewProgress,
    "a completed daily practice keeps its repeat action and progress CTA");
}

