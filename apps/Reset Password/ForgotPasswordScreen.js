// screens/ForgotPasswordScreen.js

import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert } from "react-native";
import tw from "tailwind-react-native-classnames";
import { supabase } from "../../lib/supabase";

export default function ForgotPasswordScreen({ navigation }) {
  const [email, setEmail] = useState("");

  const handleReset = async () => {
    if (!email) {
      return Alert.alert("Error", "Enter your email");
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: "kavinayam://reset-password",
    });

    if (error) {
      Alert.alert("Error", error.message);
    } else {
      Alert.alert("Success", "Check your email for reset link");
    }
  };

  return (
    <View style={tw`flex-1 justify-center px-6 bg-white`}>
      <Text style={tw`text-2xl font-bold mb-6 text-center`}>
        Forgot Password
      </Text>

      <TextInput
        placeholder="Enter email"
        value={email}
        onChangeText={setEmail}
        style={tw`border p-3 rounded-lg mb-4`}
      />

      <TouchableOpacity
        onPress={handleReset}
        style={tw`bg-blue-500 p-3 rounded-lg`}
      >
        <Text style={tw`text-white text-center font-bold`}>
          Send Reset Link
        </Text>
      </TouchableOpacity>
    </View>
  );
}