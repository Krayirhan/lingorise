import fs from "node:fs";
import path from "node:path";
import { ESLint } from "eslint";

const root = process.cwd();
const baselinePath = path.join(root, "scripts", "quality", "eslint-baseline.json");

async function main() {
  const eslint = new ESLint();
  const results = await eslint.lintFiles(["src/**/*.{ts,tsx}", "tests/**/*.ts", "scripts/**/*.{ts,mjs}"]);
  const baseline = JSON.parse(fs.readFileSync(baselinePath, "utf8"));
  const regressions = [];
  let errors = 0;
  let warnings = 0;
  let cleanFiles = 0;

  for (const result of results) {
    const relative = path.relative(root, result.filePath).replaceAll("\\", "/");
    if (result.errorCount + result.warningCount === 0) cleanFiles++;
    errors += result.errorCount;
    warnings += result.warningCount;
    const counts = new Map();
    for (const message of result.messages) {
      const key = `${message.ruleId || "parse"}:${message.severity}`;
      counts.set(key, (counts.get(key) || 0) + 1);
    }
    for (const [key, count] of counts) {
      const allowed = baseline.entries[relative]?.[key] || 0;
      if (count > allowed) regressions.push(`${relative}: ${key} ${count} (baseline ${allowed})`);
    }
  }

  const report = {
    baselineVersion: baseline.version,
    filesScanned: results.length,
    cleanFiles,
    cleanFileRate: results.length ? Number((cleanFiles / results.length * 100).toFixed(2)) : 100,
    errors,
    warnings,
    regressions,
  };
  console.log(JSON.stringify(report, null, 2));
  fs.mkdirSync(path.join(root, ".audit", "quality"), { recursive: true });
  fs.writeFileSync(path.join(root, ".audit", "quality", "lint-metrics.json"), `${JSON.stringify(report, null, 2)}\n`);
  if (regressions.length) process.exitCode = 1;
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
