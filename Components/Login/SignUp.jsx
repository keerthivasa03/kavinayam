import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";

import tw from "tailwind-react-native-classnames";
import { MaterialIcons } from "@expo/vector-icons";
import { supabase } from "../../lib/supabase";

const SignUp = ({
  setScreen,
  email,
  setEmail,
  password,
  setPassword,
}) => {
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const handleSignUp = async () => {
    if (!email || !password || !confirmPassword) {
      Alert.alert("Error", "Please fill all fields");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }

    if (password.length < 6) {
      Alert.alert(
        "Error",
        "Password must be at least 6 characters"
      );
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password: password.trim(),
      });

      if (error) {
        throw error;
      }

      console.log("User:", data);

      Alert.alert(
        "Success",
        "Account created successfully. Check your email for verification."
      );

      setEmail("");
      setPassword("");
      setConfirmPassword("");

      setScreen(2);
    } catch (error) {
      console.log(error);

      Alert.alert(
        "Signup Error",
        error.message || "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View
      style={tw.style(
        "flex-1 justify-center px-5",
        {
          backgroundColor: "#D5C7A3",
        }
      )}
    >
      <Text
        style={tw`text-3xl font-bold text-center text-black mb-8`}
      >
        Create Account
      </Text>

      {/* EMAIL */}
      <TextInput
        placeholder="Email"
        placeholderTextColor="#9CA3AF"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        style={tw`bg-gray-800 text-white p-4 rounded-xl mb-4`}
      />

      {/* PASSWORD */}
      <View style={tw`relative mb-4`}>
        <TextInput
          placeholder="Password"
          placeholderTextColor="#9CA3AF"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!showPassword}
          style={tw`bg-gray-800 text-white p-4 rounded-xl pr-12`}
        />

        <TouchableOpacity
          style={tw`absolute right-4 top-4`}
          onPress={() =>
            setShowPassword(!showPassword)
          }
        >
          <MaterialIcons
            name={
              showPassword
                ? "visibility-off"
                : "visibility"
            }
            size={24}
            color="#9CA3AF"
          />
        </TouchableOpacity>
      </View>

      {/* CONFIRM PASSWORD */}
      <View style={tw`relative mb-6`}>
        <TextInput
          placeholder="Confirm Password"
          placeholderTextColor="#9CA3AF"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry={!showConfirmPassword}
          style={tw`bg-gray-800 text-white p-4 rounded-xl pr-12`}
        />

        <TouchableOpacity
          style={tw`absolute right-4 top-4`}
          onPress={() =>
            setShowConfirmPassword(
              !showConfirmPassword
            )
          }
        >
          <MaterialIcons
            name={
              showConfirmPassword
                ? "visibility-off"
                : "visibility"
            }
            size={24}
            color="#9CA3AF"
          />
        </TouchableOpacity>
      </View>

      {/* SIGNUP BUTTON */}
      <TouchableOpacity
        onPress={handleSignUp}
        disabled={loading}
        style={tw.style(
          "p-4 rounded-xl mb-5",
          {
            backgroundColor: "#2563EB",
          }
        )}
      >
        {loading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text
            style={tw`text-white text-center font-bold text-lg`}
          >
            Sign Up
          </Text>
        )}
      </TouchableOpacity>

      {/* LOGIN */}
      <TouchableOpacity
        onPress={() => setScreen(2)}
      >
        <Text
          style={tw`text-center text-gray-700`}
        >
          Already have an account?{" "}
          <Text style={tw`text-red-600 font-bold`}>
            Sign In
          </Text>
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default SignUp;