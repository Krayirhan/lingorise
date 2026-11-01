import { createContext, useContext } from "react";
import type { Application } from "../application/createApplication";

export const ApplicationContext = createContext<Application | null>(null);
export function useApplication(): Application {
  const application = useContext(ApplicationContext);
  if (!application) throw new Error("Application provider is missing.");
  return application;
}
