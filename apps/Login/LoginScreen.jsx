import { View, StatusBar, useColorScheme } from "react-native";
import React, { useState } from "react";
import Menu from "../../Components/Login/Menu";
import SignUp from "../../Components/Login/SignUp";
import SignIn from "../../Components/Login/SignIn";
import tw from "tailwind-react-native-classnames";
import { SafeAreaView } from "react-native-safe-area-context";

const LoginScreen = ({ navigation }) => {
  const [screen, setScreen] = useState(0); // 0: Menu, 1: SignUp, 2: SignIn
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const scheme = useColorScheme();

  return (
    <SafeAreaView edges={["top"]} style={tw.style("flex-1")}>
      <StatusBar
        barStyle={scheme === "dark" ? "light-content" : "dark-content"}
        backgroundColor={scheme === "dark" ? "#000" : "#fff"}
      />
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="light-content"
      />
      {screen === 0 && <Menu setScreen={setScreen} />}
      {screen === 1 && (
        <SignUp
          setScreen={setScreen}
          email={email}
          setEmail={setEmail}
          password={password}
          setPassword={setPassword}
        />
      )}
      {screen === 2 && (
        <SignIn
          setScreen={setScreen}
          email={email}
          setEmail={setEmail}
          password={password}
          setPassword={setPassword}
        />
      )}
    </SafeAreaView>
  );
};

export default LoginScreen;
