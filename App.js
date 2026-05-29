import { SafeAreaProvider } from "react-native-safe-area-context";
import Navigation from "./apps/Navigation/navigation";

export default function App() {
  return (
    <SafeAreaProvider>
      <Navigation />
    </SafeAreaProvider>
  );
}