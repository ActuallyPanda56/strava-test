import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  Text,
  FlatList,
  Modal,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import Activitieslayout from "./_layout";
import { useQuery } from "react-query";
import { aggregateMonthlyData } from "../../utils/api/strava";
import { Activity } from "../../constants/strava";
import { useStravaAuth } from "../hooks/useStravaAuth";

export default function MonthlyActivities() {
  const { token } = useStravaAuth();
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);
  const [selectedMonthData, setSelectedMonthData] = useState<any>(null);

  const { data, isLoading, isError, error } = useQuery(
    ["monthlyActivities", token],
    () => aggregateMonthlyData(2),
    {
      staleTime: 1000 * 60 * 5,
      cacheTime: 1000 * 60 * 10,
      enabled: !!token,
      retry: false,
    }
  );

  const openModal = (monthData: string) => {
    filterActivities(monthData);
    setSelectedMonth(monthData);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedMonth(null);
    setSelectedMonthData(null);
  };

  const filterActivities = (month: string) => {
    if (!data) return;
    const monthData = data.monthsData.find((item) => item.month === month);
    setSelectedMonthData(monthData);
  };

  return (
    <Activitieslayout>
      <View style={styles.container}>
        <Text style={styles.title}>Last 3 Months Activities</Text>

        {isLoading && <Text>Loading...</Text>}

        {isError && (
          <Text style={styles.errorText}>
            Error: {error instanceof Error ? error.message : "Unknown error"}
          </Text>
        )}

        {data && (
          <FlatList
            data={data.monthlyAggregatedData}
            keyExtractor={(item) => item.month}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => {
                  openModal(item.month);
                }}
              >
                <View style={styles.activityCard}>
                  <Text style={styles.activityDate}>{item.month}</Text>
                  <Text style={styles.activityDetails}>
                    {item.data.totalDistance.toFixed()} m -{" "}
                    {item.data.totalTime} s - {item.data.totalElevationGain} m
                  </Text>
                </View>
              </TouchableOpacity>
            )}
          />
        )}
      </View>

      {/* Modal for displaying activity details */}
      {selectedMonth && (
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={closeModal}
        >
          <View style={styles.modalBackground}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>
                Activities in {selectedMonthData.month}
              </Text>
              <ScrollView style={styles.modalScroll}>
                {selectedMonthData.data.map(
                  (activity: Activity, index: number) => (
                    <View style={styles.activityCard} key={index}>
                      <Text style={styles.activityName}>{activity.name}</Text>
                      <Text style={styles.activityDate}>
                        Date: {activity.start_date_local.slice(0, 10)}
                      </Text>
                      <Text style={styles.activityDetails}>
                        Distance: {activity.distance} m
                      </Text>
                      <Text style={styles.activityDetails}>
                        Time: {activity.elapsed_time} s
                      </Text>
                      <Text style={styles.activityDetails}>
                        Elevation Gain: {activity.total_elevation_gain} m
                      </Text>
                    </View>
                  )
                )}
              </ScrollView>
              <TouchableOpacity onPress={closeModal} style={styles.closeButton}>
                <Text style={styles.closeButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}
    </Activitieslayout>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#f8f8f8",
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
    color: "#333",
  },
  activityCard: {
    backgroundColor: "#fff",
    padding: 20,
    marginVertical: 10,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
    borderLeftWidth: 5,
    borderColor: "#FF7F32", // Accent color similar to second style
  },
  activityDate: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  activityDetails: {
    fontSize: 16,
    color: "#555",
  },
  errorText: {
    marginTop: 10,
    fontSize: 16,
    color: "red",
    textAlign: "center",
  },

  // Modal styles
  modalBackground: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)", // Background overlay
  },
  modalContent: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 12,
    width: "80%",
    maxHeight: "80%",
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "600",
    color: "#333",
    marginBottom: 15,
    textAlign: "center",
  },
  modalScroll: {
    marginBottom: 15,
  },
  activityName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  closeButton: {
    backgroundColor: "#FF7F32", // Accent color
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  closeButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
});
