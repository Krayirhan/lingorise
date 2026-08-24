import { useMemo } from "react";
import { UserData } from "../../../types/user";
import { Copy, Locale } from "../../../i18n/en";
import { HomeViewModel, SkillProgress } from "../home.types";
import { calculateGardenProgress } from "../../../domain/gamification/xp";
import { getQuestionsByLevel, getLevelUnitInfo } from "../../../content/questions";
import { getRecommendedWord } from "../../../services/contentService";
import { getDueReviewItems } from "../../../domain/review/spacedRepetition";
import { countMasteredWords, summarizeMastery } from "../../../domain/learning/mastery";

export function useHomeViewModel(userData: UserData, copy: Copy, locale: Locale): HomeViewModel {
  return useMemo(() => {
    const levelQuestions = getQuestionsByLevel(userData.level);
    // The garden grows with words genuinely recalled, across every level.
    const masteredWords = countMasteredWords(userData.learningProgress || {});
    const gardenProgress = calculateGardenProgress(masteredWords);

    // Progress is measured by what the learner can still recall, not by how
    // many words they once tapped correctly.
    const mastery = summarizeMastery(
      userData.learningProgress || {},
      levelQuestions.map((question) => question.id)
    );
    const vocabPercent = mastery.masteredPercent;
    const solvedInLevel = mastery.mastered + mastery.inProgress;

    const stageName = locale === "tr" ? gardenProgress.stageNameTr : gardenProgress.stageNameEn;

    // Words still being learned are real work, so they are named explicitly
    // rather than being silently folded into the headline percentage.
    const fillCounts = (template: string) =>
      template
        .replace("{mastered}", String(mastery.mastered))
        .replace("{learning}", String(mastery.inProgress));

    let vocabMeta: string;
    if (mastery.mastered === 0 && mastery.inProgress === 0) {
      vocabMeta = `${userData.level} · ${copy.home?.vocabularyEmptyCta || "İlk kelimeni öğren →"}`;
    } else if (mastery.mastered === 0) {
      vocabMeta = fillCounts(copy.home?.vocabularyLearningOnly || "{learning} kelime öğreniliyor");
    } else if (mastery.inProgress === 0) {
      vocabMeta = fillCounts(copy.home?.vocabularyMasteredOnly || "{mastered} kelime pekişti");
    } else {
      vocabMeta = fillCounts(copy.home?.vocabularyMixed || "{mastered} pekişti · {learning} öğreniliyor");
    }

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
    const dueReviewCount = getDueReviewItems(userData.learningProgress || {}).length;
    const practiceRecommendation = dueReviewCount > 0
      ? `${dueReviewCount} kelime tekrar zamanını bekliyor.`
      : !isDailyCompleted
        ? "Günlük hedefini tamamlamak için öneriliyor."
        : solvedInLevel < levelQuestions.length
          ? `${userData.level} seviyendeki yeni kelimelerden seçildi.`
          : "Serini korumak için kısa bir tekrar öneriliyor.";

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
    const today = new Date().toISOString().slice(0, 10);
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
      masteredWords,
      questHistory: userData.questHistory || [],
      greetingTitle,
      greetingSubtitle,
      reviewCount: dueReviewCount,
      practiceRecommendation,
      skillProgress,
      recommendedWord: recommended,
      badges: userData.unlockedBadges || [],
    };
  }, [userData, copy, locale]);
}
