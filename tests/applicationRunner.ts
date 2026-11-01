import { runApplicationTests } from "./application/applicationTests";
import { assert, results } from "./support/assertions";
import { runLocalWritingTests } from "./application/localWritingTests";
import { runProfileCoordinatorTests } from "./application/profileCoordinatorTests";
import { runProfileStorageTests } from "./application/profileStorageTests";

async function main() {
  await runApplicationTests();
  await runLocalWritingTests();
  await runProfileCoordinatorTests();
  await runProfileStorageTests();
  const loaded = Object.keys(require.cache);
  assert(!loaded.some(file => /[\\/]src[\\/]infrastructure[\\/]|[\\/]node_modules[\\/](firebase|@firebase|@react-native-async-storage)[\\/]/.test(file)), "Domain/application tests execute without loading Firebase or AsyncStorage SDKs");
  const { passedCount, failedCount } = results();
  console.log(`Application tests: ${passedCount} passed, ${failedCount} failed`);
  process.exitCode = failedCount ? 1 : 0;
}
main().catch(error => { console.error(error); process.exitCode = 1; });
