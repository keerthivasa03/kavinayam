import {
  View,
  Text,
  Image,
  FlatList,
  Dimensions,
  SafeAreaView,
  StatusBar,
  useColorScheme,
} from "react-native";
import React from "react";
import tw from "tailwind-react-native-classnames";
import Thirukkural from "../../Components/Home/Thirukkural";
import KavithaiCategories from "../../Components/Home/KavithaiCategories";
import RecommendationKavithai from "../../Components/Home/RecommendationKavithai";

const HomeScreen = () => {
  const sections = [
    {
      id: "logo",
      render: () => (
        <SafeAreaView style={tw`items-center mt-2`}>
          <Image
            source={require("../../assets/logo.png")}
            style={tw`w-64 h-32 mt-2`}
            resizeMode="cover"
          />
        </SafeAreaView>
      ),
    },

    { id: "categories", render: () => <KavithaiCategories /> },
    { id: "recommendations", render: () => <RecommendationKavithai /> },
  ];
  const scheme = useColorScheme();

  return (
    <SafeAreaView style={tw.style("flex-1", { backgroundColor: "#D5C7A3" })}>
      <StatusBar
        barStyle={scheme === "dark" ? "light-content" : "dark-content"}
        backgroundColor={scheme === "dark" ? "#000" : "#fff"}
      />
      <FlatList
        data={sections}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => item.render()}
        contentContainerStyle={tw`pb-6`}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

export default HomeScreen;
