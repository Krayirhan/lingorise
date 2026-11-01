export interface WritingTask {
  questionId: string;
  level: "B1" | "B2" | "C1" | "C2";
  target: string;
  acceptedForms: string[];
  instruction: { tr: string; en: string };
  example: string;
  minWords: number;
  requiredPhrase?: string[];
  reviewed: true;
}

export interface WritingCheck {
  target: "found" | "unconfirmed";
  phrase?: "found" | "unconfirmed";
  enoughWords: boolean;
  punctuation: boolean;
}

const tokens = (text: string) => text.toLocaleLowerCase("en-US").match(/[a-z]+(?:['’-][a-z]+)*/g) ?? [];
function includesSequence(haystack: string[], needle: string[]): boolean {
  return needle.length > 0 && haystack.some((_, index) => needle.every((part, offset) => haystack[index + offset] === part));
}

export function evaluateWriting(task: WritingTask, response: string): WritingCheck {
  const text = response.trim();
  const words = tokens(text);
  return {
    target: task.acceptedForms.some((form) => includesSequence(words, tokens(form))) ? "found" : "unconfirmed",
    ...(task.requiredPhrase?.length ? { phrase: task.requiredPhrase.some((form) => includesSequence(words, tokens(form))) ? "found" as const : "unconfirmed" as const } : {}),
    enoughWords: words.length >= task.minWords,
    punctuation: /[.!?]["'”’)]*$/.test(text),
  };
}

export function isWritingTaskReady(task: WritingTask | undefined, questionId: string, level: string, word: string): task is WritingTask {
  return Boolean(task && task.reviewed && task.questionId === questionId && task.level === level && task.target.toLowerCase() === word.toLowerCase() && task.instruction.tr.trim() && task.instruction.en.trim() && task.example.trim() && task.acceptedForms.some((form) => form.trim()) && task.minWords > 0);
}

export function shouldOfferWriting(task: WritingTask | undefined, question: { id: string; level: string; word: string }, mode: string, isCorrect: boolean, alreadyOffered: boolean): boolean {
  return mode === "PRACTICE" && isCorrect && !alreadyOffered && isWritingTaskReady(task, question.id, question.level, question.word);
}
