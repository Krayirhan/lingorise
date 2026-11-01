import fs from "node:fs";

const baseline = JSON.parse(fs.readFileSync("scripts/quality/coverage-baseline.json", "utf8"));
const results = [];
for (const layer of ["domain", "application"]) {
  const summaryPath = `coverage/${layer}/coverage-summary.json`;
  const actual = JSON.parse(fs.readFileSync(summaryPath, "utf8")).total;
  for (const metric of ["lines", "branches"]) {
    const target = baseline.targets[layer][metric];
    const value = actual[metric].pct;
    results.push({ layer, metric, actual: value, baseline: target, passed: value + 0.001 >= target });
  }
}

console.log(JSON.stringify({ baselineVersion: baseline.version, results }, null, 2));
if (results.some(result => !result.passed)) process.exitCode = 1;
