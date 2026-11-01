import { ConsecutiveFailureReporterOptions, createConsecutiveFailureReporter } from "./consecutiveFailureReporter";

/**
 * The learner-visible save and cloud-sync failure notices. Each one is only
 * raised after more than one failure in a row: a single failed write is often
 * a transient AsyncStorage or network hiccup and should not alarm anyone.
 */
export function createProgressNotices(track: ConsecutiveFailureReporterOptions["track"], onChange: () => void) {
  let saveFailureNotice: string | null = null;
  let cloudSyncFailureNotice: string | null = null;

  const setSaveFailureNotice = (value: string | null) => { saveFailureNotice = value; onChange(); };
  const setCloudSyncFailureNotice = (value: string | null) => { cloudSyncFailureNotice = value; onChange(); };

  const noteSaveOutcome = createConsecutiveFailureReporter({
    eventName: "local_save_failed",
    notice: "İlerlemen kaydedilemiyor. Lütfen cihazında yeterli depolama alanı olduğundan emin ol.",
    track,
    reportNotice: setSaveFailureNotice,
  });

  // Cloud-sync failures were previously console-only (REL-QA-004 /
  // GLOBAL-QA-004): the learner had no way to know their progress hadn't
  // reached the cloud.
  const noteCloudSyncOutcome = createConsecutiveFailureReporter({
    eventName: "cloud_sync_failed",
    notice: "İlerlemen buluta yüklenemiyor. İnternet bağlantını kontrol et; yerel ilerlemen güvende.",
    track,
    reportNotice: setCloudSyncFailureNotice,
  });

  return {
    get saveFailureNotice() { return saveFailureNotice; },
    get cloudSyncFailureNotice() { return cloudSyncFailureNotice; },
    setSaveFailureNotice,
    noteSaveOutcome,
    noteCloudSyncOutcome,
    clearSaveFailureNotice: () => setSaveFailureNotice(null),
    clearCloudSyncFailureNotice: () => setCloudSyncFailureNotice(null),
  };
}
