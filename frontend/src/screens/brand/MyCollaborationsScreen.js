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
  const [myPosts, setMyPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Fetch My Collaborations
  const fetchMyCollaborations = async (isRefresh = false) => {
    if (isRefresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }
    try {
      const response = await api.get("/collaborations/my");
      setMyPosts(response.data.collaborations);
    } catch (error) {
      Alert.alert(
        "Error",
        error.response?.data?.message || "Failed to fetch collaborations",
      );
    } finally {
      if (isRefresh) {
        setIsRefreshing(false);
      } else {
        setIsLoading(false);
      }
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchMyCollaborations();
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
        style={[
          globalStyles.row,
          { gap: 8, marginTop: 6, marginBottom: 10, flexWrap: "wrap" },
        ]}
      >
        {Array.isArray(item.platform) ? (
          item.platform.map((p) => (
            <View key={p} style={styles.tag}>
              <Text style={styles.tagText}>{p}</Text>
            </View>
          ))
        ) : (
          <View style={styles.tag}>
            <Text style={styles.tagText}>{item.platform}</Text>
          </View>
        )}
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

  // Empty State
  const EmptyState = () => (
    <View style={globalStyles.emptyContainer}>
      <Text style={styles.emptyEmoji}>📭</Text>
      <Text style={globalStyles.emptyText}>No collaborations yet</Text>
      <Text style={globalStyles.emptySubText}>
        Tap Create to post your first collaboration
      </Text>
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
          Manage your collaboration posts
        </Text>
      </View>

      {/* Explore Button */}
      <TouchableOpacity
        style={styles.exploreButton}
        onPress={() => navigation.navigate("Explore")}
        activeOpacity={0.8}
      >
        <Text style={styles.exploreButtonText}>
          🌍 Explore All Collaborations
        </Text>
      </TouchableOpacity>

      {/* My Posts List */}
      <FlatList
        data={myPosts}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => <MyPostCard item={item} />}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={() => fetchMyCollaborations(true)}
            colors={[colors.primary]}
          />
        }
        ListEmptyComponent={<EmptyState />}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  exploreButton: {
    marginHorizontal: 28,
    marginVertical: 16,
    backgroundColor: colors.primaryLight,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.primary,
  },
  exploreButtonText: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.primary,
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
  emptyEmoji: {
    fontSize: 48,
    marginBottom: 16,
  },
});

export default MyCollaborationsScreen;
