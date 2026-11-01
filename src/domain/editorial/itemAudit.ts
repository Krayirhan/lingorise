import {
  MeaningMatchQuestion
} from "../models/content";
import { validateCollocation } from "./fields/collocation";
import { validateExample } from "./fields/example";
import { validateIdentity } from "./fields/identity";
import { validateMetadata } from "./fields/metadata";
import { validateOptions } from "./fields/options";
import { validatePhonetic } from "./fields/phonetic";
import { validateProduction } from "./fields/production";
import { validatePublication } from "./fields/publication";
import { validateTranslation } from "./fields/translation";
import { AuditFinding, AuditPriority, CatalogueAuditContext, FieldAuditStatus, ItemAuditResult, MANDATORY_AUDIT_FIELDS, MandatoryAuditField } from "./types";

export function auditItemDetailed(
  question: MeaningMatchQuestion,
  context?: CatalogueAuditContext
): ItemAuditResult {
  const errors: AuditFinding[] = [];
  const warnings: AuditFinding[] = [];
  const informational: string[] = [];

  const fieldResults: Record<string, FieldAuditStatus> = {};
  for (const field of MANDATORY_AUDIT_FIELDS) {
    fieldResults[field] = "pass";
  }

  function flagFinding(priority: AuditPriority, field: MandatoryAuditField, message: string, ruleId?: string) {
    const finding: AuditFinding = { priority, message, field, ruleId };
    if (priority === "P0") {
      errors.push(finding);
      fieldResults[field] = "blocked";
    } else if (priority === "P1") {
      errors.push(finding);
      if (fieldResults[field] !== "blocked") {
        fieldResults[field] = "revision_required";
      }
    } else if (priority === "P2") {
      warnings.push(finding);
      if (fieldResults[field] === "pass") {
        fieldResults[field] = "revision_required";
      }
    } else if (priority === "P3") {
      warnings.push(finding);
    }
  }

  validateIdentity(question, flagFinding, context, informational);
  validateOptions(question, flagFinding, context, informational);
  validateMetadata(question, flagFinding, context, informational);
  validateExample(question, flagFinding, context, informational);
  validateTranslation(question, flagFinding, context, informational);
  validatePhonetic(question, flagFinding, context, informational);
  validateCollocation(question, flagFinding, context, informational);
  validateProduction(question, flagFinding, context, informational);
  validatePublication(question, flagFinding, context, informational);
  return {
    itemId: question.id,
    level: question.level,
    errors,
    warnings,
    informational,
    fieldResults,
  };
}
