import React, {
  useRef,
  useState,
  useLayoutEffect,
  memo,
} from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import {
  Ionicons,
  AntDesign,
  Entypo,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import { Video, ResizeMode } from "expo-av";
import Slider from "@react-native-community/slider";
import tw from "tailwind-react-native-classnames";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute } from "@react-navigation/native";
import RecordingComponent from "../../Components/Record/RecordingComponent";

const { height } = Dimensions.get("window");

// 🎨 Color Map
const COLOR_MAP = {
  red: "#ff9999",
  green: "#4CAF50",
  blue: "#2196F3",
  orange: "#FFA500",
  lightgreen: "#90EE90",
};

// 🎨 Colored Text Parser
const ColoredText = memo(({ text }) => {
  const parts = [];
  let lastIndex = 0;
  const regex = /<(\w+)>(.*?)<\/\1>/g;
  let match;

  while ((match = regex.exec(text)) !== null) {
    const [full, tag, content] = match;

    if (match.index > lastIndex) {
      parts.push(
        <Text key={lastIndex} style={{ color: "#fff" }}>
          {text.substring(lastIndex, match.index)}
        </Text>
      );
    }

    parts.push(
      <Text key={match.index} style={{ color: COLOR_MAP[tag] || "#fff" }}>
        {content}
      </Text>
    );

    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    parts.push(
      <Text key={lastIndex} style={{ color: "#fff" }}>
        {text.substring(lastIndex)}
      </Text>
    );
  }

  return <Text>{parts}</Text>;
});

// 🎤 Lyric Line (UI like Nayamkaraoke)
const LyricLine = memo(({ item, index, currentTime, lyrics }) => {
  const nextTime =
    index < lyrics.length - 1 ? lyrics[index + 1].time : Infinity;

  const isCurrent = currentTime >= item.time && currentTime < nextTime;

  return (
    <View style={tw`items-center my-3`}>
      <Text
        style={{
          fontSize: isCurrent ? 22 : 18,
          fontWeight: isCurrent ? "bold" : "normal",
          color: isCurrent ? "#FFFFFF" : "#DDDDDD",
          opacity: isCurrent ? 1 : 0.7,
          textAlign: "center",
        }}
      >
        <ColoredText text={item.text} />
      </Text>
    </View>
  );
});

const Allkaraoke = () => {
  const [currentTime, setCurrentTime] = useState(0);
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [showRecordingUI, setShowRecordingUI] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showMessage, setShowMessage] = useState(true);

  const videoRef = useRef(null);
  const flatListRef = useRef(null);
  const intervalRef = useRef(null);

  const route = useRoute();
  const navigation = useNavigation();
  const { item } = route.params;

  const lyrics = item.lyrics;
  const videoPath = item.videoPath;

  // ▶️ Play / Pause
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

      intervalRef.current = setInterval(async () => {
        const s = await videoRef.current.getStatusAsync();
        if (s.isLoaded) {
          setCurrentTime(s.positionMillis / 1000);
        }
      }, 100);
    }
  };

  // 🎯 Seek
  const handleSeek = async (value) => {
    if (!videoRef.current) return;
    await videoRef.current.setPositionAsync(value * 1000);
    setCurrentTime(value);
  };

  // 📜 Auto Scroll
  useLayoutEffect(() => {
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
          {item.title}
        </Text>
      </View>

      {/* 🎬 VIDEO */}
      {!showRecordingUI && (
        <View
          style={[
            tw`rounded-xl overflow-hidden mb-4`,
            { height: height * 0.3 },
          ]}
        >
          <Video
            ref={videoRef}
            style={tw`w-full h-full`}
            source={videoPath} // ✅ LOCAL VIDEO
            resizeMode={ResizeMode.COVER}
            isLooping
            useNativeControls={false}
            onLoad={() => setIsLoading(false)}
            onPlaybackStatusUpdate={(status) => {
              if (status.isLoaded) {
                setCurrentTime(status.positionMillis / 1000);
                setDuration(status.durationMillis / 1000);
              }
            }}
          />

          {isLoading && (
            <ActivityIndicator
              style={tw`absolute self-center top-1/2`}
              color="#fff"
            />
          )}
        </View>
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
            <LyricLine
              item={item}
              index={index}
              currentTime={currentTime}
              lyrics={lyrics}
            />
          )}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={tw`pb-5`}
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
              நயம், தொனி, உச்சரிப்பு, வேகம் ஆகியவை நல்ல பேச்சின் முக்கிய அம்சங்களாகும். நயம் என்பது சொற்களை இனிமையாகவும் மென்மையாகவும் பேசுதல்; தொனி என்பது உணர்ச்சிக்கு ஏற்ப குரல் உயர்வு-தாழ்வை சரியாக மாற்றுதல்; உச்சரிப்பு என்பது ஒவ்வொரு சொல்லையும் தெளிவாகச் சொல்லுதல்; வேகம் என்பது மிக வேகமாகவோ மிக மெதுவாகவோ அல்லாமல் மிதமான அளவில் பேசுதல் ஆகும். இந்த நான்கு அம்சங்களையும் சரியாகப் பயன்படுத்தினால் பேச்சு தெளிவாகவும் கேட்பவரை ஈர்க்கும் விதமாகவும் இருக்கும்.
            </Text>
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
        <TouchableOpacity
          style={tw`bg-white p-3 rounded-full`}
          onPress={loadAndPlayMedia}
        >
          <Ionicons
            name={isPlaying ? "pause" : "play"}
            size={28}
            color="black"
          />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setShowRecordingUI(true)}
          style={tw`bg-white p-3 rounded-full ml-6`}
        >
          <Entypo name="mic" size={24} color="black" />
        </TouchableOpacity>

        <TouchableOpacity
          style={tw`bg-white p-3 rounded-full ml-6`}
          onPress={() => setShowMessage(!showMessage)}
        >
          <MaterialCommunityIcons
            name="message-text"
            size={24}
            color="black"
          />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default Allkaraoke;