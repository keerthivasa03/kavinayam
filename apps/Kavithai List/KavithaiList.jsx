import { View, Text, Image, TouchableOpacity, ScrollView } from "react-native";
import { useState, useRef, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React from "react";
import tw from "tailwind-react-native-classnames";
import { SafeAreaView } from "react-native-safe-area-context";
import { Entypo } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { list } from "../../constant/List";
const KavithaiList = () => {
  const navigation = useNavigation();
const [showDisclaimer, setShowDisclaimer] = useState(true);
  const groupedByCategory = list.reduce((acc, item) => {
    if (!acc[item.categories]) {
      acc[item.categories] = [];
    }
    acc[item.categories].push(item);
    return acc;
  }, {});
useEffect(() => {
  const checkDisclaimer = async () => {
    const seen = await AsyncStorage.getItem("disclaimer_seen");

    if (seen === "true") {
      setShowDisclaimer(false);
    }
  };

  checkDisclaimer();
}, []);
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
      {showDisclaimer && (
  <View
    style={tw`absolute inset-0 justify-center items-center`}
  >
    <View style={tw`absolute inset-0 bg-black opacity-60`} />

    <View
      style={[
    tw`bg-white rounded-2xl p-6 mx-6`,
    {
      width: "90%",
      maxHeight: "70%",
    },
  ]}
    >
      <Text
        style={tw`text-center text-lg font-bold text-red-700 mb-4`}
      >
        பதிவு குறிப்பு
      </Text>

      <Text
        style={tw`text-center text-base text-black`}
      >
        ஒவ்வொரு பயனரும் அதிகபட்சமாக 10 ஒலிப்பதிவுகள் (Recordings)
        மட்டுமே சேமிக்க அனுமதிக்கப்படுவர்.
        {"\n\n"}
        புதிய பதிவு செய்ய வேண்டுமெனில் பழைய பதிவுகளில் ஒன்றை நீக்கவும்.
      </Text>

     <TouchableOpacity
  onPress={async () => {
    await AsyncStorage.setItem("disclaimer_seen", "true");
    setShowDisclaimer(false);
  }}
  style={tw`bg-green-600 mt-5 p-3 rounded-xl`}
>
  <Text style={tw`text-white text-center font-bold`}>
    OK
  </Text>
</TouchableOpacity>
    </View>
  </View>
)}
    </SafeAreaView>
  );
};

export default KavithaiList;
