export interface ConsecutiveFailureReporterOptions {
  eventName: "local_save_failed" | "cloud_sync_failed";
  notice: string;
  track: (eventName: "local_save_failed" | "cloud_sync_failed", parameters: { consecutiveFailures: number }) => void;
  reportNotice: (message: string) => void;
  threshold?: number;
}

export function createConsecutiveFailureReporter({ eventName, notice, track, reportNotice, threshold = 2 }: ConsecutiveFailureReporterOptions) {
  let consecutiveFailures = 0;
  let noticeReported = false;

  return (succeeded: boolean) => {
    if (succeeded) {
      consecutiveFailures = 0;
      noticeReported = false;
      return;
    }

    consecutiveFailures += 1;
    track(eventName, { consecutiveFailures });
    if (consecutiveFailures >= threshold && !noticeReported) {
      noticeReported = true;
      reportNotice(notice);
    }
  };
}
