import * as fs from "fs";
import * as path from "path";
import { assert } from "../support/assertions";

// 44. Accessibility labels must speak the app's language, not a hardcoded one
// (roadmap Birim 9.1 — a TalkBack user on the English locale must not hear
// Turkish button names)
console.log("\n44. Accessibility Label Localization Scan (roadmap Birim 9.1):");
{
  // Components that legitimately carry a hardcoded label, and why:
  //  - GlobalTopBar / DevClockCard: __DEV__-gated, never reach a real user
  //  - Brand: the product name + "logo" — not meaningfully translatable
  //  - HomeHeader: dead code, not imported/rendered anywhere in the app
  //  - LanguageSettingsCard: the two labels ARE each language's own name,
  //    intentionally bilingual by design (Türkçe/English selectors)
  const allowlist = new Set([
    "src/components/GlobalTopBar.tsx",
    "src/components/Brand.tsx",
    "src/features/profile/components/DevClockCard.tsx",
    "src/features/home/components/HomeHeader.tsx",
    "src/features/profile/components/LanguageSettingsCard.tsx",
  ]);

  const srcRoot = path.join(__dirname, "..", "..", "src");
  const hardcodedLabelPattern = /accessibilityLabel="[A-ZİÇĞÖŞÜ][a-zA-Zçğıöşü ]*"/;
  const offenders: string[] = [];

  function walk(dir: string) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(full);
      } else if (entry.name.endsWith(".tsx")) {
        const relative = path.relative(path.join(__dirname, "..", ".."), full).replace(/\\/g, "/");
        if (allowlist.has(relative)) continue;
        const content = fs.readFileSync(full, "utf-8");
        if (hardcodedLabelPattern.test(content)) offenders.push(relative);
      }
    }
  }
  walk(srcRoot);

  assert(
    offenders.length === 0,
    `No shipped component has a hardcoded-language accessibilityLabel outside the documented allowlist (offenders: ${offenders.join(", ") || "none"})`
  );
}

