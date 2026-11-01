import { useApplication } from "../../../context/ApplicationContext";
import { useMemo } from "react";
import { UserData } from "../../../domain/models/user";
import { Copy, Locale } from "../../../i18n/en";
import { CollectedWord, HomeViewModel, SkillProgress } from "../home.types";
import { buildWeekStrip } from "../weekStripModel";
import { buildGreeting } from "../greetingModel";
import { calculateGardenProgress } from "../../../domain/gamification/xp";



const COLLECTION_SIZE = 8;

export function useHomeViewModel(userData: UserData, copy: Copy, locale: Locale): HomeViewModel {
  const application = useApplication();
  const { todayISO, nowDate } = application.clock;
  const { getQuestionsByLevel } = application.catalogue;
  const { getLevelUnitInfo } = application.catalogue;
  const { getRecommendedWord } = application.content;

  return useMemo(() => {
    const levelQuestions = getQuestionsByLevel(userData.level);
    const levelQuestionIds = new Set(levelQuestions.map((question) => question.id));
    const rewardedIds = userData.rewardedQuestionIds || [];

    // A word counts once it's genuinely learned (answered correctly) — full
    // stop. There is no separate "mastered vs. still learning" sub-status any
    // more (roadmap 18-srs-flow-hardening.md "sınav" redesign, 2026-08-26):
    // level completion is decided by the exam, not by resurfaced words.
    const learnedWordsGlobal = rewardedIds.length;
    const gardenProgress = calculateGardenProgress(learnedWordsGlobal);
    const solvedInLevel = rewardedIds.filter((id) => levelQuestionIds.has(id)).length;
    const vocabPercent = levelQuestions.length > 0 ? Math.round((solvedInLevel / levelQuestions.length) * 100) : 0;

    // Once every word in the level has been rewarded, buildDailySession has
    // nothing left to draw from (CORE-004) — this is the one signal screens
    // need to stop offering a daily-practice CTA and point at the level
    // exam / next level instead.
    const isLevelFullyLearned = levelQuestions.length > 0 && solvedInLevel >= levelQuestions.length;

    const stageName = locale === "tr" ? gardenProgress.stageNameTr : gardenProgress.stageNameEn;

    const vocabMeta =
      solvedInLevel === 0
        ? `${userData.level} · ${copy.home.vocabularyEmptyCta}`
        : (copy.home.vocabularyLearnedCount).replace("{count}", String(solvedInLevel));

    const skillProgress: SkillProgress[] = [
      {
        id: "skill_vocab",
        title: copy.home.vocabulary,
        meta: vocabMeta,
        percent: vocabPercent,
        isReady: true,
        icon: "book-outline",
      },
      {
        id: "skill_listening",
        title: copy.home.listening,
        meta: copy.home.listeningMeta,
        percent: 0,
        isReady: false,
        icon: "headset-outline",
      },
    ];

    const recommended = getRecommendedWord(userData.level, userData.solvedQuestionIds);
    const dailyQuests = userData.dailyQuests || [];
    const isDailyCompleted = dailyQuests.length > 0 && dailyQuests.every((q) => q.completed);
    const practiceQuest = dailyQuests.find((q) => q.id === "quest_daily_practice");
    const sessionSize = userData.practiceSessionSize || 20;

    // Both numbers come straight from the quest the user is actually working
    // against, so what the card shows is what they really answered.
    const practiceTargetCount = practiceQuest?.target || sessionSize;
    const practiceCompletedCount = practiceQuest?.current || 0;

    const practiceState: "not_started" | "in_progress" | "completed" = practiceQuest?.completed
      ? "completed"
      : practiceCompletedCount > 0
        ? "in_progress"
        : "not_started";

    // What the day is really worth: every word plus the quest bonuses on offer.
    const XP_PER_WORD = 10;
    const questBonusTotal = dailyQuests.reduce((sum, quest) => sum + quest.xpReward, 0);
    const dailyXpTarget = practiceTargetCount * XP_PER_WORD + questBonusTotal;
    const today = todayISO();
    const dailyXpEarned =
      (userData.practiceHistory || []).find((entry) => entry.date === today)?.xp || 0;

    const weekStrip = buildWeekStrip(
      today,
      (userData.practiceHistory || []).filter((entry) => entry.answers > 0).map((entry) => entry.date),
      copy.home.weekdayShort.split("|"),
    );

    // rewardedQuestionIds grows in the order words were learned, so the tail
    // is the newest; only words from the current level are shown.
    const questionsById = new Map(levelQuestions.map((question) => [question.id, question]));
    const collection: CollectedWord[] = [];
    for (let i = rewardedIds.length - 1; i >= 0 && collection.length < COLLECTION_SIZE; i--) {
      const question = questionsById.get(rewardedIds[i]);
      if (!question) continue;
      collection.push({
        id: question.id,
        word: question.word || question.prompt || "",
        meaning: question.meaning || question.answer || "",
        level: question.level,
        topic: question.topic,
        phonetic: question.phonetic,
        pronunciation: question.pronunciation,
        exampleSentence: question.exampleSentence,
        exampleTranslation: question.exampleTranslation,
      });
    }

    // Units turn an amorphous 320-word level into finishable chunks.
    const unitInfo = getLevelUnitInfo(userData.level, userData.solvedQuestionIds);

    const hour = nowDate().getHours();
    const greetingEyebrow = hour >= 5 && hour < 12
      ? copy.home.morning
      : hour >= 12 && hour < 18
        ? copy.home.afternoon
        : copy.home.evening;

    const greeting = buildGreeting(copy.home, {
      level: userData.level,
      isNewLearner: solvedInLevel === 0 && userData.xp === 0,
      practiceState,
      practiceTargetCount,
      practiceCompletedCount,
      isLevelFullyLearned,
      vocabPercent,
    });

    return {
      level: userData.level,
      xp: userData.xp,
      streak: userData.streak,
      stageName,
      gardenProgress,
      dailyQuests,
      isDailyCompleted,
      practiceState,
      practiceCompletedCount,
      practiceTargetCount,
      dailyXpEarned,
      dailyXpTarget,
      unitNumber: unitInfo.unitIndex + 1,
      unitCount: unitInfo.unitCount,
      unitLearned: unitInfo.learnedInUnit,
      unitTotal: unitInfo.questions.length,
      isLevelFullyLearned,
      masteredWords: learnedWordsGlobal,
      questHistory: userData.questHistory || [],
      greetingEyebrow,
      greetingTitle: greeting.title,
      greetingSubtitle: greeting.subtitle,
      skillProgress,
      recommendedWord: recommended,
      weekStrip,
      collection,
      badges: userData.unlockedBadges || [],
    };
  }, [userData, copy, locale]);
}
