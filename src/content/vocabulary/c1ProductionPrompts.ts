/**
 * Target-enforced, advanced production prompts for C1 vocabulary.
 * Domains: Academic & Professional Language (academic), Nuance & Register (formal/stylistic), Critical Analysis (academic reasoning).
 * Enforces target word usage, contextual collocation, and critical evaluation/synthesis (minimum 6 words).
 */

export function getC1ProductionPrompt(word: string, topic: string, collocation?: string): string {
  if (topic === "Akademik ve Profesyonel Dil") {
    if (collocation && collocation.trim().length > 0) {
      return `Synthesize evidence or evaluate research findings regarding "${collocation}". Use "${word}" and write at least 6 words.`;
    }
    return `Formulate an academic critique or research objective. Use "${word}" and write at least 6 words.`;
  }
  if (topic === "Nüans ve Üslup") {
    if (collocation && collocation.trim().length > 0) {
      return `Articulate a nuanced or diplomatic point involving "${collocation}". Use "${word}" and write at least 6 words.`;
    }
    return `Convey a subtle stylistic distinction or formal perspective. Use "${word}" and write at least 6 words.`;
  }
  // Eleştirel Analiz
  if (collocation && collocation.trim().length > 0) {
    return `Critically scrutinize assumptions or address a counterargument regarding "${collocation}". Use "${word}" and write at least 6 words.`;
  }
  return `Construct a critical evaluation with supporting evidence. Use "${word}" and write at least 6 words.`;
}

export function getC1Register(topic: string): "academic" | "formal" {
  if (topic === "Nüans ve Üslup") return "formal";
  return "academic";
}
