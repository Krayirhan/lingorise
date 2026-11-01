import {
  LearningItemKind,
  MeaningMatchQuestion
} from "../models/content";


export const GENERIC_CONTEXT = [
  /(?:ifades?i?|kelimes?i?|sözcük|sözcüğ?ü?) .* bağlamında kullanılır/i,
  /için [abc][12] öğesi/i,
  /düzeyi kelime veya ifade/i,
];

export const IRREGULAR_EXAMPLE_FORMS: Record<string, string[]> = {
  apply: ["applied", "applying"],
  spend: ["spent", "spending"],
  lend: ["lent", "lending"],
  forgive: ["forgave", "forgiven", "forgiving"],
  confident: ["confidently"],
};

export const PHRASE_FUNCTION_WORDS = new Set([
  "a", "an", "the", "to", "for", "of", "in", "on", "with", "my", "your", "someone", "be",
]);

export const IRREGULAR_PHRASE_FORMS: Record<string, string[]> = {
  meet: ["met"],
  make: ["made"],
  have: ["had"],
};

export const KNOWN_FAULTY_COLLOCATIONS = [
  /fresh water and/i,
  /small seed and/i,
  /this year i\b/i,
  /new job last\b/i,
  /today morning/i,
  /yesterday night/i,
  /lot yesterday/i,
  /our home is/i,
  /our office is/i,
  /the salary is/i,
  /a useful app and/i,
  /this plan is/i,
  /the trip was/i,
  /the person is/i,
  /persist with effort/i,
  /travel journey/i,
];

export const TRAILING_FUNCTION_WORDS = /\b(and|is|i|the|last|of|to|in|on|for|a|an|with|by|from|into|onto|this|that|or|but)$/i;

export function normaliseExample(question: Pick<MeaningMatchQuestion, "word" | "exampleSentence">): string {
  const sentence = (question.exampleSentence || "").toLocaleLowerCase("en").trim();
  const target = question.word.toLocaleLowerCase("en");
  const targetIndex = sentence.lastIndexOf(target);
  const withTarget = targetIndex >= 0
    ? `${sentence.slice(0, targetIndex)}{target}${sentence.slice(targetIndex + target.length)}`
    : sentence;
  return withTarget
    .replace(/\bin case\s+\d+\b/gi, "in case {number}")
    .replace(/\s+/g, " ")
    .replace(/[.!?]+$/, "");
}

export function templateSignature(normalised: string): string {
  if (/^(?:the team|they) will \{target\} during /.test(normalised)) return "subject will {target} during {context}";
  if (/^the \{target\} (?:affected|shaped) /.test(normalised)) return "the {target} verb {context}";
  if (/^(?:their|the) response to .+ was \{target\}$/.test(normalised)) return "response to {context} was {target}";
  if (/^the report uses \{target\} in its central analysis$/.test(normalised)) return "report uses {target} in central analysis";
  if (/^the specialist presentation addressed \{target\} with precision$/.test(normalised)) return "presentation addressed {target} with precision";
  return normalised;
}

export function normaliseTranslation(question: Pick<MeaningMatchQuestion, "meaning" | "exampleTranslation">): string {
  const translation = (question.exampleTranslation || "").toLocaleLowerCase("tr").trim();
  const meaning = question.meaning.toLocaleLowerCase("tr");
  const index = translation.lastIndexOf(meaning);
  const withMeaning = index >= 0 ? `${translation.slice(0, index)}{meaning}${translation.slice(index + meaning.length)}` : translation;
  return withMeaning
    .replace(/\bin case\s+\d+\b/gi, "in case {number}")
    .replace(/\s+/g, " ")
    .replace(/[.!?]+$/, "");
}

export function translationTemplateSignature(normalised: string): string {
  if (/^ekip .+ sırasında \{meaning\}$/.test(normalised)) return "ekip {context} sırasında {meaning}";
  if (/^.+ karşısındaki yanıt(?:ları)? \{meaning\}$/.test(normalised)) return "{context} karşısındaki yanıt {meaning}";
  if (/^\{meaning\}, .+ (?:üzerinde etkili oldu|sürecini şekillendirdi)$/.test(normalised)) return "{meaning}, {context} etkiledi";
  if (/^rapor merkezi analizinde \{meaning\} ifadesini kullanır$/.test(normalised)) return "rapor merkezi analizinde {meaning} kullanır";
  if (/^uzman sunumu \{meaning\} konusunu kesin biçimde ele aldı$/.test(normalised)) return "uzman sunumu {meaning} konusunu ele aldı";
  return normalised;
}

export function checkTargetInExample(word: string, exampleSentence: string, kind?: LearningItemKind): boolean {
  const example = exampleSentence.toLocaleLowerCase("en");
  const target = word.toLocaleLowerCase("en").trim();
  if (!target || !example) return false;

  const phraseParts = target.split(/…|\.\.\./).map((part) => part.trim()).filter(Boolean);
  if (phraseParts.length > 1) {
    return phraseParts.reduce((lastIndex, part) => (lastIndex < 0 ? -1 : example.indexOf(part, lastIndex)), 0) >= 0;
  }

  const wordForms = new Set<string>([target]);
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

  if ([...wordForms].some((form) => example.includes(form))) {
    return true;
  }

  if (kind === "phrase") {
    const targetWords = target.match(/[a-z]+/g)?.filter((w) => !PHRASE_FUNCTION_WORDS.has(w)) || [];
    const exampleWords = example.match(/[a-z]+/g) || [];
    return (
      targetWords.length > 0 &&
      targetWords.every((w) =>
        exampleWords.some(
          (candidate) =>
            candidate === w ||
            candidate.startsWith(w) ||
            (w.endsWith("e") && candidate.startsWith(w.slice(0, -1))) ||
            (IRREGULAR_PHRASE_FORMS[w] || []).includes(candidate)
        )
      )
    );
  }

  return false;
}
