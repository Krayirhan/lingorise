import { en, tr } from "../../src/i18n/en";
import { assert } from "../support/assertions";

// 6. Localization 1:1 Key Parity Check
console.log("\n6. Localization Key Parity Check:");
function getKeys(obj: any, prefix = ""): string[] {
  let keys: string[] = [];
  for (const k in obj) {
    const full = prefix ? `${prefix}.${k}` : k;
    if (typeof obj[k] === "object" && obj[k] !== null) {
      keys = keys.concat(getKeys(obj[k], full));
    } else {
      keys.push(full);
    }
  }
  return keys;
}

export const enKeys = getKeys(en).sort();
export const trKeys = getKeys(tr).sort();
export const missingInTr = enKeys.filter((k) => !trKeys.includes(k));
export const missingInEn = trKeys.filter((k) => !enKeys.includes(k));

assert(missingInTr.length === 0, `All EN keys exist in TR (missing: ${missingInTr.join(", ") || "none"})`);
assert(missingInEn.length === 0, `All TR keys exist in EN (missing: ${missingInEn.join(", ") || "none"})`);
assert(enKeys.length === trKeys.length, `Exact 1:1 key parity verified (${enKeys.length} keys)`);

