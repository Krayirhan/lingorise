import fs from "node:fs";
import path from "node:path";
import { allQuestions, CONTENT_VERSION } from "../src/content/questions/index";
import { auditEditorialQuestions } from "../src/content/editorialQuality";
import { createCatalogueIntegritySnapshot } from "../src/content/catalogueIntegrity";
import { LevelCode, MeaningMatchQuestion } from "../src/domain/models/content";

const PROJECT_ID = "lingorise-65cb1";

type FirestoreValue = { [key: string]: unknown };
type Unit = {
  id: string;
  contentVersion: string;
  level: LevelCode;
  order: number;
  title: string;
  itemCount: number;
  status: "published";
};

function toFirestoreValue(value: unknown): FirestoreValue {
  if (value === null || value === undefined) return { nullValue: null };
  if (typeof value === "boolean") return { booleanValue: value };
  if (typeof value === "number") return Number.isInteger(value) ? { integerValue: value } : { doubleValue: value };
  if (typeof value === "string") return { stringValue: value };
  if (Array.isArray(value)) return { arrayValue: { values: value.map(toFirestoreValue) } };
  return { mapValue: { fields: Object.fromEntries(Object.entries(value as Record<string, unknown>).map(([key, item]) => [key, toFirestoreValue(item)])) } };
}

function document(name: string, data: Record<string, unknown>) {
  return { name, fields: Object.fromEntries(Object.entries(data).map(([key, value]) => [key, toFirestoreValue(value)])) };
}

function buildPublishedCatalogue() {
  const unitMap = new Map<string, Unit>();
  const items: MeaningMatchQuestion[] = [];
  const levels: LevelCode[] = ["A1", "A2", "B1", "B2", "C1", "C2"];

  for (const level of levels) {
    // Draft and editorial-hold content stays in the local authoring bundle but
    // must never be copied into the learner-facing Firestore catalogue.
    const levelItems = allQuestions.filter((question) => question.level === level && question.status === "published" && question.editorialStatus === "approved" && Boolean(question.editorialReview?.reviewId && question.editorialReview.reviewerId && question.editorialReview.reviewedAt && question.editorialReview.rubricVersion && question.editorialReview.decision === "approved"));
    const byUnit = new Map<string, MeaningMatchQuestion[]>();
    levelItems.forEach((question) => {
      const unitId = question.unitId || `${level.toLowerCase()}-u01`;
      byUnit.set(unitId, [...(byUnit.get(unitId) || []), question]);
    });
    [...byUnit.entries()].forEach(([unitId, unitItems], unitIndex) => {
      unitMap.set(unitId, {
        id: unitId,
        contentVersion: CONTENT_VERSION,
        level,
        order: unitIndex + 1,
        title: `${level} · ${unitId.split(".").at(-1) || `Ünite ${unitIndex + 1}`}`,
        itemCount: unitItems.length,
        status: "published",
      });
      unitItems.forEach((question, index) => items.push({
        ...question,
        contentVersion: CONTENT_VERSION,
        unitId,
        order: question.order ?? index,
        status: "published",
        options: question.options ?? [question.meaning, ...question.wrongOptions],
      }));
    });
  }
  return { units: [...unitMap.values()], items };
}

async function getFirebaseCliToken(): Promise<string> {
  const configPath = path.join(process.env.USERPROFILE || "", ".config", "configstore", "firebase-tools.json");
  const config = JSON.parse(fs.readFileSync(configPath, "utf8"));
  // firebase-tools refreshes its OAuth access token for CLI requests, while
  // this script used to read a possibly-expired value straight from disk.
  // Reuse its authenticated refresh flow so a signed-in CLI can publish.
  // `require` keeps this maintenance script independent of firebase-tools'
  // internal TypeScript declarations.
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const firebaseAuth = require("firebase-tools/lib/auth") as {
    getAccessToken: (refreshToken?: string, authScopes?: string[]) => Promise<{ access_token?: string }>;
  };
  const refreshed = await firebaseAuth.getAccessToken(config.tokens?.refresh_token, []);
  const token = refreshed?.access_token;
  if (!token) throw new Error("Firebase CLI access token bulunamadı. Önce firebase login çalıştırın.");
  return token;
}

async function commitWrites(token: string, writes: unknown[]) {
  const root = `projects/${PROJECT_ID}/databases/(default)/documents`;
  for (let index = 0; index < writes.length; index += 450) {
    const response = await fetch(`https://firestore.googleapis.com/v1/${root}:commit`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ writes: writes.slice(index, index + 450) }),
    });
    if (!response.ok) throw new Error(`Firestore publish başarısız: ${response.status} ${await response.text()}`);
  }
}

async function main() {
  const token = await getFirebaseCliToken();
  const root = `projects/${PROJECT_ID}/databases/(default)/documents`;
  const { units, items } = buildPublishedCatalogue();
  const integrity = createCatalogueIntegritySnapshot(items);
  const c2Audit = auditEditorialQuestions(allQuestions.filter((question) => question.level === "C2"));
  if (!c2Audit.approved || c2Audit.errors.length > 0 || c2Audit.warnings.length > 0) {
    throw new Error("C2 Firestore publication is locked: " + c2Audit.errors.length + " audit errors, " + c2Audit.warnings.length + " editorial warnings.");
  }
  if (allQuestions.some((question) => question.level === "C2" && question.status === "published")) {
    throw new Error("C2 Firestore publication is locked until the complete C2 rewrite receives human approval.");
  }
  const publishedAt = new Date().toISOString();
  const writes = [
    { update: document(root + "/contentMeta/current", { activeVersion: CONTENT_VERSION, publishedAt, schemaVersion: 1, integrity }) },
    { update: document(root + "/contentVersions/" + CONTENT_VERSION, { id: CONTENT_VERSION, status: "published", publishedAt, itemCount: items.length, unitCount: units.length, integrity }) },
    ...units.map((unit) => ({ update: document(`${root}/units/${unit.id}`, { ...unit, publishedAt }) })),
    ...items.map((item) => ({ update: document(`${root}/items/${item.id}`, { ...item, publishedAt }) })),
  ];

  await commitWrites(token, writes);
  console.log(`Published ${CONTENT_VERSION}: ${units.length} units, ${items.length} items.`);
}

void main().catch((error) => {
  console.error(error);
  process.exit(1);
});
