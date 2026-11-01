import { MeaningMatchQuestion } from "../../domain/models/content";
import { a1Questions } from "./a1";
import { a2Questions } from "./a2";
import { b1Questions } from "./b1";
import { b2Questions } from "./b2";
import { c1Questions } from "./c1";
import { c2Questions } from "./c2";
import { enrichQuestionsWithCurriculum } from "../curriculum";

/** Version of the bundled catalogue persisted into resumable learning sessions. */
export const CONTENT_VERSION = "2.3.0";

export const allQuestions: MeaningMatchQuestion[] = enrichQuestionsWithCurriculum([
  ...a1Questions,
  ...a2Questions,
  ...b1Questions,
  ...b2Questions,
  ...c1Questions,
  ...c2Questions,
]);

export { CONTENT_UNIT_SIZE } from "../../domain/learning/constants";
