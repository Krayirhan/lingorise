import "./groups/content";
import "./groups/learning";
import "./groups/gamification";
import "./groups/sync";
import "./groups/presentation";
import { results } from "./support/assertions";
const { passedCount, failedCount } = results();
console.log('🏁 TEST SUMMARY: '+passedCount+' PASSED, '+failedCount+' FAILED');
process.exitCode = failedCount > 0 ? 1 : 0;
