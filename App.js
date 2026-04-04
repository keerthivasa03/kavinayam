import React from "react";
import { ActivityIndicator, View } from "react-native";
import { useFonts } from "expo-font";
import {
  Ionicons,
  Feather,
  MaterialIcons,
  SimpleLineIcons,
} from "@expo/vector-icons";

import Navigation from "./apps/Navigation/navigation";

export default function App() {
  const [fontsLoaded] = useFonts({
    ...Ionicons.font,
    ...Feather.font,
    ...MaterialIcons.font,
    ...SimpleLineIcons.font,
  });

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return <Navigation />;
}