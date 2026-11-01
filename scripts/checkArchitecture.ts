import * as fs from "node:fs";
import * as path from "node:path";
import * as ts from "typescript";

type Layer =
  | "composition"
  | "presentation"
  | "application"
  | "domain"
  | "infrastructure"
  | "content-data"
  | "localization"
  | "theme"
  | "utils"
  | "compat-types"
  | "asset"
  | "external"
  | "unknown";

const DIRECTORY_LAYERS: Record<string, Layer> = {
  app: "presentation",
  application: "application",
  components: "presentation",
  content: "content-data",
  context: "presentation",
  domain: "domain",
  features: "presentation",
  i18n: "localization",
  infrastructure: "infrastructure",
  screens: "presentation",
  state: "presentation",
  theme: "theme",
  types: "compat-types",
  utils: "utils",
};

const ALLOWED_INTERNAL_DEPENDENCIES: Record<Layer, ReadonlySet<Layer>> = {
  composition: new Set([
    "composition", "presentation", "application", "domain", "infrastructure",
    "content-data", "localization", "theme", "utils", "compat-types", "asset",
  ]),
  presentation: new Set([
    "presentation", "application", "domain", "content-data", "localization", "theme", "utils", "asset",
  ]),
  application: new Set(["application", "domain"]),
  domain: new Set(["domain"]),
  infrastructure: new Set(["infrastructure", "application", "domain", "content-data", "utils"]),
  "content-data": new Set(["content-data", "domain"]),
  localization: new Set(["localization", "domain"]),
  theme: new Set(["theme"]),
  utils: new Set(["utils", "domain"]),
  "compat-types": new Set(["domain"]),
  asset: new Set([]),
  external: new Set([]),
  unknown: new Set([]),
};

function normalize(file: string): string {
  return file.replace(/\\/g, "/").replace(/^\.\//, "");
}

export function layer(file: string): Layer {
  const normalized = normalize(file);
  if (normalized === "src/app/AppBootstrap.tsx") return "composition";
  if (!normalized.startsWith("src/")) {
    return /\.(png|jpg|jpeg|svg|ttf|mp3|json)$/.test(normalized) ? "asset" : "unknown";
  }
  const directory = normalized.split("/")[1];
  return DIRECTORY_LAYERS[directory] || "unknown";
}

function isAllowedExternal(sourceLayer: Layer, specifier: string): boolean {
  if (sourceLayer === "composition") return true;

  if (sourceLayer === "infrastructure") {
    return /^(?:@react-native-async-storage\/|@react-native-firebase\/|firebase(?:\/|$)|expo(?:\/|-|$)|react-native(?:\/|$))/.test(specifier);
  }

  if (sourceLayer === "presentation") {
    return /^(?:react(?:\/|$)|react-native(?:\/|$)|react-native-safe-area-context(?:\/|$)|@expo\/vector-icons(?:\/|$))/.test(specifier);
  }

  return false;
}

export function boundaryViolation(source: string, target: string | null, specifier: string): string | null {
  const sourceLayer = layer(source);
  if (sourceLayer === "unknown") return "Source file is not assigned to an explicit architecture layer";

  if (!target && specifier.startsWith(".")) return "Relative project dependency could not be resolved";

  const targetLayer = target ? layer(target) : "external";
  if (targetLayer === "unknown") return "Target file is outside the declared source/asset roots";

  if (targetLayer === "external") {
    return isAllowedExternal(sourceLayer, specifier)
      ? null
      : `${sourceLayer} may not depend on external package '${specifier}'`;
  }

  if (!ALLOWED_INTERNAL_DEPENDENCIES[sourceLayer].has(targetLayer)) {
    return `${sourceLayer} may not depend on ${targetLayer}`;
  }

  if (sourceLayer === "presentation" && targetLayer === "content-data" && normalize(target ?? "") !== "src/content/levels.ts") {
    return "Presentation may read only the level display metadata from bundled content; other catalogue access belongs behind application";
  }

  if (sourceLayer === "presentation" && /^(?:firebase(?:\/|$)|@react-native-firebase\/|@react-native-async-storage\/|expo-(?:file-system|sharing|notifications|speech)(?:\/|$))/.test(specifier)) {
    return "Persistence, account and data SDKs belong in infrastructure";
  }

  return null;
}

export function dependencySpecifiers(source: ts.SourceFile): string[] {
  const specifiers: string[] = [];
  function visit(node: ts.Node) {
    if ((ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) && node.moduleSpecifier && ts.isStringLiteral(node.moduleSpecifier)) {
      specifiers.push(node.moduleSpecifier.text);
    }
    if (ts.isImportTypeNode(node) && ts.isLiteralTypeNode(node.argument) && ts.isStringLiteral(node.argument.literal)) {
      specifiers.push(node.argument.literal.text);
    }
    if (ts.isCallExpression(node) && (node.expression.kind === ts.SyntaxKind.ImportKeyword || (ts.isIdentifier(node.expression) && node.expression.text === "require"))) {
      const argument = node.arguments[0];
      if (argument && ts.isStringLiteralLike(argument)) specifiers.push(argument.text);
    }
    ts.forEachChild(node, visit);
  }
  visit(source);
  return [...new Set(specifiers)];
}

export function importCycles(graph: Map<string, string[]>): string[][] {
  const visited = new Set<string>();
  const active = new Set<string>();
  const stack: string[] = [];
  const cycles: string[][] = [];
  function visit(file: string) {
    if (active.has(file)) { cycles.push([...stack.slice(stack.indexOf(file)), file]); return; }
    if (visited.has(file)) return;
    visited.add(file); active.add(file); stack.push(file);
    for (const target of graph.get(file) || []) visit(target);
    stack.pop(); active.delete(file);
  }
  for (const file of graph.keys()) visit(file);
  return cycles;
}

export function checkArchitecture(root = process.cwd()): string[] {
  const sourceRoot = path.join(root, "src");
  const files: string[] = [];
  function walk(directory: string) {
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      const file = path.join(directory, entry.name);
      if (entry.isDirectory()) walk(file);
      else if (/\.tsx?$/.test(file)) files.push(file);
    }
  }
  walk(sourceRoot);
  const configPath = ts.findConfigFile(root, ts.sys.fileExists, "tsconfig.json");
  if (!configPath) throw new Error("tsconfig.json missing");
  const config = ts.readConfigFile(configPath, ts.sys.readFile);
  if (config.error) throw new Error(ts.flattenDiagnosticMessageText(config.error.messageText, "\n"));
  const options = ts.parseJsonConfigFileContent(config.config, ts.sys, root).options;
  const relative = (file: string) => normalize(path.relative(root, file));
  const graph = new Map<string, string[]>();
  const errors: string[] = [];

  for (const file of files) {
    const name = relative(file);
    const source = ts.createSourceFile(file, fs.readFileSync(file, "utf8"), ts.ScriptTarget.Latest, true);
    const targets: string[] = [];
    for (const specifier of dependencySpecifiers(source)) {
      const resolved = ts.resolveModuleName(specifier, file, options, ts.sys).resolvedModule;
      const isAsset = specifier.startsWith(".") && /\.(png|jpg|jpeg|svg|ttf|mp3|json)$/.test(specifier);
      const target = resolved && !resolved.isExternalLibraryImport
        ? relative(resolved.resolvedFileName)
        : isAsset
          ? normalize(path.relative(root, path.resolve(path.dirname(file), specifier)))
          : null;
      const violation = boundaryViolation(name, target, specifier);
      if (violation) errors.push(`${name} → ${target || specifier}: ${violation}`);
      if (target?.startsWith("src/")) targets.push(target);
    }
    graph.set(name, targets);
  }

  for (const cycle of importCycles(graph)) errors.push(`Import cycle: ${cycle.join(" → ")}`);
  return errors;
}

if (require.main === module) {
  const errors = checkArchitecture();
  if (errors.length) { errors.forEach(error => console.error(error)); process.exitCode = 1; }
  else console.log("Architecture boundaries passed; no import cycles or exceptions.");
}
