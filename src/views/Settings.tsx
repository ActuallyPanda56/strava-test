import React from "react";
import { StyleSheet, Text, View, TouchableOpacity } from "react-native";
import * as SecureStore from "expo-secure-store";
import { NavigationProp } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons"; // Import left arrow icon

interface SettingsProps {
  navigation: NavigationProp<any>;
}

export default function Settings({ navigation }: SettingsProps) {
  const handleLogOut = async () => {
    await SecureStore.deleteItemAsync("strava_token");
    await SecureStore.deleteItemAsync("strava_token_expiration");
    await SecureStore.deleteItemAsync("strava_refresh_token");

    // Optionally reset the navigation stack to clear previous screens
    navigation.reset({
      index: 0,
      routes: [{ name: "Login" }],
    });
  };

  return (
    <View style={styles.container}>
      {/* Back Button at top left */}
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="arrow-back" size={24} color="#4b6cb7" />
        <Text style={styles.backText}>Back</Text>
      </TouchableOpacity>

      <Text style={styles.header}>Settings</Text>
      <TouchableOpacity style={styles.logOutButton} onPress={handleLogOut}>
        <Text style={styles.logOutText}>Log out</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  backButton: {
    flexDirection: "row", // Align icon and text horizontally
    alignItems: "center", // Vertically center items
    position: "absolute", // Position it at the top left
    top: 30,
    left: 20,
    zIndex: 1, // Ensure it's above other content
  },
  backText: {
    marginLeft: 8, // Space between arrow and text
    fontSize: 18,
    color: "#4b6cb7",
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2d3748", // Dark text color
    marginBottom: 30,
  },
  logOutButton: {
    backgroundColor: "#FF7F32",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginTop: 20,
  },
  logOutText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});
