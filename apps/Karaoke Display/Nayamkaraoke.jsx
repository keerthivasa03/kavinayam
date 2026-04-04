import React, { useEffect, useRef, useState, useLayoutEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Dimensions,
} from "react-native";
import {
  Ionicons,
  AntDesign,
  Entypo,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import { Image } from "react-native";
import { Video, ResizeMode } from "expo-av";
import Slider from "@react-native-community/slider";
import tw from "tailwind-react-native-classnames";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute } from "@react-navigation/native";
import RecordingComponent from "../../Components/Record/RecordingComponent";

const { height } = Dimensions.get("window");

const Nayamkaraoke = () => {
  const [currentTime, setCurrentTime] = useState(0);
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [showRecordingUI, setShowRecordingUI] = useState(false);
  const [showMessage, setShowMessage] = useState(true);

  const intervalRef = useRef(null);
  const flatListRef = useRef(null);
  const videoRef = useRef(null);

  const route = useRoute();
  const navigation = useNavigation();
  const { item } = route.params || {};

  const lyrics = item?.lyrics || [];

  // 🛑 SAFETY CHECK
  useEffect(() => {
    console.log("ITEM:", item);
    console.log("VIDEO PATH:", item?.videoPath);
  }, []);

  // 🎬 PLAY / PAUSE
  const loadAndPlayMedia = async () => {
    if (!videoRef.current) return;

    const status = await videoRef.current.getStatusAsync();

    if (status.isPlaying) {
      await videoRef.current.pauseAsync();
      clearInterval(intervalRef.current);
      setIsPlaying(false);
    } else {
      await videoRef.current.playAsync();
      setIsPlaying(true);
      startUpdatingCurrentTime();
    }
  };

  // ⏱ TIME SYNC
  const startUpdatingCurrentTime = () => {
    clearInterval(intervalRef.current);
    intervalRef.current = setInterval(async () => {
      if (!videoRef.current) return;

      const status = await videoRef.current.getStatusAsync();

      if (status.isLoaded) {
        setCurrentTime(status.positionMillis / 1000);

        if (status.durationMillis && duration === 0) {
          setDuration(status.durationMillis / 1000);
        }
      }
    }, 100);
  };

  // 🎯 SEEK
  const handleSeek = async (value) => {
    if (!videoRef.current) return;

    await videoRef.current.setPositionAsync(value * 1000);
    setCurrentTime(value);
  };

  // 📜 AUTO SCROLL
  useLayoutEffect(() => {
    if (!lyrics.length) return;

    const index = lyrics.findIndex(
      (line, i) =>
        currentTime >= line.time &&
        (i === lyrics.length - 1 || currentTime < lyrics[i + 1].time)
    );

    if (index !== -1 && index !== currentLineIndex) {
      setCurrentLineIndex(index);
      flatListRef.current?.scrollToIndex({
        index,
        viewPosition: 0.3,
        animated: true,
      });
    }
  }, [currentTime]);

  // 🎤 LYRIC LINE
  const LyricLine = ({ item, index }) => {
    const nextTime =
      index < lyrics.length - 1 ? lyrics[index + 1].time : Infinity;

    const isCurrent = currentTime >= item.time && currentTime < nextTime;

    return (
      <View style={tw`items-center my-3`}>
        <Text
          style={{
            fontSize: isCurrent ? 22 : 18,
            fontWeight: isCurrent ? "bold" : "normal",
            color: isCurrent ? "white" : "#DDDDDD",
            opacity: isCurrent ? 1 : 0.7,
            textAlign: "center",
          }}
        >
          {item.text}
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView
      style={tw.style("flex-1 px-4 pt-2", { backgroundColor: "#D5C7A3" })}
    >
      {/* 🔙 BACK */}
      <TouchableOpacity onPress={() => navigation.goBack()}>
        <AntDesign name="left" size={24} color="black" />
      </TouchableOpacity>

      {/* 🎵 TITLE */}
      <View style={tw`items-center mb-4`}>
        <Text style={tw`text-black font-bold text-xl`}>
          {item?.title || "No Title"}
        </Text>
      </View>

      {/* 🎬 VIDEO SAFE RENDER */}
      {!showRecordingUI && item?.videoPath ? (
        <View
          style={[
            tw`rounded-xl overflow-hidden mb-4`,
            { height: height * 0.3 },
          ]}
        >
          <Video
            ref={videoRef}
            style={tw`w-full h-full`}
            source={item.videoPath} // ✅ SAFE
            resizeMode={ResizeMode.COVER}
            isLooping
            useNativeControls={false}
            onPlaybackStatusUpdate={(status) => {
              if (status.isLoaded) {
                setCurrentTime(status.positionMillis / 1000);
                if (status.durationMillis) {
                  setDuration(status.durationMillis / 1000);
                }
              }
            }}
          />
        </View>
      ) : (
        <Text style={tw`text-center text-red-500`}>
          ⚠️ Video not found
        </Text>
      )}

      {/* 🎤 LYRICS */}
      <View
        style={[
          tw`bg-black bg-opacity-60 rounded-lg px-2 mb-4 justify-center`,
          { height: height * 0.35 },
        ]}
      >
        <FlatList
          ref={flatListRef}
          data={lyrics}
          keyExtractor={(_, index) => index.toString()}
          renderItem={({ item, index }) => (
            <LyricLine item={item} index={index} />
          )}
          showsVerticalScrollIndicator={false}
        />
      </View>

      {/* 🎚️ SLIDER */}
      <Slider
        minimumValue={0}
        maximumValue={duration}
        value={currentTime}
        minimumTrackTintColor="#FF0000"
        maximumTrackTintColor="#555"
        thumbTintColor="#FF0000"
        onSlidingComplete={handleSeek}
      />
{showMessage && (
        <View style={tw`absolute inset-0 z-50 justify-center items-center`}>
          {/* Semi-transparent overlay */}
          <View style={tw`absolute inset-0 bg-black opacity-70`} />

          {/* Message box */}
          <View
            style={tw`bg-black bg-opacity-80 rounded-2xl w-4/5 p-6 border border-gray-600`}
          >
            <Text style={tw`text-white text-center text-lg font-bold mb-4`}>
              விளக்கம்
            </Text>
            <Text style={tw`text-white text-center text-lg`}>
நயம் என்பது சொற்களை இனிமையாகவும் மென்மையாகவும் உச்சரிக்கும் திறன் ஆகும். குரல் மிதமான சுருதியில் இருந்து, ஒவ்வொரு சொல்லையும் தெளிவாகச் சொல்ல வேண்டும். சரியான இடைவெளியுடன் பேசுவதும், உணர்ச்சியுடன் சொற்களை வெளிப்படுத்துவதும் முக்கியம்.            </Text>
            <TouchableOpacity
              onPress={() => setShowMessage(false)}
              style={tw`mt-6 bg-white py-2 rounded-full`}
            >
              <Text style={tw`text-black text-center font-semibold`}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
      {/* 🎮 CONTROLS */}
      <View style={tw`flex-row justify-center mt-4`}>
  
  {/* PLAY / PAUSE */}
  <TouchableOpacity
    style={tw`bg-white p-3 rounded-full`}
    onPress={loadAndPlayMedia}
  >
    <Image
      source={
        isPlaying
          ? require("../../assets/icon image/pause.png")
          : require("../../assets/icon image/play.png")
      }
      style={{ width: 28, height: 28 }}
      resizeMode="contain"
    />
  </TouchableOpacity>

  {/* MIC */}
  <TouchableOpacity
    onPress={() => setShowRecordingUI(true)}
    style={tw`bg-white p-3 rounded-full ml-6`}
  >
    <Image
      source={require("../../assets/icon image/mic.png")}
      style={{ width: 24, height: 24 }}
      resizeMode="contain"
    />
  </TouchableOpacity>

  {/* MESSAGE */}
  <TouchableOpacity
    style={tw`bg-white p-3 rounded-full ml-6`}
    onPress={() => setShowMessage(!showMessage)}
  >
    <Image
      source={require("../../assets/icon image/message.png")}
      style={{ width: 24, height: 24 }}
      resizeMode="contain"
    />
  </TouchableOpacity>

</View>
    </SafeAreaView>
  );
};

export default Nayamkaraoke;