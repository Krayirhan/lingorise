import fs from "node:fs";
import path from "node:path";
import { allQuestions } from "../src/content/questions";
import { buildEditorialReviewQueue, summarizeEditorialReviewQueue, EDITORIAL_RUBRIC_VERSION } from "../src/content/editorialReviewWorkflow";

const queue = buildEditorialReviewQueue(allQuestions);
const output = {
  generatedAt: new Date().toISOString(),
  rubricVersion: EDITORIAL_RUBRIC_VERSION,
  humanApprovalRequired: true,
  note: "AI ön incelemesi insan onayının yerine geçmez; approved kayıtlar doğrulanabilir insan kanıtı olmadan yayınlanamaz.",
  summary: summarizeEditorialReviewQueue(queue),
  items: queue,
};
const outputPath = path.resolve("docs/editorial-review-queue.json");
fs.writeFileSync(outputPath, JSON.stringify(output, null, 2) + "\n", "utf8");
console.log(JSON.stringify(output.summary, null, 2));
