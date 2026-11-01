import fs from "node:fs";
import path from "node:path";
import ts from "typescript";

const root = process.cwd();
const sourceRoot = path.join(root, "src");
const manifestPath = path.join(root, "scripts", "quality", "long-function-review.json");
const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));

function collectFiles(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    const file = path.join(directory, entry.name);
    if (entry.isDirectory()) return collectFiles(file);
    return /\.tsx?$/.test(file) ? [file] : [];
  });
}

function collectLongFunctions(file) {
  const text = fs.readFileSync(file, "utf8");
  const source = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true, file.endsWith(".tsx") ? ts.ScriptKind.TSX : ts.ScriptKind.TS);
  const functions = [];
  function visit(node) {
    if (ts.isFunctionDeclaration(node) || ts.isMethodDeclaration(node) || ts.isFunctionExpression(node) || ts.isArrowFunction(node)) {
      const first = source.getLineAndCharacterOfPosition(node.getStart(source)).line;
      const last = source.getLineAndCharacterOfPosition(node.end).line;
      if (last - first + 1 > 120) {
        functions.push({
          file: path.relative(root, file).replaceAll("\\", "/"),
          name: node.name?.getText(source) || "<callback>",
          lines: last - first + 1,
        });
      }
    }
    ts.forEachChild(node, visit);
  }
  visit(source);
  return functions;
}

const actual = collectFiles(sourceRoot).flatMap(collectLongFunctions);
const key = item => `${item.file}::${item.name}`;
const entries = new Map(manifest.entries.map(entry => [key(entry), entry]));
const missing = actual.filter(item => {
  const entry = entries.get(key(item));
  return !entry || entry.rationale.trim().length < 30 || entry.followUp.trim().length < 30;
});
const stale = manifest.entries.filter(entry => !actual.some(item => key(item) === key(entry)));
const report = { manifestVersion: manifest.version, actualCount: actual.length, reviewedCount: actual.length - missing.length, missing, stale };

console.log(JSON.stringify(report, null, 2));
if (missing.length || stale.length) process.exitCode = 1;
