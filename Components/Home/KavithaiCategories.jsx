import {
  View,
  Text,
  FlatList,
  ImageBackground,
  Dimensions,
  Platform,
  TouchableOpacity,
} from "react-native";
import React from "react";
import tw from "tailwind-react-native-classnames";
import { useNavigation } from "@react-navigation/native";
import { list } from "../../constant/List";
import { Ionicons, FontAwesome5, Entypo } from "@expo/vector-icons";

const { width, height } = Dimensions.get("window");

const categories = [
  {
    id: "1",
    name: "வேகம்",
    note: (
      <>
        <View
          style={[
            tw`flex justify-center items-center w-full rounded-3xl`,
            { backgroundColor: "#2C2D2D", paddingVertical: height * 0.015 },
          ]}
        >
          <View style={tw`flex-row`}>
            <Text style={tw`text-red-400 text-center`}>
              <Text style={tw`text-red-100 font-bold text-xl `}>/</Text>{" "}
              வாசிக்கும் பொழுது இக்குறியீடு இருக்கும் இடங்களில் நிறுத்தி அதனைப்
              பின்பற்றி வாசிக்கவும்.
            </Text>
          </View>
        </View>
      </>
    ),
  },
  {
    id: "2",
    name: "தொனி",
    note: (
      <>
        <View
          style={[
            tw`flex justify-center items-center w-full rounded-3xl`,
            { backgroundColor: "#2C2D2D", paddingVertical: height * 0.015 },
          ]}
        >
          <View style={tw`flex-row`}>
            <FontAwesome5
              name="arrow-up"
              size={24}
              color="#00FF00"
              style={tw`mr-2`}
            />
            <Text style={[tw`text-lg font-bold`, { color: "#00FF00" }]}>
              ஏற்றம்
            </Text>
          </View>
          <View style={tw`flex-row`}>
            <FontAwesome5
              name="arrow-down"
              size={24}
              color="#FF0000"
              style={tw`mr-2`}
            />
            <Text style={[tw`text-lg font-bold`, { color: "#FF0000" }]}>
              இறக்கம்
            </Text>
          </View>
        </View>
      </>
    ),
  },
  {
    id: "3",
    name: "உச்சரிப்பு",
    note: (
      <View style={tw`border border-black flex`}>
        {/* Row 1 */}
        <View style={tw`flex-row`}>
          <View
            style={tw`flex-1 border-r border-black justify-center items-center p-2`}
          >
            <Text style={tw`text-black text-base font-bold`}>ல,ள,ழ</Text>
          </View>
          <View
            style={[
              tw`flex-1 justify-center items-center p-2`,
              { backgroundColor: "red" },
            ]}
          >
            <Text style={tw`text-white text-base font-bold`}>சிவப்பு</Text>
          </View>
        </View>

        {/* Row 2 */}
        <View style={tw`flex-row`}>
          <View
            style={tw`flex-1 border-t border-r border-black justify-center items-center p-2`}
          >
            <Text style={tw`text-black text-base font-bold`}>ர,ற</Text>
          </View>
          <View
            style={[
              tw`flex-1 border-t border-black justify-center items-center p-2`,
              { backgroundColor: "blue" },
            ]}
          >
            <Text style={tw`text-white text-base font-bold`}>நீலம்</Text>
          </View>
        </View>

        {/* Row 3 */}
        <View style={tw`flex-row`}>
          <View
            style={tw`flex-1 border-t border-r border-black justify-center items-center p-2`}
          >
            <Text style={tw`text-black text-sm font-bold`}>ந,ன,ண</Text>
          </View>
          <View
            style={[
              tw`flex-1 border-t border-black justify-center items-center p-2`,
              { backgroundColor: "#00E676" },
            ]}
          >
            <Text style={tw`text-white text-base font-bold`}>பச்சை</Text>
          </View>
        </View>
      </View>
    ),
  },
  {
    id: "4",
    name: "நயம்",
    note: (
      <>
        <View
          style={[
            tw`flex justify-center items-center w-full rounded-3xl`,
            { backgroundColor: "#2C2D2D", paddingVertical: height * 0.015 },
          ]}
        >
          <View style={tw`flex-row`}>
            <Text style={tw`text-red-400 text-center`}>
              *நயத்துடன் வாசிக ்கப்படும ் காண ாளி ‘கவியநயம்’ ணெயலியில் பதிவவற
              ்றப ்படும ்
            </Text>
          </View>
        </View>
      </>
    ),
  },
];

const CARD_SIZE = Dimensions.get("window").width * 0.45;

const KavithaiCategories = () => {
  const navigation = useNavigation();

  const renderItem = ({ item }) => (
    <>
      <TouchableOpacity
        onPress={() =>
          navigation.navigate("KavithaiDetails", {
            kavithai: item, // ✅ Pass full category object
          })
        }
      >
        <View
          style={{
            width: CARD_SIZE,
            height: CARD_SIZE,
            borderRadius: 16,
            marginRight: 16,
            marginLeft: 16,
            padding: 4,
            backgroundColor: "white",
            ...Platform.select({
              ios: {
                shadowColor: "black",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 5,
              },
              android: {
                elevation: 25,
              },
            }),
          }}
        >
          <ImageBackground
            source={require("../../assets/bg_categories.jpg")}
            resizeMode="cover"
            imageStyle={{ borderRadius: 16 }}
            style={tw`flex-1 justify-center items-center rounded-lg overflow-hidden`}
          >
            <Text style={tw`text-black text-lg font-semibold`}>
              {item.name}
            </Text>
          </ImageBackground>
        </View>
      </TouchableOpacity>
    </>
  );

  return (
    <View style={tw`px-4 py-2`}>
      <FlatList
        data={categories}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
      />
    </View>
  );
};

export default KavithaiCategories;
