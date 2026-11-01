import { LevelCode } from "../../domain/models/content";
import { Copy } from "../../i18n/en";
import { formatTemplate } from "../../utils/formatters";
import { PracticeState } from "./home.types";

export interface GreetingState {
  level: LevelCode;
  /** No word solved in this level and no XP yet. */
  isNewLearner: boolean;
  practiceState: PracticeState;
  practiceTargetCount: number;
  practiceCompletedCount: number;
  isLevelFullyLearned: boolean;
  /** Share of the level's words learned, 0–100. */
  vocabPercent: number;
}

export interface Greeting {
  title: string;
  subtitle: string;
}

/** The Home greeting for the learner's current situation, first matching case wins. */
export function buildGreeting(copy: Copy["home"], state: GreetingState): Greeting {
  const { level } = state;
  if (state.isNewLearner) {
    return {
      title: copy.greetingNewTitle,
      subtitle: formatTemplate(copy.greetingNewSubtitle, { count: state.practiceTargetCount }),
    };
  }
  if (state.practiceState === "in_progress") {
    // The hero card already says "continue"; the greeting says how much is left instead.
    const left = Math.max(0, state.practiceTargetCount - state.practiceCompletedCount);
    return { title: formatTemplate(copy.wordsLeftTitle, { count: left }), subtitle: copy.wordsLeftSubtitle };
  }
  // Checked before the "completed" case on purpose (CORE-004): that case
  // promises new words tomorrow, which is false once the level has none left,
  // even when today's quest also happens to be complete.
  if (state.isLevelFullyLearned) {
    return {
      title: formatTemplate(copy.greetingLevelDoneTitle, { level }),
      subtitle: copy.greetingLevelDoneSubtitle,
    };
  }
  if (state.practiceState === "completed") {
    return { title: copy.greetingDoneTitle, subtitle: copy.greetingDoneSubtitle };
  }
  if (state.vocabPercent >= 80) {
    return {
      title: formatTemplate(copy.greetingNearLevelTitle, { level }),
      subtitle: copy.greetingNearLevelSubtitle,
    };
  }
  return { title: copy.title, subtitle: copy.subtitle };
}
