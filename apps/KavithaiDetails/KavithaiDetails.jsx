import React from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  FlatList,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute } from "@react-navigation/native";
import { AntDesign } from "@expo/vector-icons";
import tw from "tailwind-react-native-classnames";
import { list } from "../../constant/List";

const KavithaiDetails = () => {
  const route = useRoute();
  const { kavithai } = route.params || {};
  const navigation = useNavigation();

  const renderPoemItem = ({ item }) =>
    item.categories === kavithai?.name ? (
      <TouchableOpacity
        onPress={() => {
          if (item.categories === "தொனி") {
            navigation.navigate("ThoniKaraoke", { item: item });
          } else if (item.categories === "வேகம்") {
            navigation.navigate("VegamKaroki", { item: item });
          } else if (item.categories === "நயம்") {
            navigation.navigate("Nayamkaraoke", { item: item });
          } else if (item.categories === "உச்சரிப்பு") {
            navigation.navigate("UhchayaripuKaraoke", { item: item });
          }
        }}
        activeOpacity={0.8}
        style={styles.poemCard}
      >
        <Image
          source={item.image}
          style={styles.poemImage}
          resizeMode="cover"
        />
        <View style={styles.poemInfo}>
          <Text style={styles.poemTitle}>{item.title}</Text>
          <Text style={styles.poemAuthor}>{item.author}</Text>
          <Text style={styles.poemCategory}>குறிப்பு: {item.categories}</Text>
        </View>
      </TouchableOpacity>
    ) : null;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header with back button */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <AntDesign name="left" size={24} color="#4A2600" />
        </TouchableOpacity>
      </View>

      {/* Category Banner */}
      <View style={styles.bannerContainer}>
        <Image
          source={require("../../assets/bg_categories.jpg")}
          style={styles.bannerImage}
          resizeMode="cover"
        />
        <Text style={styles.categoryTitle}>{kavithai?.name}</Text>
      </View>

      {/* Poems List */}
      <FlatList
        data={list}
        renderItem={renderPoemItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <Text style={styles.emptyText}>கவிதைகள் எதுவும் இல்லை</Text>
        }
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#D5C7A3",
  },
  header: {
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
  },
  backButton: {
    padding: 8,
    marginTop: 15,
  },
  bannerContainer: {
    alignItems: "center",
    marginBottom: 16,
  },
  bannerImage: {
    width: 320,
    height: 256,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "#ffffff",
  },
  categoryTitle: {
    position: "absolute",
    bottom: 20,
    fontSize: 20,
    fontWeight: "bold",
    color: "#4A2600",
    backgroundColor: "rgba(255,255,255,0.7)",
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderRadius: 20,
  },
  instructionsCard: {
    backgroundColor: "#f5e7cd",
    borderRadius: 24,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
  },
  instructionsText: {
    textAlign: "center",
    color: "#4A2600",
    fontSize: 14,
    lineHeight: 20,
  },
  additionalInfoText: {
    textAlign: "center",
    color: "#5F4B32",
    fontSize: 12,
    marginTop: 8,
    fontStyle: "italic",
  },
  poemCard: {
    backgroundColor: "#f5e7cd",
    borderRadius: 24,
    flexDirection: "row",
    alignItems: "center",
    width: "90%",
    padding: 12,
    marginVertical: 8,
    alignSelf: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  poemImage: {
    width: 80,
    height: 80,
    borderRadius: 16,
  },
  poemInfo: {
    marginLeft: 12,
    flex: 1,
  },
  poemTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#4A2600",
  },
  poemAuthor: {
    fontSize: 12,
    color: "#5F4B32",
    marginTop: 2,
  },
  poemCategory: {
    fontSize: 12,
    color: "#7A6A52",
    marginTop: 4,
  },
  listContent: {
    paddingBottom: 32,
  },
  emptyText: {
    textAlign: "center",
    marginTop: 40,
    color: "#5F4B32",
    fontSize: 16,
  },
});

export default KavithaiDetails;
