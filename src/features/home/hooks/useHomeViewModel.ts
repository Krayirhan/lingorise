import { useMemo } from "react";
import { UserData } from "../../../types/user";
import { Copy, Locale } from "../../../i18n/en";
import { HomeViewModel, SkillProgress } from "../home.types";
import { calculateGardenProgress } from "../../../domain/gamification/xp";
import { getQuestionsByLevel, getLevelUnitInfo } from "../../../content/questions";
import { getRecommendedWord } from "../../../services/contentService";
import { todayISO } from "../../../utils/clock";

export function useHomeViewModel(userData: UserData, copy: Copy, locale: Locale): HomeViewModel {
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

    const stageName = locale === "tr" ? gardenProgress.stageNameTr : gardenProgress.stageNameEn;

    const vocabMeta =
      solvedInLevel === 0
        ? `${userData.level} · ${copy.home?.vocabularyEmptyCta || "İlk kelimeni öğren →"}`
        : (copy.home?.vocabularyLearnedCount || "{count} kelime öğrenildi").replace("{count}", String(solvedInLevel));

    const skillProgress: SkillProgress[] = [
      {
        id: "skill_vocab",
        title: copy.home?.vocabulary || "Kelime bilgisi",
        meta: vocabMeta,
        percent: vocabPercent,
        isReady: true,
        icon: "book-outline",
      },
      {
        id: "skill_listening",
        title: copy.home?.listening || "Dinleme",
        meta: copy.home?.listeningMeta || "Yeni bir filiz yakında",
        percent: 0,
        isReady: false,
        icon: "headset-outline",
      },
    ];

    const recommended = getRecommendedWord(userData.level, userData.solvedQuestionIds);
    const dailyQuests = userData.dailyQuests || [];
    const isDailyCompleted = dailyQuests.length > 0 && dailyQuests.every((q) => q.completed);
    const practiceRecommendation = !isDailyCompleted
      ? "Günlük hedefini tamamlamak için öneriliyor."
      : solvedInLevel < levelQuestions.length
        ? `${userData.level} seviyendeki yeni kelimelerden seçildi.`
        : "Bugünlük yeni kelimen kalmadı — yarın devam edelim.";

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

    // Units turn an amorphous 320-word level into finishable chunks.
    const unitInfo = getLevelUnitInfo(userData.level, userData.solvedQuestionIds);

    // Context-aware dynamic greetings
    let greetingTitle = copy.home.title || "Günün pratiğine başlamaya hazırsın.";
    let greetingSubtitle = copy.home.subtitle || "Bugünün kelimeleri seni bekliyor.";

    if (solvedInLevel === 0 && userData.xp === 0) {
      greetingTitle = "Öğrenmeye hazır mısın?";
      greetingSubtitle = `İlk ${practiceTargetCount} kelimeni öğrenerek başla.`;
    } else if (practiceState === "in_progress") {
      greetingTitle = "Pratiğin devam ediyor.";
      greetingSubtitle = `${practiceCompletedCount} / ${practiceTargetCount} kelime tamamlandı.`;
    } else if (practiceState === "completed") {
      greetingTitle = "Bugünkü hedefini tamamladın 🌱";
      greetingSubtitle = "Yarın yeni kelimelerle öğrenmeye devam edeceksin.";
    } else if (vocabPercent >= 80) {
      greetingTitle = `${userData.level} seviyesini tamamlamak üzeresin.`;
      greetingSubtitle = "Bir sonraki seviyeye hazırlan.";
    }

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
      masteredWords: learnedWordsGlobal,
      questHistory: userData.questHistory || [],
      greetingTitle,
      greetingSubtitle,
      practiceRecommendation,
      skillProgress,
      recommendedWord: recommended,
      badges: userData.unlockedBadges || [],
    };
  }, [userData, copy, locale]);
}
