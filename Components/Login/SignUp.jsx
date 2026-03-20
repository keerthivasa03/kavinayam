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

const SignUp = ({ setScreen, email, setEmail, password, setPassword }) => {
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSignUp = async () => {
    if (!email || !password || !confirmPassword) {
      Alert.alert("Error", "Please fill all fields");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords don't match");
      return;
    }

    if (password.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.signUp({
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

  return (
    <View
      style={tw.style("flex-1 justify-center p-4", {
        backgroundColor: "#D5C7A3",
      })}
    >
      <Text style={tw`text-black text-center text-2xl font-bold mb-6`}>
        Create Account
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

      <View style={tw`relative mb-4`}>
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

      <View style={tw`relative mb-6`}>
        <TextInput
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          placeholder="Confirm Password"
          placeholderTextColor="#9CA3AF"
          secureTextEntry={!showConfirmPassword}
          style={tw`bg-gray-800 text-white p-4 rounded-lg pr-10`}
        />
        <TouchableOpacity
          style={tw`absolute right-3 top-4`}
          onPress={() => setShowConfirmPassword(!showConfirmPassword)}
        >
          <MaterialIcons
            name={showConfirmPassword ? "visibility-off" : "visibility"}
            size={24}
            color="#9CA3AF"
          />
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        onPress={handleSignUp}
        disabled={loading}
        style={tw`bg-blue-500 p-4 rounded-lg mb-4`}
      >
        {loading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text style={tw`text-white text-center font-bold`}>Sign Up</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity onPress={() => setScreen(2)}>
        <Text style={tw`text-gray-500 text-center`}>
          Already have an account? <Text style={tw`text-red-600`}>Sign In</Text>
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default SignUp;
