import { View, Text, Image } from "react-native";
import React from "react";
import tw from "tailwind-react-native-classnames";

const Thirukkural = () => {
  return (
    <View
      style={tw.style(" mx-4 p-2 rounded-2xl", {
        backgroundColor: "#F3EFE5",
      })}
    >
      <Text style={tw`text-sm font-bold mb-2`}>
        சுழன்றும்ஏர்ப் பின்னது உலகம் அதனால்
      </Text>
      <Text style={tw`text-sm font-bold`}>உழந்தும் உழவே தலை.</Text>
    </View>
  );
};

export default Thirukkural;
