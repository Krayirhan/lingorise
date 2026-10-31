import { MeaningMatchQuestion } from "../domain/models/content";
import { UserData } from "../domain/models/user";
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
