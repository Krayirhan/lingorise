let passedCount = 0, failedCount = 0;
export const failures: string[] = [];
export function assert(condition: boolean, name: string) {
  if (condition) { passedCount++; console.log('  ✅ PASS: '+name); }
  else { failedCount++; failures.push(name); console.error('  ❌ FAIL: '+name); }
}
export function results() { return { passedCount, failedCount }; }
