import { getCurriculumTopics, getNextCurriculumLesson } from "../domain/learning/curriculum";
import { MeaningMatchQuestion } from "../domain/models/content";
import { UserData } from "../domain/models/user";
import { randomizeDistractors } from "../domain/practice/distractors";
import { QuestionCatalogue } from "./catalogue";
import { RandomSource } from "./ports";
export function createSessionBuilder(catalogue: QuestionCatalogue, random: RandomSource) {
  const { getQuestionsByLevel } = catalogue;
  /**
   * Picks new words ordered by increasing difficulty (1-5), with randomized order
   * within each difficulty group to prevent rote memorization while ensuring a gentle ramp.
   */
  function pickNewWords(freshWords: MeaningMatchQuestion[], count: number): MeaningMatchQuestion[] {
    const byDifficulty = new Map<number, MeaningMatchQuestion[]>();
    for (const q of freshWords) {
      const d = q.difficulty || 1;
      if (!byDifficulty.has(d)) byDifficulty.set(d, []);
      byDifficulty.get(d)!.push(q);
    }
    const ordered = [...byDifficulty.keys()].sort((a, b) => a - b).flatMap((d) => {
      const group = byDifficulty.get(d)!;
      return [...group].sort(() => random.next() - 0.5); // grup içinde hâlâ rastgele — ezber riski kalmıyor
    });
    return ordered.slice(0, count);
  }

  /**
   * Daily practice, always and only new words. A word the learner has already
   * met correctly is never shown here again, by construction — there is no
   * review queue mixing anything back in. Level completion is decided
   * separately and explicitly, by the level exam (domain/learning/levelExam.ts),
   * not by resurfacing individual words for reinforcement.
   *
   * Draws from the active curriculum lesson -> unit -> topic first, and
   * continues across subsequent curriculum topics in the level when needed so
   * the learner always receives their selected `practiceSessionSize` (5/10/20/30)
   * unless the entire level has fewer unrewarded words remaining.
   */
  function buildDailySessionCore(userData: UserData): MeaningMatchQuestion[] {
    const sessionSize = userData.practiceSessionSize || 20;
    const levelQuestions = getQuestionsByLevel(userData.level);
    const rewardedSet = new Set(userData.rewardedQuestionIds || []);
    const freshLevelQuestions = levelQuestions.filter((q) => !rewardedSet.has(q.id));
    if (freshLevelQuestions.length === 0) return [];

    const knownIds = Array.from(
      new Set([...(userData.solvedQuestionIds || []), ...(userData.rewardedQuestionIds || [])])
    );
    const nextLesson = getNextCurriculumLesson(
      userData.level,
      levelQuestions,
      knownIds,
      userData.learningProgress,
      userData.locale,
      userData.topicAssessments
    );

    const orderedCandidates: MeaningMatchQuestion[] = [];
    const seenIds = new Set<string>();
    const appendGroup = (group: MeaningMatchQuestion[]) => {
      const remainingNeeded = sessionSize - orderedCandidates.length;
      if (remainingNeeded <= 0) return;
      const unseen = group.filter((q) => !rewardedSet.has(q.id) && !seenIds.has(q.id));
      if (unseen.length === 0) return;
      const picked = pickNewWords(unseen, remainingNeeded);
      for (const q of picked) {
        seenIds.add(q.id);
        orderedCandidates.push(q);
      }
    };

    if (nextLesson) {
      const lessonSet = new Set(nextLesson.questionIds);
      appendGroup(freshLevelQuestions.filter((q) => lessonSet.has(q.id)));
      appendGroup(freshLevelQuestions.filter((q) => q.unitId === nextLesson.unitId));
      appendGroup(freshLevelQuestions.filter((q) => q.topicId === nextLesson.topicId));
    }

    if (orderedCandidates.length < sessionSize) {
      const topicOrder = getCurriculumTopics(userData.level).map((topic) => topic.id);
      for (const topicId of topicOrder) {
        appendGroup(freshLevelQuestions.filter((q) => q.topicId === topicId));
        if (orderedCandidates.length >= sessionSize) break;
      }
      appendGroup(freshLevelQuestions);
    }

    return orderedCandidates.slice(0, sessionSize);
  }

  /**
   * Draws each question's decoys fresh from its own level's pool (roadmap
   * Birim 10.1) rather than the fixed set baked in at content-authoring time.
   */
  function withFreshDistractors(questions: MeaningMatchQuestion[]): MeaningMatchQuestion[] {
    return questions.map((q) => randomizeDistractors(q, getQuestionsByLevel(q.level), random.next));
  }

  function buildDailySession(userData: UserData): MeaningMatchQuestion[] {
    return withFreshDistractors(buildDailySessionCore(userData));
  }


  return { pickNewWords, buildDailySession, withFreshDistractors };
}
