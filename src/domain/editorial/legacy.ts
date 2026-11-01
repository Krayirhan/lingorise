import {
  EditorialStatus,
  MeaningMatchQuestion
} from "../models/content";
import { GENERIC_CONTEXT, IRREGULAR_EXAMPLE_FORMS, IRREGULAR_PHRASE_FORMS, normaliseExample, normaliseTranslation, PHRASE_FUNCTION_WORDS, templateSignature, translationTemplateSignature } from "./shared";
import { EditorialAudit, EditorialQuestionDraft } from "./types";

export function auditOne(question: MeaningMatchQuestion): string[] {
  const errors: string[] = [];
  const options = question.options || [question.meaning, ...(question.wrongOptions || [])];
  if (!question.senseId) errors.push("senseId missing");
  if (!question.cefr || question.cefr !== question.level) errors.push("CEFR level missing or mismatched");
  if (!question.learningItemKind) errors.push("learningItemKind missing");
  if (!question.register) errors.push("register missing");
  if (!question.phonetic) errors.push("IPA phonetic missing");
  if (question.level === "C2" && !question.collocation) errors.push("collocation missing");
  if (question.level === "C2" && !question.productionPrompt) errors.push("production prompt missing");
  if (question.level === "B1") {
    if (/explain how to\s+(?:heavy|key|meeting|efficient|flexible|reliable|top|staff|respectful|famous|remote|crowded|train|delay|insurance|departure|arrival|destination|memorable|authentic|cultural|custom|guidebook|journey|adventure|souvenir|hospitality|broadcast|source|accurate|biased|audience|trend|access|community|inequality|opportunity|volunteer|protest|regulation|public|debate|responsible|diverse|option|consequence|advantage|drawback|strategy|practical|realistic|ambitious|independent|alternative|outcome|the\b|a\b|an\b)/i.test(question.productionPrompt || "")) {
      errors.push("broken production prompt syntax: 'Explain how to' requires base verb, not noun phrase or adjective");
    }
  }
  if (!question.source) errors.push("editorial provenance missing");
  if (question.editorialStatus === "approved") {
    const review = question.editorialReview;
    if (!review?.reviewId || !review.reviewerId || !review.reviewedAt || !review.rubricVersion || review.decision !== "approved") {
      errors.push("approved item lacks verifiable human review evidence");
    } else if (review.reviewedAt !== question.reviewedAt || review.reviewerId !== question.reviewer) {
      errors.push("approved item review evidence does not match reviewer provenance");
    }
  }
  const example = question.exampleSentence?.toLocaleLowerCase("en") || "";
  if (/\bin case\s+\d+\b/i.test(example)) errors.push("example contains artificial numbered context marker");
  if (
    (/^the report uses\b/.test(example) || /^the specialist presentation addressed\b/.test(example)) &&
    question.partOfSpeech !== "noun"
  ) errors.push("example places target in an incompatible grammatical slot");
  const target = (question.word || "").toLocaleLowerCase("en").trim();
  const phraseParts = target.split(/…|\.\.\./).map((part) => part.trim()).filter(Boolean);
  const wordForms = new Set([target]);
  if (phraseParts.length === 1) {
    (IRREGULAR_EXAMPLE_FORMS[target] || []).forEach((form) => wordForms.add(form));
    if (target.endsWith("y")) {
      wordForms.add(`${target.slice(0, -1)}ies`);
      wordForms.add(`${target.slice(0, -1)}ied`);
    }
    wordForms.add(`${target}s`);
    wordForms.add(`${target}es`);
    wordForms.add(`${target}ed`);
    wordForms.add(`${target}ing`);
    if (target.endsWith("e")) {
      wordForms.add(`${target}d`);
      wordForms.add(`${target.slice(0, -1)}ing`);
    }
    wordForms.add(`${target}ly`);
  }
  const phraseContentMatches = () => {
    const targetWords = target.match(/[a-z]+/g)?.filter((word) => !PHRASE_FUNCTION_WORDS.has(word)) || [];
    const exampleWords = example.match(/[a-z]+/g) || [];
    return targetWords.length > 0 && targetWords.every((word) => exampleWords.some((candidate) =>
      candidate === word || candidate.startsWith(word) || (word.endsWith("e") && candidate.startsWith(word.slice(0, -1))) || (IRREGULAR_PHRASE_FORMS[word] || []).includes(candidate)
    ));
  };
  const targetInExample = phraseParts.length > 1
    ? phraseParts.reduce((lastIndex, part) => lastIndex < 0 ? -1 : example.indexOf(part, lastIndex), 0) >= 0
    : [...wordForms].some((form) => example.includes(form)) || (question.learningItemKind === "phrase" && phraseContentMatches());
  if (!targetInExample) errors.push("example does not contain target");
  const translation = question.exampleTranslation || "";
  if (!translation || GENERIC_CONTEXT.some((rule) => rule.test(translation)) || /\bin case\s+\d+\b/i.test(translation)) errors.push("generic, artificial, or missing Turkish example");
  if (!question.wrongOptions || question.wrongOptions.length !== 2 || new Set(question.wrongOptions).size !== 2 || question.wrongOptions.includes(question.meaning)) errors.push("invalid distractors");
  if (options.length !== 3 || new Set(options).size !== 3 || !options.includes(question.meaning)) errors.push("invalid answer options");
  return errors;
}

export function auditEditorialQuestions(questions: MeaningMatchQuestion[]): EditorialAudit {
  const errors = questions.flatMap((question) => auditOne(question).map((error) => `${question.id}: ${error}`));
  const byExample = new Map<string, string[]>();
  const byTranslation = new Map<string, string[]>();
  const byDistractorPair = new Map<string, string[]>();
  questions.forEach((question) => {
    const normalisedExample = normaliseExample(question);
    if (normalisedExample) {
      const signature = templateSignature(normalisedExample);
      byExample.set(signature, [...(byExample.get(signature) || []), question.id]);
    }
    const normalisedTranslation = normaliseTranslation(question);
    if (normalisedTranslation) {
      const signature = translationTemplateSignature(normalisedTranslation);
      byTranslation.set(signature, [...(byTranslation.get(signature) || []), question.id]);
    }
    const pair = [...(question.wrongOptions || [])].map((option) => option.trim().toLocaleLowerCase("tr")).sort().join("|");
    if (pair) byDistractorPair.set(pair, [...(byDistractorPair.get(pair) || []), question.id]);
  });
  const templateExampleIds = [...byExample.values()].filter((ids) => ids.length >= 3).flat();
  if (templateExampleIds.length) errors.push(`Repeated example skeletons: ${templateExampleIds.join(", ")}`);
  const templateTranslationIds = [...byTranslation.values()].filter((ids) => ids.length >= 3).flat();
  if (templateTranslationIds.length) errors.push(`Repeated Turkish translation skeletons: ${templateTranslationIds.join(", ")}`);
  const overusedDistractorIds = [...byDistractorPair.values()].filter((ids) => ids.length >= 5).flat();
  if (overusedDistractorIds.length) errors.push(`Overused distractor pairs: ${overusedDistractorIds.join(", ")}`);
  const warnings = questions
    .filter((question) => question.editorialStatus !== "approved")
    .map((question) => `${question.id}: editorialStatus is ${question.editorialStatus || "missing"}`);
  return { approved: errors.length === 0 && warnings.length === 0, errors, warnings, templateExampleIds, templateTranslationIds, overusedDistractorIds };
}

export function createEditorialQuestion(draft: EditorialQuestionDraft): MeaningMatchQuestion {
  const question: MeaningMatchQuestion = {
    ...draft,
    mode: "MEANING_MATCH",
    prompt: draft.word,
    answer: draft.meaning,
    options: [draft.meaning, ...draft.wrongOptions],
    status: "published",
    editorialStatus: "approved" as EditorialStatus,
    editorialReview: draft.editorialReview,
  };
  const audit = auditEditorialQuestions([question]);
  if (!audit.approved) throw new Error(`Editorial question rejected: ${audit.errors.join("; ")}`);
  return question;
}
