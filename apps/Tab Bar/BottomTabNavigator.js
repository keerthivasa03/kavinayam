import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import {
  Ionicons,
  Feather,
  MaterialCommunityIcons,
  MaterialIcons,
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
        tabBarActiveTintColor: "#8B0000", // dark red
        tabBarInactiveTintColor: "white",
        tabBarStyle: {
          backgroundColor: "#000", // black
          borderTopWidth: 0,
          height: 60,
          paddingBottom: 5,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          marginBottom: 5,
        },
        tabBarIcon: ({ color, size }) => {
          if (route.name === "Home") {
            return <Feather name="home" size={size} color={color} />;
          } else if (route.name === "Kavithai List") {
            return (
              <SimpleLineIcons name="playlist" size={size} color={color} />
            );
          } else if (route.name === "Recordings List") {
            return (
              <MaterialIcons name="audio-file" size={size} color={color} />
            );
          } else if (route.name === "Logout") {
            return (
              <MaterialIcons name="logout" size={size} color={color} />
            );
          }
        },
      })}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{ tabBarLabel: "Home" }}
      />
      <Tab.Screen
        name="Kavithai List"
        component={KavithaiList}
        options={{ tabBarLabel: "Kavithai" }}
      />
      <Tab.Screen
        name="Recordings List"
        component={RecordingsList}
        options={{ tabBarLabel: "Recordings" }}
      />
      <Tab.Screen
        name="Logout"
        component={Logout}
        options={{ tabBarLabel: "Logout" }}
      />
    </Tab.Navigator>
  );
};

export default BottomTabNavigator;
