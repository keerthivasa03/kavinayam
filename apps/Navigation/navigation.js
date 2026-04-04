import React, { useState, useEffect } from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { NavigationContainer } from "@react-navigation/native";
import { ActivityIndicator, View } from "react-native";
import { supabase } from "../../lib/supabase";

// Screens
import LoginScreen from "../Login/LoginScreen.jsx";
import BottomTabNavigator from "../Tab Bar/BottomTabNavigator.js";
import KavithaiDetails from "../KavithaiDetails/KavithaiDetails.jsx";
import ThoniKaraoke from "../Karaoke Display/ThoniKaroki.jsx";
import VegamKaroki from "../Karaoke Display/VegamKaroki.jsx";
import Nayamkaraoke from "../Karaoke Display/Nayamkaraoke.jsx";
import KavithaiList from "../Kavithai List/KavithaiList.jsx";
import UhchayaripuKaraoke from "../Karaoke Display/UhchayaripuKaraoke.jsx";
import Allkaraoke from "../Karaoke Display/Allkaraoke.jsx";
import ResetPasswordScreen from "../Login/ResetPasswordScreen.js";
import ForgotPasswordScreen from "../Reset Password/ForgotPasswordScreen.js";

const Stack = createNativeStackNavigator();

const linking = {
  prefixes: ["kavinayam://"],
  config: {
    screens: {
      ResetPassword: "reset-password",
    },
  },
};

export default function AppNavigator() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then((res) => {
      const session = res?.data?.session;
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      if (data?.subscription) data.subscription.unsubscribe();
    };
  }, []);

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#111",
        }}
      >
        <ActivityIndicator size="large" color="white" />
      </View>
    );
  }

  return (
    <NavigationContainer linking={linking}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          <>
            <Stack.Screen name="HomeTabs" component={BottomTabNavigator} />
            <Stack.Screen name="KavithaiDetails" component={KavithaiDetails} />
            <Stack.Screen name="KavithaiList" component={KavithaiList} />
            <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />

            <Stack.Screen name="ThoniKaraoke" component={ThoniKaraoke} />
            <Stack.Screen name="VegamKaroki" component={VegamKaroki} />
            <Stack.Screen name="Allkaraoke" component={Allkaraoke} />
            <Stack.Screen name="UhchayaripuKaraoke" component={UhchayaripuKaraoke} />
            <Stack.Screen name="Nayamkaraoke" component={Nayamkaraoke} />
          </>
        ) : (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
            <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}