import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Animated,
  Alert,
  RefreshControl,

} from "react-native";
import { Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Audio } from "expo-av";
import { Directory, Paths } from "expo-file-system";
import * as FileSystemLegacy from "expo-file-system/legacy"; // ✅ FIX
import * as MediaLibrary from "expo-media-library";
import Constants from "expo-constants";
import tw from "tailwind-react-native-classnames";
import { supabase } from "../../lib/supabase";
import { Entypo, Ionicons, MaterialIcons, Feather } from "@expo/vector-icons";

const RecordingsList = () => {
  const [audioFiles, setAudioFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [currentSound, setCurrentSound] = useState(null);
  const [currentlyPlaying, setCurrentlyPlaying] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [downloading, setDownloading] = useState(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // 🔹 Fetch recordings
  const fetchAudioFiles = async () => {
    try {
      setLoading(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) throw new Error("User not authenticated");

      const { data } = await supabase.storage
        .from("recordings")
        .list(`${user.id}/`, {
          sortBy: { column: "created_at", order: "desc" },
        });

      const files = await Promise.all(
        data
          .filter((file) => file.name.endsWith(".m4a"))
          .map(async (file) => {
            const {
              data: { publicUrl },
            } = await supabase.storage
              .from("recordings")
              .getPublicUrl(`${user.id}/${file.name}`);

            return {
              name: file.name,
              created_at: file.created_at,
              url: publicUrl,
              fullPath: `${user.id}/${file.name}`,
            };
          })
      );

      setAudioFiles(files);
      fadeIn();
    } catch (err) {
      console.error(err);
      Alert.alert("Error", err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // 🔥 DOWNLOAD (FINAL FIXED)
  const handleDownload = async (url, filename) => {
    try {
      setDownloading(filename);

      const downloadsDir = new Directory(Paths.document, "Downloads");

      await downloadsDir.create({
        intermediates: true,
        idempotent: true,
      });

      const fileUri = `${downloadsDir.uri}${Date.now()}_${filename}`;

      // ✅ Use legacy ONLY here
      const result = await FileSystemLegacy.downloadAsync(url, fileUri);

      const uri = result.uri;

      if (Constants.appOwnership === "expo") {
        Alert.alert("Download Complete", "Saved in app storage");
        return;
      }

      try {
        const { status } = await MediaLibrary.requestPermissionsAsync();
        if (status === "granted") {
          const asset = await MediaLibrary.createAssetAsync(uri);
          await MediaLibrary.createAlbumAsync("Recordings", asset, false);
          Alert.alert("Saved to gallery");
        }
      } catch {
        Alert.alert("Saved in app storage");
      }
    } catch (err) {
      console.error("Download error:", err);
      Alert.alert("Download Failed", err.message);
    } finally {
      setDownloading(null);
    }
  };

  // 🔹 Play audio
  const playAudio = async (url, name) => {
    try {
      if (currentlyPlaying === name && isPlaying) {
        await currentSound.pauseAsync();
        setIsPlaying(false);
        return;
      }

      if (currentSound) {
        await currentSound.stopAsync();
        await currentSound.unloadAsync();
      }

      const { sound } = await Audio.Sound.createAsync(
        { uri: url },
        { shouldPlay: true }
      );

      setCurrentSound(sound);
      setCurrentlyPlaying(name);
      setIsPlaying(true);

      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.didJustFinish) {
          sound.unloadAsync();
          setCurrentSound(null);
          setCurrentlyPlaying(null);
          setIsPlaying(false);
        }
      });
    } catch (err) {
      console.error(err);
    }
  };

  // 🔹 Delete
  const deleteRecording = async (fullPath, name) => {
    Alert.alert("Delete Recording", "Are you sure?", [
      { text: "Cancel" },
      {
        text: "Delete",
        onPress: async () => {
          try {
            if (currentlyPlaying === name && currentSound) {
              await currentSound.stopAsync();
            }

            await supabase.storage
              .from("recordings")
              .remove([fullPath]);

            setAudioFiles((prev) =>
              prev.filter((f) => f.fullPath !== fullPath)
            );
          } catch (err) {
            console.error(err);
          }
        },
      },
    ]);
  };

  const fadeIn = () => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchAudioFiles();
  };

  useEffect(() => {
    fetchAudioFiles();
    return () => currentSound?.unloadAsync();
  }, []);

  return (
    <SafeAreaView style={[styles.container, tw`flex-1 p-4`]}>
      {loading ? (
        <ActivityIndicator size="large" />
      ) : (
        <Animated.View style={{ opacity: fadeAnim, flex: 1 }}>
          <Text style={styles.header}>🎧 Your Recordings</Text>
<View
  style={tw.style(
    "mx-4 mt-3 mb-2 p-3 rounded-xl",
    { backgroundColor: "#FFF3CD", borderWidth: 1, borderColor: "#FFC107" }
  )}
>
  <Text style={tw`text-center font-bold text-yellow-800`}>
    ⚠️ பதிவு குறிப்பு
  </Text>

  <Text style={tw`text-center text-yellow-900 mt-2`}>
    ஒவ்வொரு பயனரும் அதிகபட்சமாக 10 ஒலிப்பதிவுகள் மட்டுமே
    சேமிக்க அனுமதிக்கப்படுவர்.
  </Text>

  <Text style={tw`text-center text-yellow-900 mt-1`}>
    புதிய பதிவு செய்ய வேண்டுமெனில் பழைய பதிவுகளில் ஒன்றை நீக்கவும்.
  </Text>
</View>
          <FlatList
            data={audioFiles}
            keyExtractor={(item) => item.name}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            renderItem={({ item }) => (
              <View style={styles.card}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.fileName}>
                    🎤 {item.name.replace(".m4a", "")}
                  </Text>
                  <Text style={styles.date}>
                    {new Date(item.created_at).toLocaleString()}
                  </Text>
                </View>

                <View style={styles.actions}>
  
  {/* Download */}
  <TouchableOpacity
    style={styles.downloadBtn}
    onPress={() => handleDownload(item.url, item.name)}
  >
    {downloading === item.name ? (
      <ActivityIndicator color="#fff" size="small" />
    ) : (
      <Image
        source={require("../../assets/icon image/download.png")}
        style={{ width: 16, height: 16, tintColor: "#fff" }}
        resizeMode="contain"
      />
    )}
  </TouchableOpacity>

  {/* Play / Pause */}
  <TouchableOpacity
    style={[
      styles.playBtn,
      currentlyPlaying === item.name && isPlaying
        ? styles.playing
        : null,
    ]}
    onPress={() => playAudio(item.url, item.name)}
  >
    <Image
      source={
        currentlyPlaying === item.name && isPlaying
          ? require("../../assets/icon image/pause.png")
          : require("../../assets/icon image/play.png")
      }
      style={{ width: 18, height: 18, tintColor: "#fff" }}
      resizeMode="contain"
    />
  </TouchableOpacity>

  {/* Delete */}
  <TouchableOpacity
    style={styles.deleteBtn}
    onPress={() => deleteRecording(item.fullPath, item.name)}
  >
    <Image
      source={require("../../assets/icon image/delete.png")} // OR delete.png
      style={{ width: 16, height: 16, tintColor: "#fff" }}
      resizeMode="contain"
    />
  </TouchableOpacity>

</View>
              </View>
            )}
          />
        </Animated.View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#D5C7A3",
  },
  header: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
  },
  card: {
    backgroundColor: "#FFFFFF",
    padding: 14,
    marginBottom: 12,
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  fileName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#333",
  },
  date: {
    fontSize: 11,
    color: "#777",
    marginTop: 4,
  },
  actions: {
    flexDirection: "row",
    gap: 8,
  },
  downloadBtn: {
    backgroundColor: "#4CAF50",
    padding: 8,
    borderRadius: 8,
  },
  playBtn: {
    backgroundColor: "#FF9800",
    padding: 8,
    borderRadius: 8,
  },
  playing: {
    backgroundColor: "#E65100",
  },
  deleteBtn: {
    backgroundColor: "#F44336",
    padding: 8,
    borderRadius: 8,
  },
});

export default RecordingsList;