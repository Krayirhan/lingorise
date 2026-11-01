import {
  MeaningMatchQuestion
} from "../models/content";
import { IpaProvenance } from "./types";

export function auditIpaProvenance(question: MeaningMatchQuestion): IpaProvenance {
  const rawIpa = (question.phonetic || "").trim();
  const source = (question.source || "").trim();

  if (!rawIpa) {
    return {
      value: "",
      dialect: "unknown",
      source,
      verificationStatus: "failed",
    };
  }

  // Dialect heuristics
  let dialect: "AmE" | "BrE" | "both" | "unknown" = "unknown";
  const lowerIpa = rawIpa.toLowerCase();
  const lowerSource = source.toLowerCase();

  const hasAmEMarkers = /ɑːr|ɜːr|ɔːr|ɪr|ʊr|eər|ɝ|ɚ/.test(rawIpa) || lowerSource.includes("ame") || lowerSource.includes("american");
  const hasBrEMarkers = /ɒ|əʊ|iə|eə/.test(rawIpa) || lowerSource.includes("bre") || lowerSource.includes("british") || lowerSource.includes("cambridge");

  if (hasAmEMarkers && hasBrEMarkers) {
    dialect = "both";
  } else if (hasAmEMarkers) {
    dialect = "AmE";
  } else if (hasBrEMarkers) {
    dialect = "BrE";
  } else if (lowerSource.includes("oxford") || lowerSource.includes("webster") || /^\/[^/]+\/$/.test(rawIpa)) {
    dialect = "both";
  }

  // Verification status
  let verificationStatus: "verified" | "pending" | "failed" = "pending";
  const isValidIpaSyntax = /^[\/\[]?[a-zA-Z0-9ˈˌːæɑɒɔəɛɪʊʌθðʃʒŋʔɜɡ\u0250-\u02AF\u02B0-\u02FF():. \-,\/\]]+[\/\]]?$/.test(rawIpa);

  if (!isValidIpaSyntax) {
    verificationStatus = "failed";
  } else {
    // Requires verified source provenance
    const hasAuthoritativeSource =
      source.length > 0 &&
      !lowerSource.includes("synthetic") &&
      !lowerSource.includes("unverified") &&
      !lowerSource.includes("template") &&
      (lowerSource.includes("oxford") ||
        lowerSource.includes("cambridge") ||
        lowerSource.includes("corpus") ||
        lowerSource.includes("word list") ||
        lowerSource.includes("proficiency") ||
        lowerSource.includes("editorial review") ||
        lowerSource.includes("editorial rewrite") ||
        lowerSource.includes("cefr"));

    if (hasAuthoritativeSource) {
      verificationStatus = "verified";
    } else {
      verificationStatus = "pending";
    }
  }

  return {
    value: rawIpa,
    dialect,
    source,
    verificationStatus,
  };
}
