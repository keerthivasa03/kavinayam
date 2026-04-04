import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Animated,
  Alert,
} from "react-native";
import { Ionicons, Entypo, MaterialIcons } from "@expo/vector-icons";
import { Audio } from "expo-av";
import * as FileSystem from "expo-file-system/legacy";
import tw from "tailwind-react-native-classnames";
import { supabase } from "../../lib/supabase";
import PropTypes from "prop-types";
import { decode as atob } from "base-64";
const RecordingComponent = ({ lyrics = [], flatListRef, onClose, name }) => {
  const [recording, setRecording] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingsList, setRecordingsList] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentlyPlayingId, setCurrentlyPlayingId] = useState(null);
  const [showSaveButton, setShowSaveButton] = useState(false);
  const [tempRecordingUri, setTempRecordingUri] = useState(null);

  const soundRef = useRef(null);
  const pulseAnim = useRef(new Animated.Value(0)).current;

  // 🔹 Load recordings
  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) loadUserRecordings(user.id);
    };
    init();
  }, []);

  const loadUserRecordings = async (userId) => {
    const { data } = await supabase.storage
      .from("recordings")
      .list(`${userId}/`);

    if (data) {
      const recordings = data.map((item) => ({
        id: item.name,
        uri: supabase.storage
          .from("recordings")
          .getPublicUrl(`${userId}/${item.name}`).data.publicUrl,
        name: item.name,
      }));
      setRecordingsList(recordings);
    }
  };

  // 🎤 RECORD
  const startRecording = async () => {
    const { status } = await Audio.requestPermissionsAsync();
    if (status !== "granted") return;

    await Audio.setAudioModeAsync({
      allowsRecordingIOS: true,
      playsInSilentModeIOS: true,
    });

    const { recording } = await Audio.Recording.createAsync(
      Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY
    );

    setRecording(recording);
    setIsRecording(true);
  };

  const stopRecording = async () => {
    setIsRecording(false);

    if (recording) {
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setTempRecordingUri(uri);
      setShowSaveButton(true);
      setRecording(null);
    }
  };

  // 🔥 PLAY / PAUSE (MAIN FIX)
  const togglePlayPause = async (uri, id) => {
    try {
      if (currentlyPlayingId === id && isPlaying) {
        await soundRef.current.pauseAsync();
        setIsPlaying(false);
        return;
      }

      if (currentlyPlayingId === id && !isPlaying) {
        await soundRef.current.playAsync();
        setIsPlaying(true);
        return;
      }

      if (soundRef.current) {
        await soundRef.current.unloadAsync();
      }

      const { sound } = await Audio.Sound.createAsync(
        { uri },
        { shouldPlay: true }
      );

      soundRef.current = sound;
      setCurrentlyPlayingId(id);
      setIsPlaying(true);

      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.didJustFinish) {
          setIsPlaying(false);
          setCurrentlyPlayingId(null);
        }
      });
    } catch (err) {
      console.log(err);
    }
  };

  // ☁️ UPLOAD
  const uploadRecording = async (fileUri) => {
  const { data: { user } } = await supabase.auth.getUser();

  // ✅ FIXED HERE
  const base64 = await FileSystem.readAsStringAsync(fileUri, {
    encoding: FileSystem.EncodingType.Base64,
  });

  const arrayBuffer = Uint8Array.from(atob(base64), c => c.charCodeAt(0));

  const fileName = `${Date.now()}.m4a`;
  const filePath = `${user.id}/${fileName}`;

  await supabase.storage
    .from("recordings")
    .upload(filePath, arrayBuffer, {
      contentType: "audio/m4a",
    });

  const publicUrl = supabase.storage
    .from("recordings")
    .getPublicUrl(filePath).data.publicUrl;

  return { publicUrl, fileName };
};

  // 💾 SAVE
  const saveRecording = async () => {
    const { publicUrl, fileName } = await uploadRecording(tempRecordingUri);

    setRecordingsList((prev) => [
      { id: fileName, uri: publicUrl, name: fileName },
      ...prev,
    ]);

    setShowSaveButton(false);
    setTempRecordingUri(null);
  };

  // ❌ DELETE
  const deleteRecording = async (fileName) => {
    const { data: { user } } = await supabase.auth.getUser();

    await supabase.storage
      .from("recordings")
      .remove([`${user.id}/${fileName}`]);

    setRecordingsList((prev) =>
      prev.filter((item) => item.name !== fileName)
    );
  };

  // 🔥 CLEANUP
  useEffect(() => {
    return () => {
      if (soundRef.current) {
        soundRef.current.unloadAsync();
      }
    };
  }, []);

  return (
    <View style={tw`flex-1 p-4`}>
      <Text style={tw`text-white text-center mb-3`}>
        {isRecording ? "Recording..." : "Ready"}
      </Text>

      {/* RECORD BUTTON */}
      <TouchableOpacity
        onPress={isRecording ? stopRecording : startRecording}
        style={tw`bg-blue-500 p-4 rounded-full self-center mb-4`}
      >
        <Ionicons
          name={isRecording ? "stop" : "mic"}
          size={30}
          color="white"
        />
      </TouchableOpacity>

      {/* SAVE + PLAY TEMP */}
      {showSaveButton && (
        <View style={tw`flex-row justify-center mb-4`}>
          <TouchableOpacity
            onPress={saveRecording}
            style={tw`bg-green-500 p-3 rounded-full mx-2`}
          >
            <MaterialIcons name="save" size={24} color="white" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => togglePlayPause(tempRecordingUri, "temp")}
            style={tw`bg-blue-500 p-3 rounded-full mx-2`}
          >
            <Entypo
              name={
                currentlyPlayingId === "temp" && isPlaying
                  ? "controller-paus"
                  : "controller-play"
              }
              size={20}
              color="white"
            />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setShowSaveButton(false)}
            style={tw`bg-red-500 p-3 rounded-full mx-2`}
          >
            <MaterialIcons name="delete" size={24} color="white" />
          </TouchableOpacity>
        </View>
      )}

      {/* RECORDINGS LIST */}
      <FlatList
        data={recordingsList}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={tw`flex-row justify-between bg-gray-800 p-3 mb-2`}>
            <Text style={tw`text-white`}>{item.name}</Text>

            <View style={tw`flex-row`}>
              <TouchableOpacity
                onPress={() => togglePlayPause(item.uri, item.id)}
                style={tw`bg-blue-500 p-2 mr-2`}
              >
                <Entypo
                  name={
                    currentlyPlayingId === item.id && isPlaying
                      ? "controller-paus"
                      : "controller-play"
                  }
                  size={16}
                  color="white"
                />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => deleteRecording(item.name)}
                style={tw`bg-red-500 p-2`}
              >
                <Ionicons name="trash" size={16} color="white" />
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
    </View>
  );
};

RecordingComponent.propTypes = {
  lyrics: PropTypes.array,
  flatListRef: PropTypes.object,
  onClose: PropTypes.func,
  name: PropTypes.string,
};

export default RecordingComponent;