import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import React, { useState } from "react";
import { supabase } from "../../lib/supabase";
import tw from "tailwind-react-native-classnames";
import { MaterialIcons } from "@expo/vector-icons";

const SignIn = ({ setScreen, email, setEmail, password, setPassword }) => {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSignIn = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please fill all fields");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
    } catch (error) {
      Alert.alert("Error", error.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!email) {
      Alert.alert("Error", "Please enter your email first");
      return;
    }

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: "kavinayam://ResetPasswordScreen",
      });

      if (error) throw error;

      Alert.alert("Success", "Password reset email sent");
    } catch (error) {
      Alert.alert("Error", error.message);
    }
  };

  return (
    <View
      style={tw.style("flex-1 justify-center p-4", {
        backgroundColor: "#D5C7A3",
      })}
    >
      <Text style={tw`text-black text-center text-2xl font-bold mb-3`}>
        LOGIN
      </Text>
      <Text style={tw`text-black text-center text-2xl font-bold mb-6`}>
        Welcome Back
      </Text>

      <TextInput
        value={email}
        onChangeText={setEmail}
        placeholder="Email"
        placeholderTextColor="#9CA3AF"
        autoCapitalize="none"
        keyboardType="email-address"
        style={tw`bg-gray-800 text-white p-4 rounded-lg mb-4`}
      />

      <View style={tw`relative mb-6`}>
        <TextInput
          value={password}
          onChangeText={setPassword}
          placeholder="Password"
          placeholderTextColor="#9CA3AF"
          secureTextEntry={!showPassword}
          style={tw`bg-gray-800 text-white p-4 rounded-lg pr-10`}
        />
        <TouchableOpacity
          style={tw`absolute right-3 top-4`}
          onPress={() => setShowPassword(!showPassword)}
        >
          <MaterialIcons
            name={showPassword ? "visibility-off" : "visibility"}
            size={24}
            color="#9CA3AF"
          />
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        onPress={handleSignIn}
        disabled={loading}
        style={tw`bg-blue-500 p-4 rounded-lg mb-4`}
      >
        {loading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text style={tw`text-white text-center font-bold`}>Sign In</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity onPress={handlePasswordReset} style={tw`mb-4`}>
        <Text style={tw`text-gray-500 text-center`}>Forgot password?</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => setScreen(1)}>
        <Text style={tw`text-gray-500 text-center`}>
          Don't have an account? <Text style={tw`text-red-600`}>Sign Up</Text>
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default SignIn;
