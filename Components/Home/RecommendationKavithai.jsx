import { View, Text, FlatList, Image, TouchableOpacity } from "react-native";
import React, { useEffect, useState, useCallback } from "react";
import tw from "tailwind-react-native-classnames";
import { Entypo } from "@expo/vector-icons";
import { list } from "../../constant/List";
import { useNavigation } from "@react-navigation/native";

const RecommendationKavithai = () => {
  const [randomItems, setRandomItems] = useState([]);
  const [randomItems2, setRandomItems2] = useState([]);
  const navigation = useNavigation();

  // Improved random item selection using Fisher-Yates shuffle
  const getRandomItems = useCallback((array, count) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled.slice(0, count);
  }, []);

  useEffect(() => {
    // Get 8 random items and split into two groups of 4
    const allRandomItems = getRandomItems(list, 8);
    setRandomItems(allRandomItems.slice(0, 4));
    setRandomItems2(allRandomItems.slice(4, 8));
  }, [getRandomItems]);

  // Navigation handler to avoid repetition
  const handleItemPress = useCallback(
    (item) => {
      const screenMap = {
        தொனி: "ThoniKaraoke",
        வேகம்: "VegamKaroki",
        நயம்: "Nayamkaraoke",
        உச்சரிப்பு: "UhchayaripuKaraoke",
        "வேகம், தொனி, உச்சரிப்பு, நயம்": "Allkaraoke",
      };

      if (screenMap[item.categories]) {
        navigation.navigate(screenMap[item.categories], { item });
      }
    },
    [navigation]
  );

  // Render item component to avoid duplication
  const renderItem = useCallback(
    ({ item }) => (
      <TouchableOpacity onPress={() => handleItemPress(item)}>
        <View
          style={tw`bg-white rounded-xl mr-3 shadow p-3 w-80 flex-row items-center`}
        >
          <Image
            source={item.image}
            style={tw`w-24 h-24 rounded-2xl mr-3`}
            resizeMode="cover"
          />
          <View style={tw`flex-1`}>
            <Text style={tw`text-sm font-semibold text-gray-800`}>
              {item.title}
            </Text>
            <Text style={tw`text-xs text-gray-600`}>{item.author}</Text>
          </View>
          <TouchableOpacity style={tw`mt-1`}>
            <Entypo name="controller-play" size={24} color="black" />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    ),
    [handleItemPress]
  );

  return (
    <View style={tw`pt-4 px-4`}>
      <Text style={tw`text-red-800 text-lg font-semibold mb-2`}>
        Recommended for you
      </Text>

      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={randomItems}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
      />

      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={randomItems2}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={tw`mt-4`}
      />
    </View>
  );
};

export default RecommendationKavithai;
