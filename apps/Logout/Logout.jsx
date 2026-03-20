import { View, Text, TouchableOpacity, Alert } from "react-native";
import React from "react";
import { supabase } from "../../lib/supabase";
import { useNavigation } from "@react-navigation/native";
import tw from "tailwind-react-native-classnames";

const Logout = () => {
  const navigation = useNavigation();

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      Alert.alert("Logout Failed", error.message);
    } else {
      navigation.reset({
        index: 0,
        routes: [{ name: "Login" }], // Replace 'Login' with your actual login screen name
      });
    }
  };

  return (
    <View
      style={tw.style("flex-1 justify-center items-center ", {
        backgroundColor: "#D5C7A3",
      })}
    >
      <Text style={tw`text-xl font-bold mb-4`}>
        Are you sure you want to logout?
      </Text>
      <TouchableOpacity
        onPress={handleLogout}
        style={tw`bg-red-500 px-6 py-3 rounded-full`}
      >
        <Text style={tw`text-white font-semibold`}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
};

export default Logout;
