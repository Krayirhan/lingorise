import fs from "node:fs";
import path from "node:path";
import { allQuestions } from "../src/content/questions/index";
import { LevelCode, MeaningMatchQuestion } from "../src/types/content";

const PROJECT_ID = "lingorise-65cb1";
const CONTENT_VERSION = "v1";
const UNIT_SIZE = 50;

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
  const units: Unit[] = [];
  const items: MeaningMatchQuestion[] = [];
  const levels: LevelCode[] = ["A1", "A2", "B1", "B2", "C1", "C2"];

  for (const level of levels) {
    const levelItems = allQuestions.filter((question) => question.level === level);
    for (let start = 0, unitOrder = 1; start < levelItems.length; start += UNIT_SIZE, unitOrder += 1) {
      const unitItems = levelItems.slice(start, start + UNIT_SIZE);
      const unitId = `${level.toLowerCase()}-u${String(unitOrder).padStart(2, "0")}`;
      units.push({ id: unitId, contentVersion: CONTENT_VERSION, level, order: unitOrder, title: `${level} Bölüm ${unitOrder}`, itemCount: unitItems.length, status: "published" });
      unitItems.forEach((question, index) => items.push({
        ...question,
        contentVersion: CONTENT_VERSION,
        unitId,
        order: start + index + 1,
        status: "published",
        options: question.options ?? [question.meaning, ...question.wrongOptions],
      }));
    }
  }
  return { units, items };
}

function getFirebaseCliToken(): string {
  const configPath = path.join(process.env.USERPROFILE || "", ".config", "configstore", "firebase-tools.json");
  const config = JSON.parse(fs.readFileSync(configPath, "utf8"));
  const token = config.tokens?.access_token;
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
  const token = getFirebaseCliToken();
  const root = `projects/${PROJECT_ID}/databases/(default)/documents`;
  const { units, items } = buildPublishedCatalogue();
  const publishedAt = new Date().toISOString();
  const writes = [
    { update: document(`${root}/contentMeta/current`, { activeVersion: CONTENT_VERSION, publishedAt, schemaVersion: 1 }) },
    { update: document(`${root}/contentVersions/${CONTENT_VERSION}`, { id: CONTENT_VERSION, status: "published", publishedAt, itemCount: items.length, unitCount: units.length }) },
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
