import {
  View,
  Text,
  TouchableOpacity,
  ImageBackground,
  Image,
} from "react-native";
import React from "react";
import tw from "tailwind-react-native-classnames";

const Menu = ({ setScreen }) => {
  return (
    <ImageBackground
      source={{
        uri: "https://thumbs.dreamstime.com/z/tamil-script-background-abstract-composition-made-characters-used-198911141.jpg?w=576",
      }}
      resizeMode="cover"
      style={tw`flex-1 justify-center items-center`}
    >
      <View style={tw`bg-white   p-6 rounded items-center w-72 rounded-2xl`}>
        <View style={tw`items-center mt-2`}>
          <Image
            source={require("../../assets/logo.png")}
            style={tw`w-64 h-32`}
            resizeMode="cover"
          />
        </View>
        <TouchableOpacity
          onPress={() => setScreen(1)}
          style={tw`bg-red-800 px-6 py-2 rounded mb-3`}
        >
          <Text style={tw`text-white font-bold`}>Sign Up - புதிய பதிவு </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setScreen(2)}
          style={tw`bg-red-800 px-6 mt-4 mb-4 py-2 rounded`}
        >
          <Text style={tw`text-white font-bold`}>Sign In - உள்நுழைக </Text>
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
};

export default Menu;
