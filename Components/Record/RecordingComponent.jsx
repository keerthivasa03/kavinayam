import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Animated,
  ActivityIndicator,
  Image,
} from "react-native";

import { Audio } from "expo-av";
import * as FileSystem from "expo-file-system/legacy";
import tw from "tailwind-react-native-classnames";
import { supabase } from "../../lib/supabase";
import PropTypes from "prop-types";
import { decode as atob } from "base-64";

const RecordingComponent = ({ lyrics = [], flatListRef, setShowRecordingUI,onClose, name }) => {
  const [recording, setRecording] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingsList, setRecordingsList] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentlyPlayingId, setCurrentlyPlayingId] = useState(null);
  const [showSaveButton, setShowSaveButton] = useState(false);
  const [tempRecordingUri, setTempRecordingUri] = useState(null);

  const soundRef = useRef(null);

  // 🔹 Load recordings
  useEffect(() => {
    const init = async () => {
      const { data } = await supabase.auth.getUser();
      const user = data?.user;

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
    if (recordingsList.length >= 10) {
    alert("You can only save up to 10 recordings.");
    return;
  }
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

  // ▶️ PLAY / PAUSE
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
    const { data } = await supabase.auth.getUser();
    const user = data?.user;

    const base64 = await FileSystem.readAsStringAsync(fileUri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    const arrayBuffer = Uint8Array.from(atob(base64), (c) =>
      c.charCodeAt(0)
    );

    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const fileName = `${name}${randomNum}.m4a`;
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
    const { data } = await supabase.auth.getUser();
    const user = data?.user;

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
      <TouchableOpacity
              onPress={() => setShowRecordingUI(false)}
              style={{
                position: "absolute",
                top: 10,
                right: 10,
                backgroundColor: "red",
                padding: 10,
                borderRadius: 20,
              }}
            >
              <Text style={{ color: "white" }}>X</Text>
            </TouchableOpacity>

      {/* 🎤 RECORD BUTTON */}
      <TouchableOpacity
        onPress={isRecording ? stopRecording : startRecording}
        style={tw`bg-blue-500 p-4 rounded-full self-center mb-4`}
      >
        <Image
          source={
            isRecording
              ? require("../../assets/icon image/pause.png")
              : require("../../assets/icon image/mic.png")
          }
          style={{ width: 30, height: 30, tintColor: "white" }}
        />
      </TouchableOpacity>

      {/* SAVE + PLAY */}
      {showSaveButton && (
        <View style={tw`flex-row justify-center mb-4`}>
          
          {/* SAVE */}
          <TouchableOpacity
            onPress={saveRecording}
            style={tw`bg-green-500 p-3 rounded-full mx-2`}
          >
            <Image
              source={require("../../assets/icon image/download.png")}
              style={{ width: 24, height: 24, tintColor: "white" }}
            />
          </TouchableOpacity>

          {/* PLAY / PAUSE */}
          <TouchableOpacity
            onPress={() => togglePlayPause(tempRecordingUri, "temp")}
            style={tw`bg-blue-500 p-3 rounded-full mx-2`}
          >
            <Image
              source={
                currentlyPlayingId === "temp" && isPlaying
                  ? require("../../assets/icon image/pause.png")
                  : require("../../assets/icon image/play.png")
              }
              style={{ width: 20, height: 20, tintColor: "white" }}
            />
          </TouchableOpacity>

          {/* DELETE */}
          <TouchableOpacity
            onPress={() => setShowSaveButton(false)}
            style={tw`bg-red-500 p-3 rounded-full mx-2`}
          >
            <Image
              source={require("../../assets/icon image/delete.png")}
              style={{ width: 20, height: 20, tintColor: "white" }}
            />
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
              
              {/* PLAY */}
              <TouchableOpacity
                onPress={() => togglePlayPause(item.uri, item.id)}
                style={tw`bg-blue-500 p-2 mr-2`}
              >
                <Image
                  source={
                    currentlyPlayingId === item.id && isPlaying
                      ? require("../../assets/icon image/pause.png")
                      : require("../../assets/icon image/play.png")
                  }
                  style={{ width: 16, height: 16, tintColor: "white" }}
                />
              </TouchableOpacity>

              {/* DELETE */}
              <TouchableOpacity
                onPress={() => deleteRecording(item.name)}
                style={tw`bg-red-500 p-2`}
              >
                <Image
                  source={require("../../assets/icon image/delete.png")}
                  style={{ width: 16, height: 16, tintColor: "white" }}
                />
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