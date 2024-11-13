import React, { useEffect, useState } from "react";
import {
  Button,
  StyleSheet,
  Text,
  View,
  Modal,
  ActivityIndicator,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useStravaAuth } from "./hooks/useStravaAuth";
import * as SecureStore from "expo-secure-store";
import { NavigationProp } from "@react-navigation/native";

interface LoginViewProps {
  navigation: NavigationProp<any>;
}

export default function LoginView({ navigation }: LoginViewProps) {
  const { initiateOAuth, token } = useStravaAuth();
  const [isTokenChecked, setIsTokenChecked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  // Check the token when the screen comes into focus (when navigating back)
  useEffect(() => {
    const checkTokenOnFocus = navigation.addListener("focus", async () => {
      const storedToken = await SecureStore.getItemAsync("strava_token");
      if (storedToken) {
        navigation.navigate("Activities");
      }
      setIsTokenChecked(true); // Mark that token has been checked
    });

    return checkTokenOnFocus; // Cleanup listener on component unmount
  }, [navigation]);

  // Handle initial check for token
  useEffect(() => {
    const checkToken = async () => {
      if (!isTokenChecked) {
        // Prevent rechecking if already checked
        const storedToken = await SecureStore.getItemAsync("strava_token");
        if (storedToken) {
          navigation.navigate("Activities");
        }
        setIsTokenChecked(true); // Mark token check as complete
      }
    };

    checkToken();
  }, [isTokenChecked, navigation]);

  const handleLoginPress = async () => {
    setLoading(true); // Show loading state
    initiateOAuth(); // Start OAuth process
  };

  useEffect(() => {
    const redirectToActivities = async () => {
      if (token) {
        // Ensure token exists before redirecting
        navigation.navigate("Activities");
        setLoading(false); // Hide loading state
        setModalVisible(true); // Show confirmation modal after navigation

        // Auto-dismiss the modal after 2 seconds
        setTimeout(() => {
          setModalVisible(false);
        }, 2000);
      }
    };

    redirectToActivities();
  }, [token, navigation]);

  return (
    <View style={styles.container}>
      {token ? (
        <>
          <Text style={styles.successText}>Already logged in</Text>
        </>
      ) : (
        <>
          <Text style={styles.infoText}>
            Sign in with your Strava Account to begin
          </Text>
          <Button title="Sign in with Strava" onPress={handleLoginPress} />
        </>
      )}

      {/* Loading Modal */}
      <Modal visible={loading} transparent={true} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ActivityIndicator size="large" color="#fff" />
            <Text style={styles.modalText}>Logging in...</Text>
          </View>
        </View>
      </Modal>

      {/* Confirmation Modal */}
      <Modal visible={modalVisible} transparent={true} animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalText}>
              You are logged in successfully!
            </Text>
          </View>
        </View>
      </Modal>

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
    padding: 20,
  },
  infoText: {
    fontSize: 18,
    color: "#333",
    marginBottom: 20,
    textAlign: "center",
  },
  successText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#4BB543",
    marginBottom: 20,
    textAlign: "center",
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.6)",
  },
  modalContent: {
    backgroundColor: "#333",
    padding: 30,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 250,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalText: {
    color: "#fff",
    fontSize: 16,
    marginTop: 20,
    textAlign: "center",
  },
});
