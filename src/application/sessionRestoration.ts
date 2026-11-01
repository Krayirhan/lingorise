import { MeaningMatchQuestion } from "../domain/models/content";
import { ActiveSessionState, UserData } from "../domain/models/user";
import { QuestionCatalogue } from "./catalogue";

export function restoreSession(userData: UserData, catalogue: QuestionCatalogue) {
  const stored = userData.activeSession || null;
  const restored = stored && (!stored.catalogVersion || stored.catalogVersion === catalogue.CONTENT_VERSION) ? stored : null;
  const questions = restored?.questionIds.map(id => catalogue.getQuestionById(id))
    .filter((question): question is MeaningMatchQuestion => question !== undefined)
    .map((question) => {
      const options = restored?.reversedOptions?.[question.id];
      if (!options || !options.includes(question.word) || question.mode === "PICK_THE_WORD") return question;
      return { ...question, mode: "PICK_THE_WORD" as const, word: question.meaning, prompt: question.meaning,
        meaning: question.word, answer: question.word, options, wrongOptions: options.filter((option) => option !== question.word) };
    }) || [];
  return { restored, questions, hasRestorableSession: questions.length > 0 && !!restored };
}

/**
 * The in-progress session as it is persisted, so restoreSession can resume it.
 * Reversed (pick-the-word) questions keep their shuffled options.
 */
export function buildActiveSession(state: Omit<ActiveSessionState, "questionIds" | "reversedOptions"> & { questions: MeaningMatchQuestion[] }): ActiveSessionState {
  const { questions, ...rest } = state;
  return {
    ...rest,
    questionIds: questions.map((question) => question.id),
    reversedOptions: Object.fromEntries(questions
      .filter((question) => question.mode === "PICK_THE_WORD" && question.options?.length)
      .map((question) => [question.id, question.options!])),
  };
}
