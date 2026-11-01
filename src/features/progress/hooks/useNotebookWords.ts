import { useApplication } from "../../../context/ApplicationContext";
import { MeaningMatchQuestion } from "../../../domain/models/content";

/** Every word in the catalogue, for the word notebook. */
export function useNotebookWords(): MeaningMatchQuestion[] {
  return useApplication().catalogue.allQuestions;
}
