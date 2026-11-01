import {
  MeaningMatchQuestion
} from "../../models/content";
import { CatalogueAuditContext } from "../types";


import { FindingReporter } from "../types";
export function validatePublication(question: MeaningMatchQuestion, flagFinding: FindingReporter, context?: CatalogueAuditContext, _informational: string[] = []) {
  // 21. source
  if (!question.source || typeof question.source !== "string" || question.source.trim().length === 0) {
    flagFinding("P0", "source", "source provenance missing or empty");
  }

  // 22. status
  const validStatus = ["published", "draft", "archived"];
  if (!question.status || !validStatus.includes(question.status)) {
    flagFinding("P0", "status", "status missing or invalid");
  }

  // 23. editorialStatus & human review evidence
  const validEditorialStatus = ["approved", "needs_review", "rejected"];
  if (!question.editorialStatus || !validEditorialStatus.includes(question.editorialStatus)) {
    flagFinding("P0", "editorialStatus", "editorialStatus missing or invalid");
  } else if (question.editorialStatus === "approved") {
    // Release-blocking: approved item MUST have valid review evidence
    const review = question.editorialReview;
    if (
      !review?.reviewId ||
      !review.reviewerId ||
      !review.reviewedAt ||
      !review.rubricVersion ||
      review.decision !== "approved"
    ) {
      flagFinding("P0", "editorialStatus", "approved item lacks verifiable human review evidence");
    } else if (review.reviewedAt !== question.reviewedAt || review.reviewerId !== question.reviewer) {
      flagFinding("P0", "editorialStatus", "approved item review evidence does not match reviewer provenance");
    }
  }

  // Context note check for polysemous words
  if (!question.contextNote && question.level === "C1" && question.word === "sanction") {
    flagFinding("P2", "meaning", "polysemous advanced word recommended to provide contextNote");
  }

}
