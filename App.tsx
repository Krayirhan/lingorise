import { AppBootstrap } from "./src/app/AppBootstrap";
import { SafeAreaProvider } from "react-native-safe-area-context";

export default function App() {
  return (
    <SafeAreaProvider>
      <AppBootstrap />
    </SafeAreaProvider>
  );
}
