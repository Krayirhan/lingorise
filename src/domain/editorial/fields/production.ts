import {
  MeaningMatchQuestion
} from "../../models/content";
import { CatalogueAuditContext } from "../types";


import { FindingReporter } from "../types";
export function validateProduction(question: MeaningMatchQuestion, flagFinding: FindingReporter, context?: CatalogueAuditContext, _informational: string[] = []) {
  // 20. productionPrompt
  const prompt = (question.productionPrompt || "").trim();
  if (question.level === "C2" && !prompt) {
    flagFinding("P0", "productionPrompt", "C2 items strictly require productionPrompt");
  } else if (!prompt) {
    flagFinding("P1", "productionPrompt", "productionPrompt missing");
  } else {
    const promptLower = prompt.toLowerCase();
    const targetLower = question.word.toLowerCase();
    const wordsInPrompt = prompt.split(/\s+/).filter(Boolean);

    // Broken grammar: "Explain how to + noun phrase" without verb
    if (/explain how to the\b|explain how to a\b/i.test(prompt)) {
      flagFinding("P1", "productionPrompt", "production prompt syntax broken: 'Explain how to' requires base verb");
    }

    // Check if target is enforced
    const targetInQuotes =
      promptLower.includes(`"${targetLower}"`) ||
      promptLower.includes(`'${targetLower}'`) ||
      promptLower.includes(`‘${targetLower}’`) ||
      promptLower.includes(`“${targetLower}”`);

    const hasTargetMention = promptLower.includes(targetLower) || targetInQuotes;

    if (!hasTargetMention) {
      flagFinding("P1", "productionPrompt", "productionPrompt does not enforce the target word");
    } else {
      // Check if target is ONLY in quotes without production requirement
      const hasProductionInstruction =
        /use\s+['"‘“]?[a-z0-9 -]+['"’”]?/i.test(promptLower) ||
        /answer using/i.test(promptLower) ||
        /include\s+['"‘“]?[a-z0-9 -]+['"’”]?/i.test(promptLower) ||
        /write\s+(?:a|using|with)/i.test(promptLower) ||
        /explain/i.test(promptLower) ||
        /describe/i.test(promptLower) ||
        /critique/i.test(promptLower) ||
        /synthesize/i.test(promptLower) ||
        /discuss/i.test(promptLower) ||
        /evaluate/i.test(promptLower);

      if (targetInQuotes && /what does\s+['"‘“]?[a-z]+['"’”]?\s+mean|do you know what\s+['"‘“]?[a-z]+/i.test(promptLower) && !hasProductionInstruction) {
        flagFinding("P1", "productionPrompt", "target word only mentioned in quotes without production requirement");
      }
    }

    // Level-specific communicative goal checks
    if (question.level === "A1") {
      if (wordsInPrompt.length < 3) {
        flagFinding("P2", "productionPrompt", "A1 production prompt should have at least 3 words");
      }
      const hasLengthOrProductionRequirement =
        /at least 3 words|at least three words|minimum 3 words|minimum three words|in your answer|in a sentence|answer using|write using|response using/i.test(promptLower);
      if (!hasLengthOrProductionRequirement) {
        flagFinding("P1", "productionPrompt", "A1 production prompt must explicitly require at least 3 words or production in answer");
      }
    } else if (question.level === "A2") {
      if (wordsInPrompt.length < 4) {
        flagFinding("P1", "productionPrompt", "A2 production prompt should have at least 4 words");
      }
      const hasLengthRequirement =
        /at least 4 words|at least four words|minimum 4 words|minimum four words|at least four english words|at least 4 english words/i.test(promptLower);
      if (!hasLengthRequirement) {
        flagFinding("P1", "productionPrompt", "A2 production prompt must explicitly demand at least four words");
      }
      const hasCommunicativeIntent =
        /explain|describe|tell|ask|invite|remind|advise|congratulate|suggest|express|instruct|thank|talk about|give advice|share|list|name|call|wish|promise|recommend|warn|complain|discuss|direct|encourage|hurry|check/i.test(promptLower);
      if (!hasCommunicativeIntent) {
        flagFinding("P1", "productionPrompt", "A2 production prompt lacks communicative functional goal");
      }
      if (/suggest a helpful download an app action/i.test(promptLower) || /write a sentence using/i.test(promptLower)) {
        flagFinding("P1", "productionPrompt", "A2 production prompt contains broken or naive template phrasing");
      }
    } else if (question.level === "B1") {
      const isBrokenExplainHowTo =
        /explain how to\s+(?:heavy|key|meeting|efficient|flexible|reliable|top|staff|respectful|famous|remote|crowded|train|delay|insurance|departure|arrival|destination|memorable|authentic|cultural|custom|guidebook|journey|adventure|souvenir|hospitality|broadcast|source|accurate|biased|audience|trend|access|community|inequality|opportunity|volunteer|protest|regulation|public|debate|responsible|diverse|option|consequence|advantage|drawback|strategy|practical|realistic|ambitious|independent|alternative|outcome|the\b|a\b|an\b)/i.test(promptLower);
      if (isBrokenExplainHowTo) {
        flagFinding("P0", "productionPrompt", "B1 production prompt syntax broken: 'Explain how to' requires base verb, not noun phrase or adjective");
      }
      if (wordsInPrompt.length < 5) {
        flagFinding("P2", "productionPrompt", "production prompt word count borderline for level progression (B1 min 5 words)");
      }
      const hasLengthReq =
        /at least 5 words|at least five words|minimum 5 words|minimum five words|at least five english words|at least 5 english words/i.test(promptLower);
      if (!hasLengthReq) {
        flagFinding("P1", "productionPrompt", "B1 production prompt must explicitly demand at least five words");
      }
      const hasCommunicativeIntent =
        /explain|describe|tell|ask|invite|remind|advise|congratulate|suggest|express|instruct|thank|talk about|give advice|share|list|name|call|wish|promise|recommend|warn|complain|discuss|direct|encourage|hurry|check|outline|summarize|reflect|state|give|provide/i.test(promptLower);
      if (!hasCommunicativeIntent) {
        flagFinding("P1", "productionPrompt", "B1 production prompt lacks communicative functional goal");
      }
    } else if (question.level === "B2") {
      const hasRationaleOrRegister =
        /rationale|formal|professional|register|policy|merger|in a formal|explain why|argue why/i.test(promptLower);
      if (!hasRationaleOrRegister) {
        flagFinding("P1", "productionPrompt", "B2 production requires rationale or register specification");
      }
    } else if (question.level === "C1") {
      const hasCriticalOrEvidence =
        /critical|critically|evidence|synthesize|analytical|analyze|evaluate|disclosures|geopolitical/i.test(promptLower);
      if (!hasCriticalOrEvidence) {
        flagFinding("P1", "productionPrompt", "C1 production requires critical analysis, evidence, or synthesis");
      }
    } else if (question.level === "C2") {
      const isNaive =
        /^(?:write a (?:short )?sentence|explain the word|use the word in a sentence|tell a (?:simple )?story|write about|use .* in an? (?:easy|daily|simple))\b/i.test(promptLower.trim());
      const hasSpecialistDomainOrNuance =
        /critique|evaluate|assess|analyze|analysis|argue|discuss|describe|explain|draft|detail|formulate|summarize|contrast|demonstrate|outline|how (?:can|should|does|do|would)|why|what|defend|defence|defense|justify|provide|question|propose|examine|investigate|decision|evidence|nuance|specialist|framework|policy|model|protocol|register|recommend|synthesize|diplomatic|appeal/i.test(promptLower);
      if (isNaive || !hasSpecialistDomainOrNuance) {
        flagFinding("P1", "productionPrompt", "C2 production prompt requires specialist domain or nuanced critical task");
      }
    }

    if (context?.overusedPromptIds?.has(question.id)) {
      flagFinding("P1", "productionPrompt", "production prompt template repeated across 5 or more items in catalogue");
    }

    // Trailing whitespace styling
    if (/\s+$/.test(question.productionPrompt || "")) {
      flagFinding("P3", "productionPrompt", "prompt punctuation or whitespace formatting suggestion");
    }
  }

}
