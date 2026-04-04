import React, { useEffect } from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import * as Font from "expo-font";

import {
  Ionicons,
  Feather,
  MaterialIcons,
  SimpleLineIcons,
} from "@expo/vector-icons";

import HomeScreen from "../Home/HomeScreen";
import KavithaiList from "../Kavithai List/KavithaiList";
import RecordingsList from "../RecordingsList/RecordingsList";
import Logout from "../Logout/Logout";

const Tab = createBottomTabNavigator();

const BottomTabNavigator = () => {
  useEffect(() => {
    Font.loadAsync({
      ...Ionicons.font,
      ...Feather.font,
      ...MaterialIcons.font,
      ...SimpleLineIcons.font,
    });
  }, []);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: "#8B0000",
        tabBarInactiveTintColor: "white",
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
        tabBarIcon: ({ color, size }) => {
          if (route.name === "Home") {
            return <Feather name="home" size={size} color={color} />;
          } else if (route.name === "Kavithai List") {
            return <SimpleLineIcons name="playlist" size={size} color={color} />;
          } else if (route.name === "Recordings List") {
            return <MaterialIcons name="audio-file" size={size} color={color} />;
          } else if (route.name === "Logout") {
            return <MaterialIcons name="logout" size={size} color={color} />;
          }
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