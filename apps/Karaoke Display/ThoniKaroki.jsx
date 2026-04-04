import React, { useEffect, useRef, useState, useLayoutEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,

  Dimensions,
  ActivityIndicator,
} from "react-native";
import { Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Ionicons,
  FontAwesome5,
  Entypo,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import { Audio } from "expo-audio";
import tw from "tailwind-react-native-classnames";
import Slider from "@react-native-community/slider";
import { useNavigation, useRoute } from "@react-navigation/native";
import AntDesign from "@expo/vector-icons/AntDesign";
import RecordingComponent from "../../Components/Record/RecordingComponent";

const { width, height } = Dimensions.get("window");

const ThoniKaraoke = () => {
  const [sound, setSound] = useState(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(100);
  const [showMessage, setShowMessage] = useState(true);

  const intervalRef = useRef(null);
  const flatListRef = useRef(null);
  const scrollTimeoutRef = useRef(null);
  const route = useRoute();
  const { item } = route.params;
  const lyrics = item.lyrics;
  const audio = item.audio;
  const title = item.title;
  const name = item.name;
  const navigation = useNavigation();
  const [isLoading, setIsLoading] = useState(false);
  const [showRecordingUI, setShowRecordingUI] = useState(false);

  const calculateViewPosition = (lyricsLength) => {
    if (title === "அழகின் சிரிப்பு") return 0.5;
    if (title === "தைத்தாய்க்கு வணக்கம்") return 0.8;
    return 0.5; // Default value
  };

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
      setIsLoading(false);
    }
  };

  const handleStartRecording = async () => {
    // Stop the audio if it's playing
    if (sound && isPlaying) {
      await sound.pauseAsync();
      setIsPlaying(false);
    }
    setShowRecordingUI(true);
  };

  useEffect(() => {
    console.log(name);

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

  const LyricLine = ({ item, index }) => {
    const nextTime =
      index < lyrics.length - 1 ? lyrics[index + 1].time : Infinity;
    const isCurrent = currentTime >= item.time && currentTime < nextTime;
    const arrowIcon = item.direction === "up" ? "arrow-up" : "arrow-down";
    const arrowColor = item.direction === "up" ? "#00FF00" : "#FF7276";

    return (
      <View style={[tw`flex-row justify-center items-center mb-1 mx-4 pb-4`]}>
        <FontAwesome5
          name={arrowIcon}
          size={24}
          color={arrowColor}
          style={tw`mr-2`}
        />
        <Text
          style={{
            fontSize: isCurrent ? height * 0.025 : height * 0.02,
            fontWeight: isCurrent ? "bold" : "normal",
            color: isCurrent ? arrowColor : "#DDDDDD",
            textAlign: "center",
            padding: 4,
            opacity: isCurrent ? 1 : 0.7,
          }}
        >
          {item.text}
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
          { backgroundColor: "#2C2D2D", height: height * 0.55 },
        ]}
      >
        <FlatList
          ref={flatListRef}
          data={lyrics}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item, index }) => (
            <LyricLine item={item} index={index} />
          )}
          showsVerticalScrollIndicator={false}
          initialNumToRender={10}
          maxToRenderPerBatch={5}
          windowSize={11}
          getItemLayout={(data, index) => ({
            length: 0,
            offset: 70 * index,
            index,
          })}
          onScrollToIndexFailed={(info) => {
            const wait = new Promise((resolve) => setTimeout(resolve, 500));
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
              விளக்கம்
            </Text>
            <Text style={tw`text-white text-center text-lg`}>
              ஒரு கவிதையை எழுதிய கவிஞரின் மனப்பாங்கு, உணர்வு அல்லது மனநிலை
              ஆகும். கவிஞர் ஒரு தகவலை அல்லது நிகழ்ச்சியினைக் குறித்து என்ன
              நினைக்கிறார் அல்லது எப்படி உணர்கிறார் என்பதை இது
              வெளிப்படுத்துகிறது. இது மகிழ்ச்சியாக, சோகமாக, கிண்டலாக, கோபமாக,
              அமைதியாக, அல்லது வியப்புடன் இருக்கலாம். தொனி என்பது கவிதையின்
              ஒட்டுமொத்த உணர்வுபூர்வமான சாயலை வாசகருக்கு ஏற்ற
              இறக்கத்துடன் வழங்குகிறது.
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
              <FontAwesome5
                name="arrow-up"
                size={24}
                color="#00FF00"
                style={tw`mr-2`}
              />
              <Text style={[tw`text-lg font-bold`, { color: "#00FF00" }]}>
                ஏற்றம்
              </Text>
            </View>
            <View style={tw`flex-row`}>
              <FontAwesome5
                name="arrow-down"
                size={24}
                color="#FF7276"
                style={tw`mr-2`}
              />
              <Text style={[tw`text-lg font-bold`, { color: "#FF7276" }]}>
                இறக்கம்
              </Text>
            </View>
          </View>

          <View style={tw`mt-2 px-2`}>
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

          <View style={tw`flex-row justify-center mt-4`}>
  
  {/* PLAY / PAUSE */}
  <TouchableOpacity
    style={tw`bg-white p-3 rounded-full`}
    onPress={loadAndPlayAudio}
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
        </>
      )}
    </SafeAreaView>
  );
};

export default ThoniKaraoke;
