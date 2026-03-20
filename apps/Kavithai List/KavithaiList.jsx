import { View, Text, Image, TouchableOpacity, ScrollView } from "react-native";
import React from "react";
import tw from "tailwind-react-native-classnames";
import { SafeAreaView } from "react-native-safe-area-context";
import { Entypo } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { list } from "../../constant/List";

const KavithaiList = () => {
  const navigation = useNavigation();

  const groupedByCategory = list.reduce((acc, item) => {
    if (!acc[item.categories]) {
      acc[item.categories] = [];
    }
    acc[item.categories].push(item);
    return acc;
  }, {});

  return (
    <SafeAreaView style={tw.style("flex-1", { backgroundColor: "#D5C7A3" })}>
      <Text
        style={tw.style("text-center font-bold text-2xl my-3", {
          color: "#8B0000",
        })}
      >
        கவிதைகள்
      </Text>

      <ScrollView showsVerticalScrollIndicator={false}>
        {Object.keys(groupedByCategory).map((category, index) => (
          <View key={index} style={tw`px-4`}>
            <Text style={tw`text-black font-bold text-2xl mb-2`}>
              {category}
            </Text>
            {groupedByCategory[category].map((item) => (
              <TouchableOpacity
                key={item.id}
                onPress={() => {
                  if (item.categories === "தொனி") {
                    navigation.navigate("ThoniKaraoke", { item: item });
                  } else if (item.categories === "வேகம்") {
                    navigation.navigate("VegamKaroki", { item: item });
                  } else if (item.categories === "நயம்") {
                    navigation.navigate("Nayamkaraoke", { item: item });
                  } else if (item.categories === "உச்சரிப்பு") {
                    navigation.navigate("UhchayaripuKaraoke", { item: item });
                  } else {
                    navigation.navigate("Allkaraoke", { item: item });
                  }
                }}
              >
                <View
                  style={tw`bg-white rounded-xl mr-3 shadow p-3 w-full flex-row items-center my-4`}
                >
                  <View style={tw`rounded-2xl mr-3 shadow-xl bg-white`}>
                    <Image
                      source={item.image}
                      style={tw.style("w-24 h-24 rounded-2xl", {
                        borderWidth: 2,
                        borderColor: "#ffffff",
                      })}
                      resizeMode="cover"
                    />
                  </View>
                  <View style={tw`flex-1`}>
                    <Text style={tw`text-sm font-semibold text-gray-800`}>
                      {item.title}
                    </Text>
                    <Text style={tw`text-xs text-gray-600 mt-2`}>
                      {item.author}
                    </Text>
                  </View>
                  <Entypo name="controller-play" size={24} color="black" />
                </View>
              </TouchableOpacity>
            ))}
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

export default KavithaiList;
