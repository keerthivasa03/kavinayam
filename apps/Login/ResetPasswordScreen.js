import React, { useEffect, useState } from "react";
import { View, Text, TextInput, Button, Alert } from "react-native";
import * as Linking from "expo-linking";
import { supabase } from "../../lib/supabase";
import tw from "tailwind-react-native-classnames";

export default function ResetPasswordScreen({ navigation }) {
  const [newPassword, setNewPassword] = useState("");
  const [tokenHandled, setTokenHandled] = useState(false);

  useEffect(() => {
    const handleURL = async (url) => {
      const { queryParams } = Linking.parse(url);
      const access_token = queryParams?.access_token;
      const refresh_token = queryParams?.refresh_token;

      if (access_token && refresh_token) {
        const { error } = await supabase.auth.setSession({
          access_token,
          refresh_token,
        });

        if (error) {
          Alert.alert("Error", error.message);
        } else {
          setTokenHandled(true);
        }
      }
    };

    Linking.getInitialURL().then((url) => {
      if (url) handleURL(url);
    });

    const subscription = Linking.addEventListener("url", (event) => {
      handleURL(event.url);
    });

    return () => subscription.remove();
  }, []);

  const handlePasswordUpdate = async () => {
    const { error } = await supabase.auth.updateUser({ password: newPassword });

    if (error) {
      Alert.alert("Error", error.message);
    } else {
      Alert.alert("Success", "Password updated successfully.");
      navigation.navigate("Login");
    }
  };

  if (!tokenHandled) {
    return (
      <View style={tw`flex-1 justify-center items-center bg-white`}>
        <Text style={tw`text-lg`}>Verifying token...</Text>
      </View>
    );
  }

  return (
    <View style={tw`flex-1 justify-center items-center bg-white p-4`}>
      <Text style={tw`text-xl mb-4`}>Set New Password</Text>
      <TextInput
        style={tw`border w-full p-2 mb-4 rounded`}
        placeholder="New Password"
        secureTextEntry
        value={newPassword}
        onChangeText={setNewPassword}
      />
      <Button title="Update Password" onPress={handlePasswordUpdate} />
    </View>
  );
}
