import { useEffect, useSyncExternalStore } from "react";
import { useApplication } from "../context/ApplicationContext";
export function useUserProgress(autoHydrate = true) {
  const { progress } = useApplication();
  const snapshot = useSyncExternalStore(progress.subscribe, progress.getSnapshot, progress.getSnapshot);
  useEffect(() => { if (autoHydrate) void progress.hydrate(); }, [progress, autoHydrate]);
  return snapshot;
}
