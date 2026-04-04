import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import {
  Feather,
  MaterialIcons,
  MaterialCommunityIcons,
  SimpleLineIcons
} from "@expo/vector-icons";

import HomeScreen from "../Home/HomeScreen";
import KavithaiList from "../Kavithai List/KavithaiList";
import RecordingsList from "../RecordingsList/RecordingsList";
import Logout from "../Logout/Logout";

const Tab = createBottomTabNavigator();

const BottomTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,

        // 🎨 Colors
        tabBarActiveTintColor: "#8B0000",
        tabBarInactiveTintColor: "white",

        // 🎨 Tab bar styling
        tabBarStyle: {
          backgroundColor: "#000",
          borderTopWidth: 0,
          height: 60,
          paddingBottom: 5,
        },

        tabBarLabelStyle: {
          fontSize: 12,
          marginBottom: 5,
        },

        // 🔥 ICON LOGIC (FIXED)
        tabBarIcon: ({ color, size }) => {
          switch (route.name) {
            case "Home":
              return <Feather name="home" size={size} color={color} />;

            case "Kavithai List":
              return (
                <SimpleLineIcons
                  name="playlist"
                  size={size}
                  color={color}
                />
              );

            case "Recordings List":
              return (
                <MaterialIcons
                  name="audiotrack" // ✅ FIXED ICON
                  size={size}
                  color={color}
                />
              );

            case "Logout":
              return (
                <MaterialCommunityIcons
                  name="logout" // ✅ FIXED ICON
                  size={size}
                  color={color}
                />
              );

            default:
              return null;
          }
        },
      })}
    >
      {/* 🏠 Home */}
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{ tabBarLabel: "Home" }}
      />

      {/* 📜 Kavithai */}
      <Tab.Screen
        name="Kavithai List"
        component={KavithaiList}
        options={{ tabBarLabel: "Kavithai" }}
      />

      {/* 🎙 Recordings */}
      <Tab.Screen
        name="Recordings List"
        component={RecordingsList}
        options={{ tabBarLabel: "Recordings" }}
      />

      {/* 🚪 Logout */}
      <Tab.Screen
        name="Logout"
        component={Logout}
        options={{ tabBarLabel: "Logout" }}
      />
    </Tab.Navigator>
  );
};

export default BottomTabNavigator;