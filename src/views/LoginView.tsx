import React, { useEffect } from "react";
import { Button, StyleSheet, Text, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { useStravaAuth } from "./hooks/useStravaAuth";
import * as SecureStore from "expo-secure-store";

import { NavigationProp } from "@react-navigation/native";

interface LoginViewProps {
  navigation: NavigationProp<any>;
}

export default function LoginView({ navigation }: LoginViewProps) {
  const { initiateOAuth, token } = useStravaAuth();

  // Navigate to Activities if token exists after render
  useEffect(() => {
    if (token) {
      navigation.navigate("Activities");
    }
  }, [token, navigation]);

  const handleDeleteToken = async () => {
    await SecureStore.deleteItemAsync("strava_token");
    await SecureStore.deleteItemAsync("strava_token_expiration");
    await SecureStore.deleteItemAsync("strava_refresh_token");
  };

  return (
    <View style={styles.container}>
      {token ? (
        <>
          <Text>Token: {token}</Text>
          <Button title="Log out" onPress={handleDeleteToken} />
        </>
      ) : (
        <>
          <Text>Sign in with your Strava Account to begin</Text>
          <Button title="Sign in with Strava" onPress={initiateOAuth} />
        </>
      )}
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
