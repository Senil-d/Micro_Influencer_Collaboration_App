import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import api from "../../api/axios";
import { colors, globalStyles } from "../../utils/globalStyles";

const MyCollaborationsScreen = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState("myPosts");
  const [myPosts, setMyPosts] = useState([]);
  const [explorePosts, setExplorePosts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Fetch My Collaborations
  const fetchMyCollaborations = async () => {
    try {
      const response = await api.get("/collaborations/my");
      setMyPosts(response.data.collaborations);
    } catch (error) {
      Alert.alert(
        "Error",
        error.response?.data?.message || "Failed to fetch collaborations",
      );
    }
  };

  // Fetch All Collaborations
  const fetchAllCollaborations = async () => {
    try {
      const response = await api.get("/collaborations");
      setExplorePosts(response.data.collaborations);
    } catch (error) {
      Alert.alert(
        "Error",
        error.response?.data?.message || "Failed to fetch collaborations",
      );
    }
  };

  // Fetch All Data
  const fetchData = async (isRefresh = false) => {
    if (isRefresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }

    await Promise.all([fetchMyCollaborations(), fetchAllCollaborations()]);

    if (isRefresh) {
      setIsRefreshing(false);
    } else {
      setIsLoading(false);
    }
  };

  // Refresh on Screen Focus
  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, []),
  );

  // Delete Collaboration
  const handleDelete = (id) => {
    Alert.alert(
      "Delete Collaboration",
      "Are you sure you want to delete this collaboration? All applications under it will be removed too.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await api.delete(`/collaborations/${id}`);
              setMyPosts((prev) => prev.filter((item) => item._id !== id));
              Alert.alert("Success", "Collaboration deleted successfully");
            } catch (error) {
              Alert.alert(
                "Error",
                error.response?.data?.message || "Failed to delete",
              );
            }
          },
        },
      ],
    );
  };

  // Status Badge
  const StatusBadge = ({ status }) => (
    <View
      style={[
        globalStyles.badge,
        {
          backgroundColor: status === "open" ? "#E8F5E9" : "#FFEBEE",
        },
      ]}
    >
      <Text
        style={[
          globalStyles.badgeText,
          { color: status === "open" ? colors.success : colors.error },
        ]}
      >
        {status === "open" ? "Open" : "Closed"}
      </Text>
    </View>
  );

  // My Post Card
  const MyPostCard = ({ item }) => (
    <View style={globalStyles.card}>
      {/* Top Row */}
      <View
        style={[
          globalStyles.row,
          { justifyContent: "space-between", marginBottom: 10 },
        ]}
      >
        <StatusBadge status={item.status} />
        <Text style={styles.date}>
          {new Date(item.createdAt).toLocaleDateString()}
        </Text>
      </View>

      {/* Title */}
      <Text style={styles.cardTitle} numberOfLines={1}>
        {item.title}
      </Text>

      {/* Platform & Category */}
      <View
        style={[globalStyles.row, { gap: 8, marginTop: 6, marginBottom: 10 }]}
      >
        <View style={styles.tag}>
          <Text style={styles.tagText}>{item.platform}</Text>
        </View>
        <View style={styles.tag}>
          <Text style={styles.tagText}>{item.category}</Text>
        </View>
      </View>

      {/* Budget & Deadline */}
      <View
        style={[
          globalStyles.row,
          { justifyContent: "space-between", marginBottom: 14 },
        ]}
      >
        <Text style={styles.budget}>${item.budget}</Text>
        <Text style={styles.deadline}>
          Deadline: {new Date(item.deadline).toLocaleDateString()}
        </Text>
      </View>

      {/* Action Buttons */}
      <View style={[globalStyles.row, { gap: 10 }]}>
        <TouchableOpacity
          style={styles.applicantsButton}
          onPress={() =>
            navigation.navigate("Applicants", { collaborationId: item._id })
          }
        >
          <Text style={styles.applicantsButtonText}>View Applicants</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() =>
            navigation.navigate("EditCollaboration", { collaboration: item })
          }
        >
          <Text style={styles.editButtonText}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDelete(item._id)}
        >
          <Text style={styles.deleteButtonText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  // Explore other collaborations
  const ExploreCard = ({ item }) => (
    <TouchableOpacity
      style={globalStyles.card}
      onPress={() =>
        navigation.navigate("CollaborationDetail", {
          collaborationId: item._id,
        })
      }
      activeOpacity={0.8}
    >
      {/* Brand Name */}
      <TouchableOpacity
        onPress={() =>
          navigation.navigate("UserProfile", { userId: item.createdBy._id })
        }
      >
        <Text style={styles.brandName}>🏢 {item.createdBy.name}</Text>
      </TouchableOpacity>

      {/* Title */}
      <Text style={styles.cardTitle} numberOfLines={1}>
        {item.title}
      </Text>

      {/* Platform & Category */}
      <View
        style={[globalStyles.row, { gap: 8, marginTop: 6, marginBottom: 10 }]}
      >
        <View style={styles.tag}>
          <Text style={styles.tagText}>{item.platform}</Text>
        </View>
        <View style={styles.tag}>
          <Text style={styles.tagText}>{item.category}</Text>
        </View>
      </View>

      {/* Budget & Deadline */}
      <View style={[globalStyles.row, { justifyContent: "space-between" }]}>
        <Text style={styles.budget}>${item.budget}</Text>
        <Text style={styles.deadline}>
          Deadline: {new Date(item.deadline).toLocaleDateString()}
        </Text>
      </View>
    </TouchableOpacity>
  );

  // Empty State
  const EmptyState = ({ message, subMessage }) => (
    <View style={globalStyles.emptyContainer}>
      <Text style={globalStyles.emptyText}>{message}</Text>
      <Text style={globalStyles.emptySubText}>{subMessage}</Text>
    </View>
  );

  if (isLoading) {
    return (
      <View style={globalStyles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={globalStyles.container}>
      {/* Header */}
      <View style={globalStyles.screenHeader}>
        <Text style={globalStyles.screenTitle}>My Collaborations</Text>
        <Text style={globalStyles.screenSubtitle}>
          Manage your posts and explore others
        </Text>
      </View>

      {/* Tab Switcher */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === "myPosts" && styles.tabActive]}
          onPress={() => setActiveTab("myPosts")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "myPosts" && styles.tabTextActive,
            ]}
          >
            My Posts ({myPosts.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === "explore" && styles.tabActive]}
          onPress={() => setActiveTab("explore")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "explore" && styles.tabTextActive,
            ]}
          >
            Explore ({explorePosts.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      {activeTab === "myPosts" ? (
        <FlatList
          data={myPosts}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => <MyPostCard item={item} />}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={() => fetchData(true)}
              colors={[colors.primary]}
            />
          }
          ListEmptyComponent={
            <EmptyState
              message="No collaborations yet"
              subMessage="Tap Create to post your first collaboration"
            />
          }
        />
      ) : (
        <FlatList
          data={explorePosts}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => <ExploreCard item={item} />}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={() => fetchData(true)}
              colors={[colors.primary]}
            />
          }
          ListEmptyComponent={
            <EmptyState
              message="No collaborations found"
              subMessage="Check back later for new opportunities"
            />
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  tabContainer: {
    flexDirection: "row",
    backgroundColor: colors.surface,
    marginHorizontal: 28,
    marginVertical: 16,
    borderRadius: 12,
    padding: 4,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 10,
  },
  tabActive: {
    backgroundColor: colors.primary,
  },
  tabText: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.textSecondary,
  },
  tabTextActive: {
    color: colors.white,
  },
  listContent: {
    paddingHorizontal: 28,
    paddingBottom: 20,
    flexGrow: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.textPrimary,
    marginTop: 6,
  },
  brandName: {
    fontSize: 13,
    color: colors.primary,
    fontWeight: "600",
    marginBottom: 4,
  },
  tag: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  tagText: {
    fontSize: 11,
    color: colors.primary,
    fontWeight: "600",
  },
  budget: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  deadline: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  date: {
    fontSize: 12,
    color: colors.textMuted,
  },
  applicantsButton: {
    flex: 1,
    backgroundColor: colors.primaryLight,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: "center",
  },
  applicantsButtonText: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.primary,
  },
  editButton: {
    backgroundColor: colors.surface,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
  },
  editButtonText: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.textPrimary,
  },
  deleteButton: {
    backgroundColor: "#FFEBEE",
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignItems: "center",
  },
  deleteButtonText: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.error,
  },
});

export default MyCollaborationsScreen;
