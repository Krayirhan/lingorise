/**
 * Target-enforced, communicative production prompts for B2 vocabulary.
 * Domains: Abstract Concepts (academic), Argument & Persuasion (formal debate), Professional Communication (professional).
 * Enforces target word usage, contextual collocation, and reasoned justification (minimum 5 words).
 */

const TOPIC_REGISTER_GOALS: Record<string, string> = {
  "Soyut Konular": "analyzing an academic concept or theoretical framework",
  "Tartışma ve İkna": "constructing a persuasive argument or addressing a counterargument",
  "Profesyonel İletişim": "in a formal workplace inquiry, proposal, or client communication",
};

export function getB2ProductionPrompt(word: string, topic: string, collocation?: string): string {
  const goal = TOPIC_REGISTER_GOALS[topic] || "in formal discussion";
  if (collocation && collocation.trim().length > 0) {
    return `State and justify your perspective on "${collocation}" ${goal}. Use "${word}" and write at least 5 words.`;
  }
  return `Provide a reasoned explanation or formal response ${goal}. Use "${word}" and write at least 5 words.`;
}

export function getB2Register(topic: string): "academic" | "formal" | "professional" {
  if (topic === "Soyut Konular") return "academic";
  if (topic === "Profesyonel İletişim") return "professional";
  return "formal";
}
