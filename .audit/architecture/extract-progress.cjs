const fs = require('fs');
const ts = require('typescript');
let source = fs.readFileSync('src/state/useUserProgress.ts', 'utf8').replace(/\r\n/g, '\n');
const ast = ts.createSourceFile('progress.ts', source, ts.ScriptTarget.Latest, true);
const edits = [];
function visit(node) {
  if (ts.isCallExpression(node) && node.expression.getText(ast) === 'useCallback') {
    edits.push([node.getStart(ast), node.end, node.arguments[0].getText(ast)]);
    return;
  }
  ts.forEachChild(node, visit);
}
visit(ast);
for (const [start, end, replacement] of edits.sort((a,b) => b[0]-a[0])) source = source.slice(0,start)+replacement+source.slice(end);
let body = source.slice(source.indexOf('export function useUserProgress() {') + 'export function useUserProgress() {'.length);
const initStart = body.indexOf('  // Hydrate on mount');
const updateStart = body.indexOf('  const updateAndPersist');
const initialization = body.slice(initStart, updateStart);
const hydrateBody = initialization.slice(initialization.indexOf('      const loaded'), initialization.indexOf('    }\n    init();'));
body = body.slice(0,initStart) + '  async function hydrate() {\n'+hydrateBody+'  }\n\n'+body.slice(updateStart);
body = body.replace(/  const \[(\w+), (\w+)\] = useState(?:<([^;]+?)>)?\(([^;]+)\);/g, (_, name, setter, type, initial) => {
  return `  let ${name}${type ? ': '+type : ''} = ${initial};\n  function ${setter}(value: ${type || (initial === 'false' ? 'boolean' : 'UserData')} | ((previous: ${type || (initial === 'false' ? 'boolean' : 'UserData')}) => ${type || (initial === 'false' ? 'boolean' : 'UserData')})) {\n    ${name} = typeof value === 'function' ? value(${name}) : value;\n    ${name === 'userData' ? 'collectBadges();' : ''}\n    emit();\n  }`;
});
body = body.replace(/useRef(?:<([^;]+?)>)?\(([^;]+)\)/g, (_,type,initial) => `({ current: ${initial} }${type ? ' as { current: '+type+' }' : ''})`);
body = body.replaceAll('auth.currentUser', 'deps.account.current()').replaceAll('Date.now()', 'deps.clock.wallNow()');
body = body.replace(/rolloverToToday\((loaded)\)/g, 'rolloverToToday($1, deps.clock.nowDate())');
body = body.replace('applyPracticeAnswer(prev, question, picked, xpReward, sessionMode)', 'applyPracticeAnswer(prev, question, picked, xpReward, sessionMode, deps.clock.now(), deps.clock.todayISO(), deps.random.next)');
body = body.replace('bringForward(existing)', 'bringForward(existing, deps.clock.now())');
const returnIndex = body.lastIndexOf('  return {');
const result = body.slice(returnIndex).replace('  return {', '  function buildSnapshot() { return {').replace(/\n}\s*$/, '\n}\n');
body = body.slice(0,returnIndex);
let helper = source.slice(source.indexOf('function checkServerDateAnomaly'),source.indexOf('export function useUserProgress'));
helper = helper.replaceAll('auth.currentUser','deps.account.current()');
const header = `import { ActiveSessionState, UserData, ProductionAttempt } from "../domain/models/user";
import { LevelCode, MeaningMatchQuestion } from "../domain/models/content";
import { Locale } from "../domain/models/locale";
import { DEFAULT_USER_DATA } from "../domain/user/normalization";
import { rolloverToToday } from "../domain/gamification/dailyRollover";
import { bringForward, getDueReviewItems } from "../domain/review/spacedRepetition";
import { applyPracticeAnswer, PracticeSessionMode } from "../domain/practice/answer";
import { deriveStatus, isLeech } from "../domain/learning/mastery";
import { calculateGardenProgress } from "../domain/gamification/xp";
import { inferQuality, AnswerQualityMeta } from "../domain/review/qualitySignal";
import { daysBetween, detectClockAnomaly } from "../domain/sync/clockAnomaly";
import { ApplicationDependencies } from "./ports";
import { QuestionCatalogue } from "./catalogue";

export function createProgressController(deps: ApplicationDependencies, catalogue: QuestionCatalogue) {
  const loadUserData = deps.local.load;
  const saveUserData = deps.local.save;
  const track = deps.telemetry.track;
  const syncUserData = deps.remote.saveProfile;
  const syncUserProgress = deps.remote.saveProgress;
  const syncLearningItemProgress = deps.remote.saveLearningItem;
  const scheduleDailyReminder = deps.notifications.scheduleDailyReminder;
  const cancelDailyReminder = deps.notifications.cancelDailyReminder;
  const detectUnitJustCompleted = catalogue.detectUnitJustCompleted;
  async function fetchUserData(uid: string) {
    const result = await deps.remote.fetch(uid);
    return result.status === "found" ? result.data : null;
  }
  const listeners = new Set<() => void>();
  function emit() { snapshot = buildSnapshot(); listeners.forEach(listener => listener()); }
  function collectBadges() {
    if (isHydrated) {
      const newlyUnlocked = userData.unlockedBadges.filter(id => !knownBadgesRef.current.includes(id));
      if (newlyUnlocked.length) badgeUnlockQueue = [...badgeUnlockQueue, ...newlyUnlocked];
    }
    knownBadgesRef.current = userData.unlockedBadges;
  }
`;
const footer = `
  let snapshot = buildSnapshot();
  return {
    hydrate,
    getSnapshot: () => snapshot,
    subscribe(listener: () => void) { listeners.add(listener); return () => { listeners.delete(listener); }; },
  };
}
export type ProgressController = ReturnType<typeof createProgressController>;
`;
fs.writeFileSync('src/application/progressController.ts',header+helper+body+result+footer);
