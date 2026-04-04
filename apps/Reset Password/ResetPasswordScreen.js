import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert } from "react-native";
import tw from "tailwind-react-native-classnames";
import { supabase } from "../../lib/supabase";
import { useNavigation, useRoute } from "@react-navigation/native";

export default function ResetPasswordScreen() {
  const navigation = useNavigation();
  const route = useRoute();

  const [password, setPassword] = useState("");

  const handleUpdate = async () => {
    if (password.length < 6) {
      return Alert.alert("Error", "Password must be at least 6 characters");
    }

    const { error } = await supabase.auth.updateUser({
      password: password,
    });

    if (error) {
      Alert.alert("Error", error.message);
    } else {
      Alert.alert("Success", "Password updated!");

      // ✅ SAFE NAVIGATION
      if (navigation?.navigate) {
        navigation.navigate("Login");
      }
    }
  };

  return (
    <View style={tw`flex-1 justify-center px-6 bg-white`}>
      <Text style={tw`text-2xl font-bold mb-6 text-center`}>
        Reset Password
      </Text>

      <TextInput
        placeholder="Enter new password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        style={tw`border p-3 rounded-lg mb-4`}
      />

      <TouchableOpacity
        onPress={handleUpdate}
        style={tw`bg-green-500 p-3 rounded-lg`}
      >
        <Text style={tw`text-white text-center font-bold`}>
          Update Password
        </Text>
      </TouchableOpacity>
    </View>
  );
}