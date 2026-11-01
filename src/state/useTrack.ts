import { useApplication } from "../context/ApplicationContext";

/** The app's telemetry recorder, for components that report UI events. */
export function useTrack() {
  return useApplication().track;
}
