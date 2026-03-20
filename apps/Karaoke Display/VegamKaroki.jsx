import React, { useEffect, useRef, useState, useLayoutEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { Entypo, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { Audio } from "expo-av";
import tw from "tailwind-react-native-classnames";
import Slider from "@react-native-community/slider";
import { useNavigation, useRoute } from "@react-navigation/native";
import AntDesign from "@expo/vector-icons/AntDesign";
import RecordingComponent from "../../Components/Record/RecordingComponent";

const { width, height } = Dimensions.get("window");

const PronunciationKaroki = () => {
  const [sound, setSound] = useState(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(100);
  const intervalRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showRecordingUI, setShowRecordingUI] = useState(false);
  const [showMessage, setShowMessage] = useState(true);

  const flatListRef = useRef(null);
  const scrollTimeoutRef = useRef(null);
  const route = useRoute();
  const { item } = route.params;
  const lyrics = item.lyrics;
  const audio = item.audio;
  const name = item.name;
  const navigation = useNavigation();

  const calculateViewPosition = (lyricsLength) => {
    if (lyricsLength <= 10) return 0.4;
    if (lyricsLength <= 20) return 0.3;
    return 0.2;
  };

  const loadAndPlayAudio = async () => {
    try {
      if (!sound) {
        const { sound: newSound, status } = await Audio.Sound.createAsync(
          audio
        );
        setSound(newSound);
        setDuration(status.durationMillis / 1000);
        await newSound.playAsync();
        setIsPlaying(true);

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
    }
  };

  useEffect(() => {
    return () => {
      if (sound) {
        sound.unloadAsync();
        clearInterval(intervalRef.current);
      }
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [sound]);

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
        flatListRef.current?.scrollToIndex({
          index,
          viewPosition: calculateViewPosition(lyrics.length),
          animated: true,
        });
      }, 50);
    }
  }, [currentTime, lyrics]);

  const handleStartRecording = async () => {
    // Stop the audio if it's playing
    if (sound && isPlaying) {
      await sound.pauseAsync();
      setIsPlaying(false);
    }
    setShowRecordingUI(true);
  };
  const LyricLine = ({ item, index }) => {
    const nextTime =
      index < lyrics.length - 1 ? lyrics[index + 1].time : Infinity;
    const isCurrent = currentTime >= item.time && currentTime < nextTime;

    return (
      <View
        style={[
          tw`justify-center items-center mx-4 py-3`,
          {
            minHeight: 80,

            borderRadius: 8,
            marginVertical: 2,
          },
        ]}
      >
        <Text
          style={{
            fontSize: isCurrent ? height * 0.03 : height * 0.024,
            fontWeight: isCurrent ? "800" : "400",
            color: "#FFFFFF",
            textAlign: "center",
            lineHeight: height * 0.035,
            opacity: isCurrent ? 1 : 0.7,
          }}
        >
          {item.text}
          <MaterialCommunityIcons
            name="slash-forward"
            size={24}
            color="red"
            style={{
              fontSize: isCurrent ? height * 0.04 : height * 0.024,
              fontWeight: isCurrent ? "600" : "400",
              lineHeight: height * 0.035,
              opacity: isCurrent ? 1 : 0.7,
            }}
          />
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView
      style={tw.style("flex-1 px-4", { backgroundColor: "#D5C7A3" })}
    >
      <TouchableOpacity onPress={() => navigation.goBack()}>
        <AntDesign name="left" size={24} color="black" style={tw`mt-5`} />
      </TouchableOpacity>

      <Text style={tw`text-center text-black text-lg font-bold mb-4`}>
        {item.title}
      </Text>

      <View
        style={[
          tw`bg-opacity-90 rounded-2xl p-4 mb-4`,
          { backgroundColor: "#2C2D2D", height: height * 0.5 },
        ]}
      >
        <FlatList
          ref={flatListRef}
          data={lyrics}
          keyExtractor={(item, index) => `${item.time}-${index}`}
          renderItem={({ item, index }) => (
            <LyricLine item={item} index={index} />
          )}
          showsVerticalScrollIndicator={false}
          initialNumToRender={15}
          maxToRenderPerBatch={10}
          windowSize={21}
          getItemLayout={(data, index) => ({
            length: 80,
            offset: 80 * index,
            index,
          })}
          contentContainerStyle={{
            paddingBottom: height * 0.3,
            paddingTop: 10,
          }}
          onScrollToIndexFailed={(info) => {
            const wait = new Promise((resolve) => setTimeout(resolve, 250));
            wait.then(() => {
              flatListRef.current?.scrollToIndex({
                index: info.index,
                animated: true,
                viewPosition: calculateViewPosition(lyrics.length),
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
              கவிதையில் வேகம் (Rhythm or Pace) என்பது ஒரு கவிதையின் வரிகள்,
              சொற்கள், ஒலிகள் ஆகியவற்றை உருவாக்கும் ஓசை நயத்தையும், அது நகரும்
              தன்மையையும் குறிக்கிறது. வாசிப்போர் எவ்விடத்தில் வேகமாகவும்,
              மெதுவாகவும் வாசிக்க வேண்டுமென்பதைக் கருத்தில் கொள்ள வேண்டும். ஒரு
              கவிதையின் உணர்வு, பொருள், ஒட்டுமொத்த தாக்கத்தை வாசகருக்கு
              இக்கூறு கடத்துகிறது
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
          <View
            style={[
              tw`flex justify-center items-center w-full rounded-3xl`,
              { backgroundColor: "#2C2D2D", paddingVertical: height * 0.015 },
            ]}
          >
            <View style={tw`flex-row`}>
              <Text style={tw`text-red-400 text-center`}>
                <Text style={tw`text-red-100 font-bold text-xl `}>/</Text>{" "}
                வாசிக்கும் பொழுது இக்குறியீடு இருக்கும் இடங்களில் நிறுத்தி
                அதனைப் பின்பற்றி வாசிக்கவும்.
              </Text>
            </View>
          </View>

          <View style={tw`mt-8 px-2`}>
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
              <Text style={tw`text-xs text-white`}>
                {new Date(currentTime * 1000).toISOString().substr(14, 5)}
              </Text>
              <Text style={tw`text-xs text-white`}>
                {new Date(duration * 1000).toISOString().substr(14, 5)}
              </Text>
            </View>
          </View>

          <View style={tw`flex-row items-center justify-center `}>
            <TouchableOpacity
              style={tw`bg-white p-3 rounded-full shadow-md`}
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
              style={tw`bg-white p-3 rounded-full shadow-md ml-6`}
            >
              <Entypo name="mic" size={24} color="black" />
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

export default PronunciationKaroki;
