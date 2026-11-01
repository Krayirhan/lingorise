import {
  MeaningMatchQuestion
} from "../../models/content";
import { auditIpaProvenance } from "../ipa";
import { CatalogueAuditContext } from "../types";


import { FindingReporter } from "../types";
export function validatePhonetic(question: MeaningMatchQuestion, flagFinding: FindingReporter, context?: CatalogueAuditContext, informational: string[] = []) {
  // 18. phonetic (IPA)
  const phonetic = (question.phonetic || "").trim();
  if (!phonetic) {
    flagFinding("P0", "phonetic", "phonetic missing or empty");
  } else {
    const ipaProv = auditIpaProvenance(question);
    informational.push(`IPA: ${ipaProv.value} (${ipaProv.dialect}) [${ipaProv.verificationStatus}]`);

    if (ipaProv.verificationStatus === "failed") {
      flagFinding("P0", "phonetic", "phonetic is not a valid IPA transcription");
    } else if (ipaProv.verificationStatus === "pending") {
      flagFinding("P2", "phonetic", "IPA phonetic source provenance unverified or pending dictionary reference");
    }

    if (ipaProv.dialect === "unknown" || phonetic.includes("?")) {
      flagFinding("P2", "phonetic", "IPA dialect notation ambiguous or unverified");
    }
  }

}
