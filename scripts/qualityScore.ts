import * as fs from "node:fs";
import * as path from "node:path";
import { spawnSync } from "node:child_process";
import * as ts from "typescript";
import { checkArchitecture } from "./checkArchitecture";

const RUBRIC_VERSION = "2.0.0";
const CHECK_TIMEOUT_MS = 10 * 60 * 1000;

interface FunctionMetric { file: string; name: string; lines: number }
interface CheckDefinition { name: string; args: string[]; cwd?: string; command?: string }
interface CheckResult { name: string; status: "passed" | "failed" | "blocked"; exitCode: number | null; summary?: string; metrics?: Record<string, number>; diagnostic?: string }

function collectSourceFiles(directory: string): string[] {
  const files: string[] = [];
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const file = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...collectSourceFiles(file));
    else if (/\.tsx?$/.test(file)) files.push(file);
  }
  return files;
}

function collectLongFunctions(file: string, text: string, root: string): FunctionMetric[] {
  const source = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true, file.endsWith(".tsx") ? ts.ScriptKind.TSX : ts.ScriptKind.TS);
  const metrics: FunctionMetric[] = [];
  function visit(node: ts.Node) {
    if (ts.isFunctionDeclaration(node) || ts.isMethodDeclaration(node) || ts.isFunctionExpression(node) || ts.isArrowFunction(node)) {
      const start = source.getLineAndCharacterOfPosition(node.getStart(source)).line;
      const end = source.getLineAndCharacterOfPosition(node.end).line;
      const lines = end - start + 1;
      if (lines > 120) metrics.push({ file: path.relative(root, file).replace(/\\/g, "/"), name: node.name?.getText(source) || "<callback>", lines });
    }
    ts.forEachChild(node, visit);
  }
  visit(source);
  return metrics;
}

function runProcess(command: string, args: string[], cwd: string): { status: number | null; output: string; error?: string } {
  const result = spawnSync(command, args, {
    cwd,
    encoding: "utf8",
    timeout: CHECK_TIMEOUT_MS,
    maxBuffer: 32 * 1024 * 1024,
    windowsHide: true,
  });
  let timeoutCleanup = "";
  if ((result.error as NodeJS.ErrnoException | undefined)?.code === "ETIMEDOUT" && process.platform === "win32" && result.pid) {
    const cleanup = spawnSync("taskkill.exe", ["/PID", String(result.pid), "/T", "/F"], {
      encoding: "utf8",
      timeout: 10_000,
      windowsHide: true,
    });
    timeoutCleanup = ` Windows process-tree cleanup requested for PID ${result.pid} (taskkill exit ${cleanup.status ?? "unknown"}).`;
  }
  return {
    status: result.status,
    output: `${result.stdout || ""}\n${result.stderr || ""}`,
    error: result.error ? `${result.error.message}.${timeoutCleanup}` : undefined,
  };
}

function npmProcessArgs(args: string[]): { command: string; args: string[] } {
  const npmCli = process.env.npm_execpath || process.env.NPM_CLI_JS;
  if (npmCli && fs.existsSync(npmCli)) return { command: process.execPath, args: [npmCli, ...args] };
  if (process.platform === "win32") return { command: "powershell.exe", args: ["-NoProfile", "-Command", `& npm.cmd ${args.join(" ")}`] };
  return { command: "npm", args };
}

function hasConnectedAndroidDevice(root: string): boolean {
  const result = runProcess("adb", ["devices"], root);
  return result.status === 0 && result.output.split(/\r?\n/).some(line => /\tdevice$/.test(line));
}

function isFirestorePortOccupied(root: string): boolean {
  if (process.platform === "win32") {
    const result = runProcess("netstat.exe", ["-ano"], root);
    return result.output.split(/\r?\n/).some(line => /:8080\s+.*LISTENING/i.test(line));
  }
  const result = runProcess("sh", ["-c", "(command -v lsof >/dev/null && lsof -iTCP:8080 -sTCP:LISTEN) || (command -v ss >/dev/null && ss -ltn 'sport = :8080')"], root);
  return result.status === 0 && /8080/.test(result.output);
}

function runCheck(check: CheckDefinition, root: string): CheckResult {
  if (check.name === "maestroSmoke" && !hasConnectedAndroidDevice(root)) {
    return { name: check.name, status: "blocked", exitCode: null, diagnostic: "No connected Android device/emulator; Maestro was not started." };
  }
  if (check.name === "firestoreRules" && isFirestorePortOccupied(root)) {
    return { name: check.name, status: "blocked", exitCode: null, diagnostic: "Port 8080 is already occupied; Firestore emulator test was not started." };
  }

  const tsNode = path.join(root, "node_modules", "ts-node", "dist", "bin.js");
  const typescript = path.join(root, "node_modules", "typescript", "bin", "tsc");
  const directCommands: Record<string, { command: string; args: string[] }> = {
    typecheck: { command: process.execPath, args: [typescript, "--noEmit"] },
    architecture: { command: process.execPath, args: [tsNode, "-O", "{\"module\":\"commonjs\"}", "scripts/checkArchitecture.ts"] },
    longFunctionReview: { command: process.execPath, args: ["scripts/checkLongFunctionReview.mjs"] },
    applicationTests: { command: process.execPath, args: [tsNode, "-O", "{\"module\":\"commonjs\"}", "tests/applicationRunner.ts"] },
    fullTests: { command: process.execPath, args: [tsNode, "-O", "{\"module\":\"commonjs\"}", "tests/testSuite.ts"] },
    lint: { command: process.execPath, args: ["scripts/checkLintBaseline.mjs"] },
  };
  const direct = directCommands[check.name];
  const processResult = check.command
    ? runProcess(check.command, check.args, check.cwd || root)
    : direct
      ? runProcess(direct.command, direct.args, root)
      : (() => {
        const npm = npmProcessArgs(["run", ...check.args]);
        return runProcess(npm.command, npm.args, check.cwd || root);
      })();
  const output = processResult.output;
  const recognizedBlock = (check.name === "firestoreRules" && /EADDRINUSE|address already in use|port.*(?:in use|already)/i.test(output))
    || (check.name === "maestroSmoke" && /no connected devices|no devices|device.*not found|no emulator/i.test(output));
  return {
    name: check.name,
    status: processResult.status === 0 ? "passed" : recognizedBlock ? "blocked" : "failed",
    exitCode: processResult.status,
    summary: check.name === "lint" && processResult.status === 0
      ? output.trim()
      : check.name === "fullTests" ? output.match(/TEST SUMMARY:.*|\d+ PASSED, \d+ FAILED/)?.[0] : undefined,
    diagnostic: processResult.error || (processResult.status === 0 ? undefined : output.slice(-1200).trim()),
  };
}

function main() {
  const root = process.cwd();
  const sourceRoot = path.join(root, "src");
  const sourceFiles = collectSourceFiles(sourceRoot);
  const applicationFiles = sourceFiles.filter(file => !/[\\/]src[\\/](?:content|i18n)[\\/]/.test(file));
  const largeFiles = applicationFiles.flatMap(file => {
    const text = fs.readFileSync(file, "utf8");
    const lines = text.split(/\r?\n/).length - (text.endsWith("\n") ? 1 : 0);
    return lines > 250 ? [{ file: path.relative(root, file).replace(/\\/g, "/"), lines }] : [];
  });
  const longFunctions = sourceFiles.flatMap(file => collectLongFunctions(file, fs.readFileSync(file, "utf8"), root));
  const architectureErrors = checkArchitecture(root);
  const checks: CheckDefinition[] = [
    { name: "typecheck", args: ["typecheck"] },
    { name: "architecture", args: ["check:architecture"] },
    { name: "longFunctionReview", args: ["check:long-function-review"] },
    { name: "lint", args: ["lint:check"] },
    { name: "applicationTests", args: ["test:application"] },
    { name: "fullTests", args: ["test"] },
    { name: "coverage", args: ["coverage"] },
    { name: "androidBuild", command: process.platform === "win32" ? "powershell.exe" : "./gradlew", args: process.platform === "win32" ? ["-NoProfile", "-Command", "& .\\gradlew.bat assembleDebug"] : ["assembleDebug"], cwd: path.join(root, "android") },
    { name: "firestoreRules", args: ["test:rules"] },
    { name: "maestroSmoke", args: ["test:e2e:smoke"] },
    { name: "diffCheck", command: "git", args: ["diff", "--check"] },
  ];
  const ciResultsPath = process.env.QUALITY_SCORE_CHECK_RESULTS;
  const ciResults = ciResultsPath && fs.existsSync(ciResultsPath)
    ? JSON.parse(fs.readFileSync(ciResultsPath, "utf8")) as Record<string, string>
    : null;
  const checkResults = checks.map(check => {
    if (!ciResults) return runCheck(check, root);
    const rawStatus = ciResults[check.name];
    const status = rawStatus === "success" || rawStatus === "passed"
      ? "passed"
      : rawStatus === "failure" || rawStatus === "failed"
        ? "failed"
        : "blocked";
    return { name: check.name, status: status as CheckResult["status"], exitCode: status === "passed" ? 0 : status === "failed" ? 1 : null, diagnostic: `CI job outcome: ${rawStatus || "not reported"}` };
  });

  const lintReportPath = path.join(root, ".audit", "quality", "lint-metrics.json");
  if (fs.existsSync(lintReportPath)) {
    const lint = JSON.parse(fs.readFileSync(lintReportPath, "utf8"));
    const lintResult = checkResults.find(result => result.name === "lint");
    if (lintResult) lintResult.metrics = lint;
  }
  const lintResultForOutput = checkResults.find(result => result.name === "lint");
  if (lintResultForOutput && !lintResultForOutput.metrics && lintResultForOutput.summary) {
    const reportStart = lintResultForOutput.summary.indexOf('{');
    const reportEnd = lintResultForOutput.summary.lastIndexOf('}');
    if (reportStart >= 0 && reportEnd > reportStart) {
      try { lintResultForOutput.metrics = JSON.parse(lintResultForOutput.summary.slice(reportStart, reportEnd + 1)); } catch { /* Keep missing metrics explicit. */ }
    }
  }

  const architectureScore = architectureErrors.length === 0 ? 100 : Math.max(0, 100 - architectureErrors.length * 10);
  const structuralScore = Math.max(0, 100 - largeFiles.length * 5 - longFunctions.length * 2);
  const passedChecks = checkResults.filter(result => result.status === "passed").length;
  const verificationScore = Math.round(passedChecks / checkResults.length * 100);

  const docsManifestPath = path.join(root, "scripts", "quality", "documentation-claims.json");
  const docsManifest = JSON.parse(fs.readFileSync(docsManifestPath, "utf8"));
  const lintMetrics = fs.existsSync(lintReportPath) ? JSON.parse(fs.readFileSync(lintReportPath, "utf8")) : null;
  const coverageBaseline = JSON.parse(fs.readFileSync(path.join(root, "scripts", "quality", "coverage-baseline.json"), "utf8"));
  const fullTestSummary = checkResults.find(result => result.name === "fullTests")?.summary || "";
  const fullTestCount = Number(fullTestSummary.match(/(\d+) PASSED/)?.[1]);
  const measuredDocumentationValues: Record<string, number> = {
    sourceFiles: sourceFiles.length,
    longFunctions: longFunctions.length,
    fullTestCount,
    domainLineTarget: coverageBaseline.targets.domain.lines,
    domainBranchTarget: coverageBaseline.targets.domain.branches,
    applicationLineTarget: coverageBaseline.targets.application.lines,
    applicationBranchTarget: coverageBaseline.targets.application.branches,
    lintCleanRate: lintMetrics?.cleanFileRate,
    lintErrors: lintMetrics?.errors,
    lintWarnings: lintMetrics?.warnings,
  };
  const statements = docsManifest.claims.map((claim: { id: string; document: string; pattern?: string; evidenceFile?: string; evidencePattern?: string; measurement?: string; patternTemplate?: string }) => {
    const documentText = fs.readFileSync(path.join(root, claim.document), "utf8");
    if (claim.measurement) {
      const value = measuredDocumentationValues[claim.measurement];
      const displayValue = claim.measurement === "fullTestCount"
        ? value.toLocaleString("en-US")
        : claim.measurement.endsWith("Target") ? value.toFixed(2) : String(value);
      const pattern = claim.patternTemplate?.replace("{{value}}", displayValue);
      const documented = Number.isFinite(value) && Boolean(pattern) && new RegExp(pattern!, "m").test(documentText);
      return { id: claim.id, document: claim.document, measurement: claim.measurement, value, documented, evidenced: Number.isFinite(value), passed: documented && Number.isFinite(value) };
    }
    const evidenceText = fs.readFileSync(path.join(root, claim.evidenceFile!), "utf8");
    const documented = new RegExp(claim.pattern!, "m").test(documentText);
    const evidenced = new RegExp(claim.evidencePattern!, "m").test(evidenceText);
    return { id: claim.id, document: claim.document, evidenceFile: claim.evidenceFile, documented, evidenced, passed: documented && evidenced };
  });
  const documentationScore = Math.round(statements.filter((item: { passed: boolean }) => item.passed).length / statements.length * 100);
  const lintFileRate = lintMetrics?.cleanFileRate ?? 0;
  const coverageMetrics = (["domain", "application"] as const).flatMap(layer => {
    const reportPath = path.join(root, "coverage", layer, "coverage-summary.json");
    if (!fs.existsSync(reportPath)) return [];
    const total = JSON.parse(fs.readFileSync(reportPath, "utf8")).total;
    return (["lines", "branches"] as const).map(metric => ({ layer, metric, actual: total[metric].pct, target: coverageBaseline.targets[layer][metric] }));
  });
  const coverageAttainment = coverageMetrics.length === 4
    ? coverageMetrics.reduce((sum, metric) => sum + Math.min(metric.actual / metric.target * 100, 100), 0) / 4
    : 0;
  const cleanCodeScore = Math.round(lintFileRate * 0.4 + structuralScore * 0.3 + coverageAttainment * 0.3);
  const weightedTotal = Math.round(architectureScore * 0.4 + cleanCodeScore * 0.3 + verificationScore * 0.2 + documentationScore * 0.1);

  const report = {
    rubricVersion: RUBRIC_VERSION,
    measuredAt: new Date().toISOString(),
    scores: { architectureBoundaryCompliance: architectureScore, cleanCode: cleanCodeScore, verification: verificationScore, documentationConsistency: documentationScore },
    weightedTotal,
    verification: {
      source: ciResults ? "CI workflow outcomes" : "local command execution",
      checks: checkResults,
      passed: passedChecks,
      blocked: checkResults.filter(result => result.status === "blocked").length,
      failed: checkResults.filter(result => result.status === "failed").length,
      architectureFindings: architectureErrors,
      sourceFiles: sourceFiles.length,
      applicationFiles: applicationFiles.length,
      filesOver250Lines: largeFiles,
      functionsOver120Lines: longFunctions,
      lint: lintMetrics,
      structural: { score: structuralScore, filesOver250Lines: largeFiles, functionsOver120Lines: longFunctions },
      coverage: coverageMetrics,
      cleanCodeComponents: { lintFileRate, structuralScore, coverageAttainment },
      documentationAssertions: statements,
    },
    formulas: {
      architectureBoundaryCompliance: "max(0, 100 - 10 × AST boundary/cycle findings)",
      cleanCode: "40% lint clean-file rate + 30% structural score + 30% coverage attainment against frozen per-layer baseline",
      verification: "100 × passed checks / all configured checks; blocked and failed are not passed",
      documentationConsistency: "Measured assertions in the versioned documentation claim manifest; each claim is checked against source, test, or workflow evidence",
      weightedTotal: "40% architecture + 30% Clean Code + 20% verification + 10% documentation",
    },
  };
  const reportDirectory = path.join(root, ".audit", "quality");
  fs.mkdirSync(reportDirectory, { recursive: true });
  fs.writeFileSync(path.join(reportDirectory, "latest.json"), `${JSON.stringify(report, null, 2)}\n`);
  console.log(JSON.stringify(report, null, 2));
}

main();
