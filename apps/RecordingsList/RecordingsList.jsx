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
  SafeAreaView,
} from "react-native";
import { Audio } from "expo-av";
import * as FileSystem from "expo-file-system";
import * as MediaLibrary from "expo-media-library";
import Constants from "expo-constants";
import tw from "tailwind-react-native-classnames";
import { supabase } from "../../lib/supabase";
import { Entypo, Ionicons, MaterialIcons, Feather } from "@expo/vector-icons";

const MAX_RECORDINGS = 10;

const RecordingsList = ({ onRecordingStart }) => {
  const [audioFiles, setAudioFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [currentSound, setCurrentSound] = useState(null);
  const [currentlyPlaying, setCurrentlyPlaying] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [downloading, setDownloading] = useState(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const checkRecordingLimit = () => {
    if (audioFiles.length >= MAX_RECORDINGS) {
      Alert.alert(
        "Recording Limit Reached",
        `You've reached the maximum of ${MAX_RECORDINGS} recordings. Please delete an existing recording to create a new one.`,
        [{ text: "OK" }]
      );
      return true;
    }
    return false;
  };

  const fetchAudioFiles = async () => {
    try {
      setLoading(true);
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();
      if (!user || authError) throw new Error("User not authenticated");

      const { data, error: listError } = await supabase.storage
        .from("recordings")
        .list(`${user.id}/`, {
          limit: 100,
          offset: 0,
          sortBy: { column: "created_at", order: "desc" },
        });

      if (listError) throw listError;

      const filesWithUrls = await Promise.all(
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

      setAudioFiles(filesWithUrls);
      fadeIn();
    } catch (err) {
      console.error("Error fetching audio files:", err);
      setError(err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleDownload = async (url, filename) => {
    try {
      setDownloading(filename);

      const downloadsDir = `${FileSystem.documentDirectory}Downloads/`;
      await FileSystem.makeDirectoryAsync(downloadsDir, {
        intermediates: true,
      });
      const fileUri = `${downloadsDir}${filename}`;

      const downloadResumable = FileSystem.createDownloadResumable(
        url,
        fileUri
      );

      const { uri } = await downloadResumable.downloadAsync();

      if (Constants.appOwnership === "expo") {
        Alert.alert(
          "Download Complete",
          `File saved to app storage: ${filename}\n\nNote: To save to device gallery, create a development build.`,
          [{ text: "OK" }]
        );
        return;
      }

      try {
        const { status } = await MediaLibrary.requestPermissionsAsync();
        if (status !== "granted") {
          throw new Error("Media library permission not granted");
        }

        const asset = await MediaLibrary.createAssetAsync(uri);
        await MediaLibrary.createAlbumAsync("Recordings", asset, false);

        Alert.alert(
          "Download Complete",
          `Recording saved to your device gallery as ${filename}`,
          [{ text: "OK" }]
        );
      } catch (mediaError) {
        console.log("Media library save failed, keeping in app storage");
        Alert.alert(
          "Download Complete",
          `File saved to app storage: ${filename}`,
          [{ text: "OK" }]
        );
      }
    } catch (err) {
      console.error("Download error:", err);
      Alert.alert(
        "Download Failed",
        err.message || "Failed to download recording",
        [{ text: "OK" }]
      );
    } finally {
      setDownloading(null);
    }
  };

  const fadeIn = () => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  };

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

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
      });

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
      console.error("Error playing audio:", err);
      setError("Failed to play audio");
    }
  };

  const stopPlayback = async () => {
    if (currentSound) {
      await currentSound.stopAsync();
      await currentSound.unloadAsync();
      setCurrentSound(null);
      setCurrentlyPlaying(null);
      setIsPlaying(false);
    }
  };

  const deleteRecording = async (fullPath, name) => {
    Alert.alert(
      "Delete Recording",
      "Are you sure you want to delete this recording?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          onPress: async () => {
            try {
              if (currentlyPlaying === name) {
                await stopPlayback();
              }

              const { error } = await supabase.storage
                .from("recordings")
                .remove([fullPath]);

              if (error) throw error;

              setAudioFiles(
                audioFiles.filter((file) => file.fullPath !== fullPath)
              );

              Alert.alert(
                "Success",
                "Recording deleted. You can now create a new recording.",
                [{ text: "OK" }]
              );
            } catch (err) {
              console.error("Error deleting recording:", err);
              setError("Failed to delete recording");
            }
          },
          style: "destructive",
        },
      ]
    );
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchAudioFiles();
  };

  useEffect(() => {
    fetchAudioFiles();

    return () => {
      if (currentSound) {
        currentSound.unloadAsync();
      }
    };
  }, []);

  return (
    <SafeAreaView style={[styles.container, tw`flex-1 p-4`]}>
      {error && (
        <Text style={[styles.errorText, tw`text-center mb-4`]}>{error}</Text>
      )}

      {loading && !refreshing ? (
        <ActivityIndicator size="large" style={tw`mt-8`} color="#6B5B45" />
      ) : (
        <Animated.View style={{ opacity: fadeAnim, flex: 1 }}>
          <Text style={styles.headerText}>Your Recordings</Text>
          <View style={styles.expoNotice}>
            <Text style={styles.expoNoticeText}>
              {`You can record up to ${MAX_RECORDINGS} audio files only. To record a new one,
              please delete an existing recording.`}
            </Text>
            {audioFiles.length >= MAX_RECORDINGS && (
              <Text style={[styles.expoNoticeText, styles.limitReachedText]}>
                Maximum recordings reached!
              </Text>
            )}
          </View>
          <FlatList
            data={audioFiles}
            keyExtractor={(item) => item.name}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={["#6B5B45"]}
                tintColor="#6B5B45"
              />
            }
            renderItem={({ item }) => (
              <View
                style={[
                  styles.listItem,
                  tw`flex-row justify-between items-center p-3 mb-2 rounded-lg`,
                ]}
              >
                <View style={tw`flex-1`}>
                  <Text style={styles.dateText}>
                    {new Date(item.created_at).toLocaleDateString()}
                  </Text>
                  <Text style={styles.timeText}>
                    {item.name.replace("recording_", "").replace(".m4a", "")}
                  </Text>
                </View>
                <View style={tw`flex-row items-center`}>
                  {downloading === item.name ? (
                    <View
                      style={[styles.downloadButton, tw`p-2 rounded-full mr-2`]}
                    >
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    </View>
                  ) : (
                    <TouchableOpacity
                      onPress={() => handleDownload(item.url, item.name)}
                      style={[styles.downloadButton, tw`p-2 rounded-full mr-2`]}
                    >
                      <Feather name="download" size={16} color="#FFFFFF" />
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity
                    onPress={() => playAudio(item.url, item.name)}
                    style={[
                      styles.playButton,
                      tw`p-2 rounded-full mr-2`,
                      currentlyPlaying === item.name && isPlaying
                        ? styles.playingButton
                        : null,
                    ]}
                  >
                    {currentlyPlaying === item.name && isPlaying ? (
                      <MaterialIcons name="pause" size={16} color="#FFFFFF" />
                    ) : (
                      <Entypo
                        name="controller-play"
                        size={16}
                        color="#FFFFFF"
                      />
                    )}
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => deleteRecording(item.fullPath, item.name)}
                    style={[styles.deleteButton, tw`p-2 rounded-full`]}
                  >
                    <Ionicons name="trash-outline" size={16} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>
              </View>
            )}
            ListEmptyComponent={
              <Text style={[styles.emptyText, tw`text-center p-4`]}>
                {refreshing ? "Refreshing..." : "No recordings found"}
              </Text>
            }
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
  headerText: {
    color: "black",
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
    marginTop: 20,
  },
  expoNotice: {
    backgroundColor: "#F0E6D2",
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    marginHorizontal: 16,
  },
  expoNoticeText: {
    color: "#black",
    textAlign: "center",
    fontSize: 14,
    fontWeight: 600,
  },
  limitReachedText: {
    color: "#A52A2A",
    fontWeight: "bold",
    marginTop: 8,
  },
  listItem: {
    backgroundColor: "#E8D9B5",
    borderColor: "#C4B798",
    borderWidth: 1,
  },
  errorText: {
    color: "#A52A2A",
    backgroundColor: "#F0E6D2",
    padding: 10,
    borderRadius: 5,
  },
  dateText: {
    color: "black",
    fontSize: 16,
    fontWeight: 600,
  },
  timeText: {
    color: "#00000",
    fontSize: 12,
    fontWeight: 600,
  },
  downloadButton: {
    backgroundColor: "#5F9EA0",
  },
  playButton: {
    backgroundColor: "#8B7D65",
  },
  playingButton: {
    backgroundColor: "#6B5B45",
  },
  deleteButton: {
    backgroundColor: "#A52A2A",
  },
  emptyText: {
    color: "#6B5B45",
    fontSize: 16,
  },
});

export default RecordingsList;
