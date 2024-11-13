import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  Modal,
  Button,
} from "react-native";
import Activitieslayout from "./_layout";
import { useInfiniteQuery } from "react-query";
import { fetchActivities } from "../../utils/api/strava";
import { Activity } from "../../constants/strava";
import { useStravaAuth } from "../hooks/useStravaAuth";

export default function Activities() {
  const { token } = useStravaAuth();

  const [showModal, setShowModal] = useState(false);

  const {
    data,
    isLoading,
    isError,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
  } = useInfiniteQuery(
    ["activities", token],
    ({ pageParam = 1 }) => fetchActivities(pageParam),
    {
      getNextPageParam: (lastPage, pages) => {
        return lastPage.length === 20 ? pages.length + 1 : undefined;
      },
      staleTime: 1000 * 60 * 5,
      cacheTime: 1000 * 60 * 10,
      enabled: !!token,
      retry: false,
    }
  );

  // Check if the error is related to missing permissions and show the modal
  useEffect(() => {
    if (isError && error instanceof Error) {
      const errorMessage = error.message;
      // Log the error message to check the exact structure
      console.log("API Error:", errorMessage);

      if (
        errorMessage.includes("activity:read_permission") &&
        errorMessage.includes("missing")
      ) {
        setShowModal(true);
      }
    }
  }, [isError, error]);

  const handleLoadMore = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  const handleLoginAgain = () => {
    // Logic to log the user out and redirect to login page
    setShowModal(false); // Close the modal
    // You can implement additional logic to handle the re-login (e.g., resetting tokens)
  };

  if (isLoading) {
    return (
      <Activitieslayout>
        <ActivityIndicator size="large" color="#FF7F32" />
        <Text style={styles.loadingText}>Loading Activities...</Text>
      </Activitieslayout>
    );
  }

  if (isError) {
    return (
      <Activitieslayout>
        <Text style={styles.errorText}>
          Error: {error instanceof Error ? error.message : "Unknown error"}
        </Text>
      </Activitieslayout>
    );
  }

  const renderActivityItem = ({ item }: { item: Activity }) => (
    <View style={styles.activityCard}>
      <Text style={styles.activityTitle}>{item.name}</Text>
      <Text style={styles.activityDate}>
        Date: {new Date(item.start_date).toLocaleDateString()}
      </Text>
      <View style={styles.activityDetails}>
        <Text style={styles.detailText}>Distance: {item.distance} meters</Text>
        <Text style={styles.detailText}>Time: {item.moving_time} seconds</Text>
        <Text style={styles.detailText}>
          Elevation Gain: {item.total_elevation_gain} meters
        </Text>
      </View>
    </View>
  );

  return (
    <Activitieslayout>
      <FlatList
        data={data?.pages?.flat() || []} // Flatten pages to get all activities
        renderItem={renderActivityItem}
        keyExtractor={(item, index) => index.toString()}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={() => {
              refetch();
            }}
          />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.1}
        ListFooterComponent={
          isFetchingNextPage ? (
            <ActivityIndicator size="large" color="#FF7F32" />
          ) : hasNextPage ? (
            <Text style={styles.loadingText}>Loading more...</Text>
          ) : null
        }
        ListEmptyComponent={
          !isFetchingNextPage && data?.pages?.length === 0 ? (
            <Text style={styles.errorText}>No activities found</Text>
          ) : null
        }
        contentContainerStyle={styles.listContentContainer} // Ensure the content has enough padding and space
      />

      {/* Modal to prompt user to log in again */}
      <Modal
        visible={showModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalText}>
              Your session has expired. Please log in again to continue.
            </Text>
            <Button title="Log in Again" onPress={handleLoginAgain} />
          </View>
        </View>
      </Modal>
    </Activitieslayout>
  );
}

const styles = StyleSheet.create({
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#FF7F32",
    textAlign: "center",
  },
  errorText: {
    marginTop: 10,
    fontSize: 16,
    color: "red",
    textAlign: "center",
  },
  listContentContainer: {
    paddingBottom: 160, // Ensure space at the bottom for footer and cards
    paddingHorizontal: 10,
  },
  activityCard: {
    backgroundColor: "#fff",
    padding: 20,
    marginBottom: 15,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
    borderLeftWidth: 5,
    borderColor: "#FF7F32",
  },
  activityTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  activityDate: {
    fontSize: 14,
    color: "#777",
    marginBottom: 12,
  },
  activityDetails: {
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#eee",
    paddingTop: 10,
  },
  detailText: {
    fontSize: 15,
    color: "#555",
    lineHeight: 22,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    width: 300,
    padding: 20,
    backgroundColor: "#fff",
    borderRadius: 10,
    alignItems: "center",
  },
  modalText: {
    fontSize: 18,
    marginBottom: 20,
    textAlign: "center",
  },
});
