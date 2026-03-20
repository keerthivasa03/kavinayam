import React, {
  useEffect,
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
  SafeAreaView,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { Ionicons, Entypo, MaterialCommunityIcons } from "@expo/vector-icons";
import { Audio } from "expo-av";
import tw from "tailwind-react-native-classnames";
import Slider from "@react-native-community/slider";
import { useNavigation, useRoute } from "@react-navigation/native";
import AntDesign from "@expo/vector-icons/AntDesign";
import RecordingComponent from "../../Components/Record/RecordingComponent";

const { width, height } = Dimensions.get("window");

const UhchayaripuKaraoke = () => {
  const [sound, setSound] = useState(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(100);
  const [isLoading, setIsLoading] = useState(false);
  const [showRecordingUI, setShowRecordingUI] = useState(false);
  const [audioError, setAudioError] = useState(null);
  const [showMessage, setShowMessage] = useState(true);

  const intervalRef = useRef(null);
  const flatListRef = useRef(null);
  const scrollTimeoutRef = useRef(null);

  const route = useRoute();
  const { item } = route.params;
  const { lyrics, audio, name, id } = item;
  const navigation = useNavigation();

  const LINE_HEIGHT = id === "6" ? height * 0.135 : height * 0.08;
  const CONTAINER_HEIGHT = height * 0.55;

  const calculateScrollOffset = (index) => {
    const centerPosition = CONTAINER_HEIGHT / 2 - LINE_HEIGHT / 2;
    return Math.max(0, index * LINE_HEIGHT - centerPosition);
  };

  const handleStartRecording = async () => {
    // Stop the audio if it's playing
    if (sound && isPlaying) {
      await sound.pauseAsync();
      setIsPlaying(false);
    }
    setShowRecordingUI(true);
  };
  const parseColoredText = (text) => {
    const regex = /<(\w+)>(.*?)<\/\1>/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    const colorMap = {
      red: "#FF7276",
      green: "#4CAF50",
      blue: "#2196F3",
      yellow: "#FFD700",
      white: "#FFFFFF",
      black: "#000000",
    };

    while ((match = regex.exec(text)) !== null) {
      const [fullMatch, color, content] = match;
      const startIndex = match.index;

      if (startIndex > lastIndex) {
        parts.push({
          text: text.substring(lastIndex, startIndex),
          color: "#FFFFFF",
        });
      }

      parts.push({
        text: content,
        color: colorMap[color.toLowerCase()] || "#FFFFFF",
      });

      lastIndex = regex.lastIndex;
    }

    if (lastIndex < text.length) {
      parts.push({
        text: text.substring(lastIndex),
        color: "#FFFFFF",
      });
    }

    return parts;
  };
  useEffect(() => {
    console.log(name);

    return () => {
      if (sound) {
        sound.unloadAsync(); // This unloads the audio when the component unmounts
        clearInterval(intervalRef.current);
      }
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [sound]);
  const loadAndPlayAudio = async () => {
    try {
      if (!sound) {
        setIsLoading(true);
        const { sound: newSound, status } = await Audio.Sound.createAsync(
          audio
        );
        setSound(newSound);
        setDuration(status.durationMillis / 1000);
        await newSound.playAsync();
        setIsPlaying(true);
        setIsLoading(false);

        intervalRef.current = setInterval(async () => {
          const status = await newSound.getStatusAsync();
          if (status.isLoaded && status.isPlaying) {
            setCurrentTime(status.positionMillis / 1000);
          }
        }, 200);

        newSound.setOnPlaybackStatusUpdate(async (status) => {
          if (status.didJustFinish) {
            await newSound.setPositionAsync(0);
            await newSound.playAsync();
            setCurrentTime(0);
            setCurrentLineIndex(0);
          }
        });
      } else {
        const status = await sound.getStatusAsync();
        if (status.isPlaying) {
          await sound.pauseAsync();
          setIsPlaying(false);
        } else {
          await sound.playAsync();
          setIsPlaying(true);
        }
      }
    } catch (error) {
      console.error("Audio error:", error);
      setAudioError("Failed to play audio. Please try again.");
      setIsLoading(false);
    }
  };
  const handleBackPress = async () => {
    // Stop audio playback if it's playing
    if (sound) {
      await sound.stopAsync();
      await sound.unloadAsync();
      setSound(null);
      setIsPlaying(false);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }
    navigation.goBack();
  };
  useLayoutEffect(() => {
    const findCurrentLineIndex = () => {
      for (let i = 0; i < lyrics.length; i++) {
        const nextTime = i < lyrics.length - 1 ? lyrics[i + 1].time : Infinity;
        if (currentTime >= lyrics[i].time && currentTime < nextTime) {
          return i;
        }
      }
      return 0;
    };

    const index = findCurrentLineIndex();

    if (index !== -1 && index !== currentLineIndex) {
      setCurrentLineIndex(index);

      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }

      scrollTimeoutRef.current = setTimeout(() => {
        if (flatListRef.current) {
          const offset = calculateScrollOffset(index);
          flatListRef.current.scrollToOffset({
            offset,
            animated: true,
          });
        }
      }, 50);
    }
  }, [currentTime, lyrics]);

  const LyricLine = memo(({ item, index }) => {
    const nextTime =
      index < lyrics.length - 1 ? lyrics[index + 1].time : Infinity;
    const isCurrent = currentTime >= item.time && currentTime < nextTime;
    const parts = parseColoredText(item.text);

    return (
      <View
        style={[
          tw`justify-center w-full items-center`,
          { height: LINE_HEIGHT },
          isCurrent && {
            borderRadius: 10,
            width: width * 0.9,
          },
        ]}
      >
        <Text
          style={{
            fontSize: isCurrent ? height * 0.032 : height * 0.03,
            fontWeight: isCurrent ? "bold" : "normal",
            textAlign: "center",
            opacity: isCurrent ? 1 : 0.6,
            color: "#FFFFFF",
            paddingHorizontal: 10,
          }}
        >
          {parts.map((part, idx) => (
            <Text key={idx} style={{ color: part.color }}>
              {part.text}
            </Text>
          ))}
        </Text>
      </View>
    );
  });

  return (
    <SafeAreaView
      style={tw.style("flex-1 px-4 pt-2", { backgroundColor: "#D5C7A3" })}
    >
      <TouchableOpacity onPress={handleBackPress}>
        <AntDesign name="left" size={24} color="black" />
      </TouchableOpacity>

      <Text style={tw`text-center text-black text-lg font-bold mb-4`}>
        {item.title}
      </Text>

      {audioError && (
        <Text style={tw`text-red-500 text-center mb-2`}>{audioError}</Text>
      )}

      <View
        style={[
          tw`bg-opacity-90 rounded-2xl my-4`,
          {
            backgroundColor: "#2C2D2D",
            height: CONTAINER_HEIGHT,
          },
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
          contentContainerStyle={{
            paddingTop: 10,
            paddingBottom: 10,
          }}
          getItemLayout={(data, index) => ({
            length: LINE_HEIGHT,
            offset: LINE_HEIGHT * index,
            index,
          })}
          onScrollToIndexFailed={(info) => {
            const wait = new Promise((resolve) => setTimeout(resolve, 250));
            wait.then(() => {
              const offset = calculateScrollOffset(info.index);
              flatListRef.current?.scrollToOffset({
                offset,
                animated: true,
              });
            });
          }}
        />
      </View>
      {showMessage && (
        <View style={tw`absolute inset-0 z-50 justify-center items-center`}>
          {/* Semi-transparent overlay */}
          <View style={tw`absolute inset-0 bg-black opacity-70`} />

          {/* Message box */}
          <View
            style={tw`bg-black bg-opacity-80 rounded-2xl w-4/5 p-6 border border-gray-600`}
          >
            <Text style={tw`text-white text-center text-lg font-bold mb-4`}>
              விளக்கம
            </Text>
            <Text style={tw`text-white text-center text-lg`}>
              கவிதையில் உச்சரிப்பு (Pronunciation/Enunciation) என்பது ஒரு
              கவிதையின் சொற்கள் எவ்வாறு ஒலிக்கப்படுகின்றன என்பதைக் குறிக்கிறது.
              கவிதையில் உச்சரிப்பு என்பது வெறும் ஒலியமைப்பு மட்டுமல்ல, அது
              கவிதையின் உயிரோட்டத்தையும், அதன் உணர்வுபூர்வமான ஆழத்தையும்
              வெளிப்படுத்தும் ஒரு நுட்பமான கலை.
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
      {showRecordingUI ? (
        <RecordingComponent
          lyrics={lyrics}
          flatListRef={flatListRef}
          onClose={() => setShowRecordingUI(false)}
          name={name}
        />
      ) : (
        <>
          <View style={tw`border border-black mb-2`}>
            <View style={tw`flex-row`}>
              <View
                style={tw`flex-1 border-r border-black justify-center items-center p-1`}
              >
                <Text style={tw`text-black text-sm font-bold`}>ல,ள,ழ</Text>
              </View>
              <View
                style={[
                  tw`flex-1 justify-center items-center p-1`,
                  { backgroundColor: "red" },
                ]}
              >
                <Text style={tw`text-white text-sm font-bold`}>சிவப்பு</Text>
              </View>
            </View>
            <View style={tw`flex-row`}>
              <View
                style={tw`flex-1 border-t border-r border-black justify-center items-center p-1`}
              >
                <Text style={tw`text-black text-sm font-bold`}>ர,ற</Text>
              </View>
              <View
                style={[
                  tw`flex-1 border-t border-black justify-center items-center p-1`,
                  { backgroundColor: "blue" },
                ]}
              >
                <Text style={tw`text-white text-sm font-bold`}>நீலம்</Text>
              </View>
            </View>
            <View style={tw`flex-row`}>
              <View
                style={tw`flex-1 border-t border-r border-black justify-center items-center p-1`}
              >
                <Text style={tw`text-black text-sm font-bold`}>ந,ன,ண</Text>
              </View>
              <View
                style={[
                  tw`flex-1 border-t border-black justify-center items-center p-1`,
                  { backgroundColor: "#00E676" },
                ]}
              >
                <Text style={tw`text-white text-sm font-bold`}>பச்சை</Text>
              </View>
            </View>
          </View>

          <View style={tw`mt-2`}>
            <Slider
              style={{ width: "100%", height: 40 }}
              minimumValue={0}
              maximumValue={duration}
              value={currentTime}
              minimumTrackTintColor="#FF0000"
              maximumTrackTintColor="#000000"
              thumbTintColor="#FF0000"
              onSlidingComplete={async (value) => {
                if (sound) {
                  await sound.setPositionAsync(value * 1000);
                  setCurrentTime(value);
                }
              }}
            />
            <View style={tw`flex-row justify-between`}>
              <Text style={tw`text-xs text-black`}>
                {new Date(currentTime * 1000).toISOString().substr(14, 5)}
              </Text>
              <Text style={tw`text-xs text-black`}>
                {new Date(duration * 1000).toISOString().substr(14, 5)}
              </Text>
            </View>
          </View>

          <View style={tw`flex-row items-center justify-center`}>
            <TouchableOpacity
              style={tw`bg-white p-4 rounded-full shadow-md`}
              onPress={loadAndPlayAudio}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#000" />
              ) : (
                <Ionicons
                  name={isPlaying ? "pause" : "play"}
                  size={28}
                  color="#000"
                />
              )}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => handleStartRecording()}
              style={tw`bg-white p-4 rounded-full shadow-md ml-8`}
            >
              <Entypo name="mic" size={28} color="black" />
            </TouchableOpacity>

            <TouchableOpacity
              style={tw`bg-white p-3 rounded-full shadow-md ml-6`}
              disabled={isLoading}
              onPress={() => setShowMessage(!showMessage)}
            >
              <MaterialCommunityIcons
                name="android-messages"
                size={24}
                color={isLoading ? "#999" : "black"}
              />
            </TouchableOpacity>
          </View>
        </>
      )}
    </SafeAreaView>
  );
};

export default UhchayaripuKaraoke;
