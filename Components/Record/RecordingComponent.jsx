import React, { useState, useRef, useEffect, memo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Animated,
  StyleSheet,
  Alert,
} from "react-native";
import { Ionicons, Entypo, MaterialIcons } from "@expo/vector-icons";
import { Audio } from "expo-av";
import * as FileSystem from "expo-file-system";
import tw from "tailwind-react-native-classnames";
import { supabase } from "../../lib/supabase";
import { decode } from "base64-arraybuffer";
import PropTypes from "prop-types";
import Slider from "@react-native-community/slider";

const MAX_RECORDINGS = 10;

const RecordingComponent = ({ lyrics = [], flatListRef, onClose, name }) => {
  // State management
  const [recording, setRecording] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedURI, setRecordedURI] = useState(null);
  const [recordingsList, setRecordingsList] = useState([]);
  const [currentRecordingIndex, setCurrentRecordingIndex] = useState(0);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState(null);
  const [scrollSpeed, setScrollSpeed] = useState(3);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentlyPlayingId, setCurrentlyPlayingId] = useState(null);
  const [showSaveButton, setShowSaveButton] = useState(false);
  const [tempRecordingUri, setTempRecordingUri] = useState(null);
  const [showSpeedControls, setShowSpeedControls] = useState(true);

  // Refs and animations
  const recordingIntervalRef = useRef(null);
  const soundRef = useRef(null);
  const pulseAnim = useRef(new Animated.Value(0)).current;
  const speedControlsAnim = useRef(new Animated.Value(1)).current;

  // Check recording limit
  const checkRecordingLimit = () => {
    console.log(recordingsList.length);

    if (recordingsList.length >= MAX_RECORDINGS) {
      Alert.alert(
        "Recording Limit Reached",
        `You've reached the maximum of ${MAX_RECORDINGS} recordings. Please delete some before creating new ones.`,
        [{ text: "OK" }]
      );
      return false;
    }
    return true;
  };

  // Toggle speed controls with animation
  const toggleSpeedControls = () => {
    Animated.timing(speedControlsAnim, {
      toValue: showSpeedControls ? 0 : 1,
      duration: 300,
      useNativeDriver: false,
    }).start();
    setShowSpeedControls(!showSpeedControls);
  };

  // Cleanup effects
  useEffect(() => {
    return () => {
      if (soundRef.current) soundRef.current.unloadAsync();
      if (recording) recording.stopAndUnloadAsync();
      if (recordingIntervalRef.current)
        clearInterval(recordingIntervalRef.current);
    };
  }, [recording]);

  // Initialize and load recordings
  useEffect(() => {
    const init = async () => {
      try {
        const {
          data: { user },
          error,
        } = await supabase.auth.getUser();
        if (user && !error) await loadUserRecordings(user.id);
      } catch (err) {
        setUploadError("Failed to load recordings");
      }
    };
    init();
  }, []);

  const loadUserRecordings = async (userId) => {
    try {
      const { data, error } = await supabase.storage
        .from("recordings")
        .list(`${userId}/`, {
          limit: MAX_RECORDINGS,
          sortBy: { column: "created_at", order: "desc" },
        });

      if (!error) {
        const recordings = await Promise.all(
          data.map(async (item) => ({
            id: item.name,
            uri: supabase.storage
              .from("recordings")
              .getPublicUrl(`${userId}/${item.name}`).data.publicUrl,
            name: item.name,
            created_at: item.created_at,
          }))
        );
        setRecordingsList(recordings);
      }
    } catch (err) {
      setUploadError("Error loading recordings");
    }
  };

  // Lyric scrolling logic
  const scrollToLyric = (index) => {
    if (!flatListRef.current || !lyrics || index < 0 || index >= lyrics.length)
      return;

    flatListRef.current.scrollToIndex({
      index,
      animated: true,
      viewPosition: 0.4,
    });
    setCurrentRecordingIndex(index);
  };

  // Recording pulse animation
  useEffect(() => {
    if (isRecording) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 0,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(0);
    }
  }, [isRecording]);

  // Auto-scroll during recording
  useEffect(() => {
    if (!isRecording || !lyrics?.length) return;

    let currentIndex = 0;
    scrollToLyric(currentIndex);

    const interval = setInterval(() => {
      if (++currentIndex < lyrics.length) scrollToLyric(currentIndex);
      else clearInterval(interval);
    }, scrollSpeed * 1000);

    recordingIntervalRef.current = interval;
    return () => clearInterval(interval);
  }, [isRecording, lyrics, scrollSpeed]);

  // Recording functions
  const startRecording = async () => {
    try {
      // Check recording limit before starting
      if (!checkRecordingLimit()) return;

      const { status } = await Audio.requestPermissionsAsync();
      if (status !== "granted")
        throw new Error("Microphone permission required");

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY
      );

      setRecording(recording);
      setIsRecording(true);
      setCurrentRecordingIndex(0);
      scrollToLyric(0);
    } catch (err) {
      setUploadError(err.message || "Recording failed to start");
    }
  };

  const stopRecording = async () => {
    setIsRecording(false);
    clearInterval(recordingIntervalRef.current);

    if (recording) {
      try {
        await recording.stopAndUnloadAsync();
        const uri = recording.getURI();
        if (uri) {
          setTempRecordingUri(uri);
          setShowSaveButton(true);
        }
      } catch (err) {
        setUploadError("Failed to stop recording");
      }
    }
    setRecording(null);
  };

  // Audio playback functions
  const playRecording = async (uri, id) => {
    try {
      if (soundRef.current) {
        const status = await soundRef.current.getStatusAsync();
        if (status.isPlaying) {
          if (currentlyPlayingId === id) {
            await soundRef.current.pauseAsync();
            setIsPlaying(false);
            setCurrentlyPlayingId(null);
            return;
          }
          await soundRef.current.unloadAsync();
        }
      }

      const { sound } = await Audio.Sound.createAsync(
        { uri },
        { shouldPlay: true }
      );
      soundRef.current = sound;
      setIsPlaying(true);
      setCurrentlyPlayingId(id);

      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.didJustFinish) {
          sound.unloadAsync();
          soundRef.current = null;
          setIsPlaying(false);
          setCurrentlyPlayingId(null);
        }
      });
    } catch (err) {
      setUploadError("Playback failed");
    }
  };

  // Save/upload functions
  const uploadRecording = async (fileUri) => {
    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (!user || userError) throw new Error("Not authenticated");

      const fileData = await FileSystem.readAsStringAsync(fileUri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      const fileName = `${
        name?.replace(/\s+/g, "_") || "recording"
      }_${Date.now()}.m4a`;
      const filePath = `${user.id}/${fileName}`;

      const { error } = await supabase.storage
        .from("recordings")
        .upload(filePath, decode(fileData), {
          contentType: "audio/m4a",
          onProgress: ({ loadedBytes, totalBytes }) => {
            setUploadProgress(Math.round((loadedBytes / totalBytes) * 100));
          },
        });

      if (error) throw error;

      return {
        publicUrl: supabase.storage.from("recordings").getPublicUrl(filePath)
          .data.publicUrl,
        fileName,
      };
    } catch (err) {
      throw err;
    }
  };

  const saveRecording = async () => {
    if (!tempRecordingUri) return;

    setUploadProgress(0);
    setShowSaveButton(false);

    try {
      const { publicUrl, fileName } = await uploadRecording(tempRecordingUri);
      setRecordedURI(publicUrl);
      setRecordingsList((prev) => [
        {
          id: fileName,
          uri: publicUrl,
          name: fileName,
          created_at: new Date().toISOString(),
        },
        ...prev.slice(0, MAX_RECORDINGS - 1),
      ]);
      setTempRecordingUri(null);
    } catch (err) {
      setUploadError(err.message || "Save failed");
      setShowSaveButton(true);
    } finally {
      setUploadProgress(0);
    }
  };

  const discardRecording = () => {
    Alert.alert("Discard Recording", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Discard",
        style: "destructive",
        onPress: () => {
          setTempRecordingUri(null);
          setShowSaveButton(false);
        },
      },
    ]);
  };

  const deleteRecording = async (fileName) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase.storage
        .from("recordings")
        .remove([`${user.id}/${fileName}`]);
      if (error) throw error;

      setRecordingsList((prev) =>
        prev.filter((item) => item.name !== fileName)
      );
      if (recordedURI?.includes(fileName)) setRecordedURI(null);
      if (currentlyPlayingId === fileName) {
        if (soundRef.current) await soundRef.current.unloadAsync();
        setIsPlaying(false);
        setCurrentlyPlayingId(null);
      }
    } catch (err) {
      setUploadError("Deletion failed");
    }
  };

  // Animations
  const pulseAnimation = {
    transform: [
      {
        scale: pulseAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [1, 1.2],
        }),
      },
    ],
    opacity: pulseAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [0.6, 1],
    }),
  };

  const speedControlsStyle = {
    height: speedControlsAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 80],
    }),
    opacity: speedControlsAnim,
  };

  // Components
  const LyricLine = memo(({ item, index }) => {
    const isCurrent = currentRecordingIndex === index;
    return (
      <View
        style={[
          tw`justify-center items-center mx-4 py-3`,
          isCurrent && tw`bg-white bg-opacity-10`,
        ]}
      >
        <Text
          style={[
            tw`text-center`,
            isCurrent
              ? tw`text-yellow-400 text-xl font-bold`
              : tw`text-white text-lg opacity-70`,
          ]}
        >
          {item.text}
        </Text>
      </View>
    );
  });

  const RecordingItem = ({ item }) => {
    const isPlaying = currentlyPlayingId === item.id;
    return (
      <View
        style={tw`flex-row justify-between items-center bg-gray-800 p-3 rounded mb-2`}
      >
        <View style={tw`flex-1`}>
          <Text style={tw`text-white`} numberOfLines={1}>
            {item.name.split("_").slice(0, -1).join("_")}
          </Text>
          <Text style={tw`text-gray-400 text-xs`}>
            {new Date(item.created_at).toLocaleString()}
          </Text>
        </View>
        <View style={tw`flex-row`}>
          <TouchableOpacity
            onPress={() => playRecording(item.uri, item.id)}
            style={tw`bg-blue-500 p-2 rounded mr-2`}
          >
            <Entypo
              name={isPlaying ? "controller-paus" : "controller-play"}
              size={16}
              color="white"
            />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => deleteRecording(item.name)}
            style={tw`bg-red-500 p-2 rounded`}
          >
            <Ionicons name="trash" size={16} color="white" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <FlatList
      data={[]}
      renderItem={null}
      ListHeaderComponent={
        <>
          <Animated.View
            style={[tw`p-3 rounded mb-3 items-center`, pulseAnimation]}
          >
            <Text style={tw`text-red-500 font-bold`}>
              {isRecording
                ? `Recording... (Line ${currentRecordingIndex + 1}/${
                    lyrics.length
                  })`
                : showSaveButton
                ? "Recording Complete"
                : "Ready to Record"}
            </Text>
          </Animated.View>

          {!isRecording && !showSaveButton && (
            <View style={tw`mx-4`}>
              <TouchableOpacity
                onPress={toggleSpeedControls}
                style={tw`flex-row items-center justify-center mb-2`}
              >
                <Text style={tw`text-white mr-2`}>Speed Controls</Text>
                <Entypo
                  name={showSpeedControls ? "chevron-up" : "chevron-down"}
                  size={20}
                  color="white"
                />
              </TouchableOpacity>

              <Animated.View style={[tw`overflow-hidden`, speedControlsStyle]}>
                <Text style={tw`text-white text-center mb-1`}>
                  Scroll Speed: {scrollSpeed}s per line
                </Text>
                <Slider
                  value={scrollSpeed}
                  onValueChange={setScrollSpeed}
                  minimumValue={1}
                  maximumValue={5}
                  step={0.5}
                  minimumTrackTintColor="#3B82F6"
                  maximumTrackTintColor="#E5E7EB"
                  thumbTintColor="#3B82F6"
                  style={tw`w-full h-8`}
                />
                <View style={tw`flex-row justify-between`}>
                  <Text style={tw`text-gray-400 text-xs`}>1s</Text>
                  <Text style={tw`text-gray-400 text-xs`}>3s</Text>
                  <Text style={tw`text-gray-400 text-xs`}>5s</Text>
                </View>
              </Animated.View>
            </View>
          )}

          {uploadError && (
            <Text style={tw`text-red-500 text-center my-2`}>{uploadError}</Text>
          )}

          <View style={tw`flex-row justify-center`}>
            {showSaveButton ? (
              <>
                <TouchableOpacity
                  onPress={saveRecording}
                  style={tw`bg-green-500 p-4 rounded-full mx-2`}
                >
                  <MaterialIcons name="save" size={24} color="white" />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={discardRecording}
                  style={tw`bg-red-500 p-4 rounded-full mx-2`}
                >
                  <MaterialIcons name="delete" size={24} color="white" />
                </TouchableOpacity>
                {tempRecordingUri && (
                  <TouchableOpacity
                    onPress={() =>
                      playRecording(tempRecordingUri, "current-recording")
                    }
                    style={tw`bg-purple-500 p-4 rounded-full mx-2`}
                  >
                    <Entypo
                      name={
                        isPlaying && currentlyPlayingId === "current-recording"
                          ? "controller-paus"
                          : "controller-play"
                      }
                      size={24}
                      color="white"
                    />
                  </TouchableOpacity>
                )}
              </>
            ) : (
              <>
                <TouchableOpacity
                  onPress={isRecording ? stopRecording : startRecording}
                  style={[
                    tw`p-4 rounded-full mx-2`,
                    isRecording
                      ? tw`bg-red-500`
                      : recordingsList.length >= MAX_RECORDINGS
                      ? tw`bg-gray-500`
                      : tw`bg-blue-500`,
                  ]}
                  disabled={
                    recordingsList.length >= MAX_RECORDINGS && !isRecording
                  }
                >
                  <Ionicons
                    name={isRecording ? "stop" : "mic"}
                    size={32}
                    color="white"
                  />
                </TouchableOpacity>
              </>
            )}
          </View>

          {uploadProgress > 0 && uploadProgress < 100 && (
            <View style={tw`mx-4 mb-4`}>
              <View style={tw`bg-gray-200 rounded-full h-2.5`}>
                <View
                  style={[
                    tw`bg-blue-500 h-2.5 rounded-full`,
                    { width: `${uploadProgress}%` },
                  ]}
                />
              </View>
              <Text style={tw`text-center text-xs mt-1`}>
                Uploading: {uploadProgress}%
              </Text>
            </View>
          )}
        </>
      }
      ListFooterComponent={
        recordingsList.length > 0 ? (
          <View style={tw`mt-4 mx-2`}>
            <Text style={tw`text-white font-bold mb-2`}>
              Your Recordings ({recordingsList.length}/{MAX_RECORDINGS})
              {recordingsList.length >= MAX_RECORDINGS && (
                <Text style={tw`text-red-500`}> - Limit Reached</Text>
              )}
            </Text>
            <FlatList
              data={recordingsList}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => <RecordingItem item={item} />}
              scrollEnabled={recordingsList.length > 3}
              style={tw`max-h-64`}
            />
          </View>
        ) : null
      }
      contentContainerStyle={tw`pb-10`}
      showsVerticalScrollIndicator={false}
    />
  );
};

RecordingComponent.propTypes = {
  lyrics: PropTypes.array,
  flatListRef: PropTypes.object,
  onClose: PropTypes.func.isRequired,
  name: PropTypes.string,
};

export default RecordingComponent;
