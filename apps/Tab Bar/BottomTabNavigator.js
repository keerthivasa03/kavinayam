import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Image } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import HomeScreen from "../Home/HomeScreen";
import KavithaiList from "../Kavithai List/KavithaiList";
import RecordingsList from "../RecordingsList/RecordingsList";
import Logout from "../Logout/Logout";

const Tab = createBottomTabNavigator();

const BottomTabNavigator = () => {
  const insets = useSafeAreaInsets();
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: "#8B0000",
        tabBarInactiveTintColor: "white",
        tabBarStyle: {
          backgroundColor: "#000",
          borderTopWidth: 0,
          height: 60 + insets.bottom,
          paddingBottom: insets.bottom,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          marginBottom: 5,
        },

        // 🔥 PNG ICONS HERE
        tabBarIcon: ({ focused }) => {
          let icon;

          if (route.name === "Home") {
            icon = require("../../assets/icon image/home.png");
          } else if (route.name === "Kavithai List") {
            icon = require("../../assets/icon image/playlist.png");
          } else if (route.name === "Recordings List") {
            icon = require("../../assets/icon image/music.png");
          } else if (route.name === "Logout") {
            icon = require("../../assets/icon image/logout.png");
          }

          return (
            <Image
              source={icon}
              style={{
                width: 24,
                height: 24,
                tintColor: focused ? "#8B0000" : "white",
              }}
              resizeMode="contain"
            />
          );
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Kavithai List" component={KavithaiList} />
      <Tab.Screen name="Recordings List" component={RecordingsList} />
      <Tab.Screen name="Logout" component={Logout} />
    </Tab.Navigator>
  );
};

export default BottomTabNavigator;