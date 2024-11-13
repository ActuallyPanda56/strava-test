import React, { useEffect, useState } from "react";
import { View, StyleSheet, Text, TouchableOpacity, Image } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { Ionicons } from "@expo/vector-icons";

type RootStackParamList = {
  Activities: undefined;
  Stats: undefined;
  Settings: undefined;
};

type NavigationProp = StackNavigationProp<RootStackParamList>;

export default function Navbar() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute();
  const [activePage, setActivePage] =
    useState<keyof RootStackParamList>("Activities");

  useEffect(() => {
    // Update activePage based on the current route name whenever the route changes
    setActivePage(route.name as keyof RootStackParamList);

    // Add a listener to update the active page when navigating between screens
    const unsubscribe = navigation.addListener("state", () => {
      const currentRoute = route.name as keyof RootStackParamList;
      setActivePage(currentRoute);
    });

    return unsubscribe; // Cleanup the listener
  }, [navigation, route]);

  const handleNavigation = (screen: keyof RootStackParamList) => {
    if (activePage !== screen) {
      setActivePage(screen);
      navigation.navigate(screen);
    }
  };

  const handleNavigateToSettings = () => {
    navigation.navigate("Settings");
  };

  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <Image
          source={{ uri: "https://via.placeholder.com/40" }}
          style={styles.profilePic}
        />
        <Text style={styles.navbarText}>Logo</Text>
        <TouchableOpacity onPress={handleNavigateToSettings}>
          <Ionicons name="settings-outline" size={30} color="black" />
        </TouchableOpacity>
      </View>

      <View style={styles.navbar}>
        <TouchableOpacity
          style={[
            styles.navButton,
            activePage === "Activities" && styles.activeButton,
          ]}
          onPress={() => handleNavigation("Activities")}
        >
          <Text style={styles.navButtonText}>Activities</Text>
        </TouchableOpacity>
        <View style={styles.separator} />
        <TouchableOpacity
          style={[
            styles.navButton,
            activePage === "Stats" && styles.activeButton,
          ]}
          onPress={() => handleNavigation("Stats")}
        >
          <Text style={styles.navButtonText}>Stats</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 10,
    paddingTop: 30,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: 10,
    paddingHorizontal: 10,
  },
  profilePic: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  navbarText: {
    color: "black",
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    flex: 1,
  },
  navbar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: "#ddd",
  },
  navButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    flex: 1,
    alignItems: "center",
  },
  navButtonText: {
    color: "black",
    fontSize: 16,
    fontWeight: "bold",
  },
  separator: {
    height: "100%",
    width: 1,
    backgroundColor: "#ddd",
  },
  activeButton: {
    borderBottomWidth: 2,
    borderBottomColor: "#FF7F32",
    shadowColor: "#000",
  },
});
