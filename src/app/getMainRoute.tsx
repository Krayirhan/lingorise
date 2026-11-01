import { ReactElement } from "react";
import { HomeTab } from "../features/home/home.types";
import { MainRouteDependencies } from "./mainRoute.types";
import { HomeRoute } from "./routes/HomeRoute";
import { PracticeHubRoute } from "./routes/PracticeHubRoute";
import { ProfileRoute } from "./routes/ProfileRoute";
import { ProgressRoute } from "./routes/ProgressRoute";

export interface MainRoute {
  activeTab: HomeTab;
  content: ReactElement;
}

export function getMainRoute(dependencies: MainRouteDependencies): MainRoute {
  switch (dependencies.session.screen) {
    case "progress":
      return { activeTab: "progress", content: <ProgressRoute {...dependencies} /> };
    case "practiceHome":
      return { activeTab: "practice", content: <PracticeHubRoute {...dependencies} /> };
    case "profile":
      return { activeTab: "profile", content: <ProfileRoute {...dependencies} /> };
    default:
      return { activeTab: "garden", content: <HomeRoute {...dependencies} /> };
  }
}
