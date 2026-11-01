import { en, tr, copyByLocale } from "../../src/i18n/en";
import { assert } from "../support/assertions";

// 33. Every i18n key a component asks for actually exists
console.log("\n33. Dictionary Completeness:");
export const enCopy = copyByLocale.en;
export const sampledKeys: [string, string][] = [
  ["game.modeLabel", enCopy.game.modeLabel],
  ["game.hint", enCopy.game.hint],
  ["game.hintActive", enCopy.game.hintActive],
  ["game.backButton", enCopy.game.backButton],
  ["game.examModeBadge", enCopy.game.examModeBadge],
  ["game.quickPractice", enCopy.game.quickPractice],
  ["game.optionCorrectSuffix", enCopy.game.optionCorrectSuffix],
  ["game.audioErrorToast", enCopy.game.audioErrorToast],
  ["onboarding.createAccountNow", enCopy.onboarding.createAccountNow],
  ["progress.dueNowLabel", enCopy.progress.dueNowLabel],
  ["progress.levelComingSoon", enCopy.progress.levelComingSoon],
  ["home.questHistoryTitle", enCopy.home.questHistoryTitle],
  // COMPAT-QA-001 / GLOBAL-QA-012 — the in-app Privacy Policy content was
  // previously hardcoded Turkish, bypassing this same locale system.
  ["profile.privacyModalTitle", enCopy.profile.privacyModalTitle],
  ["profile.privacyPolicySection1Body", enCopy.profile.privacyPolicySection1Body],
  ["profile.privacyPolicySection2Body", enCopy.profile.privacyPolicySection2Body],
  ["profile.privacyPolicySection3Body", enCopy.profile.privacyPolicySection3Body],
  ["profile.privacyPolicySection4Body", enCopy.profile.privacyPolicySection4Body],
  ["profile.privacyPolicyWebLinkText", enCopy.profile.privacyPolicyWebLinkText],
  ["profile.resetDataDialogTitle", enCopy.profile.resetDataDialogTitle],
];
for (const [name, value] of sampledKeys) {
  assert(typeof value === "string" && value.length > 0, `${name} resolves to real English copy`);
}

// Compares actual KEY NAMES (not just key count) — a length-only check would
// pass even if one locale had a misspelled/missing key while an unrelated
// extra key happened to keep the counts equal (independent test-reviewer
// finding during Sprint 2). `en.ts`'s `tr: tr as unknown as Copy` cast
// deliberately opts out of compiler-checked key parity, so this runtime
// check is the only thing that actually verifies it.
export const sameKeySet = (a: object, b: object): boolean => {
  const keysA = Object.keys(a).sort().join(",");
  const keysB = Object.keys(b).sort().join(",");
  return keysA === keysB;
};
assert(
  sameKeySet(enCopy.game, copyByLocale.tr.game),
  "Practice dictionary has the exact same key names in both languages, not merely the same count"
);
assert(
  sameKeySet(enCopy.profile, copyByLocale.tr.profile),
  "Profile dictionary (including the Privacy Policy content) has the exact same key names in both languages, not merely the same count — no key is missing/misspelled in one locale"
);
assert(
  enCopy.profile.privacyPolicySection1Body !== copyByLocale.tr.profile.privacyPolicySection1Body,
  "The English Privacy Policy content is a real, distinct translation, not the Turkish text reused verbatim"
);

