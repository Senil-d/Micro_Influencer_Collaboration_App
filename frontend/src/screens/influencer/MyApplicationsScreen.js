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

const MyApplicationsScreen = ({ navigation }) => {
  const [applications, setApplications] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState("all");

  // Fetch Applications
  const fetchApplications = async (isRefresh = false) => {
    if (isRefresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }

    try {
      const response = await api.get("/applications/my");
      setApplications(response.data.applications);
    } catch (error) {
      Alert.alert(
        "Error",
        error.response?.data?.message || "Failed to fetch applications",
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
      fetchApplications();
    }, []),
  );

  // Filter Applications
  const filteredApplications = applications.filter((app) => {
    if (activeFilter === "all") return true;
    return app.status === activeFilter;
  });

  // Status Config
  const statusConfig = {
    pending: { bg: "#FFF8E1", color: colors.warning, label: "⏳ Pending" },
    accepted: { bg: "#E8F5E9", color: colors.success, label: "✅ Accepted" },
    rejected: { bg: "#FFEBEE", color: colors.error, label: "❌ Rejected" },
  };

  // Summary Counts
  const counts = {
    all: applications.length,
    pending: applications.filter((a) => a.status === "pending").length,
    accepted: applications.filter((a) => a.status === "accepted").length,
    rejected: applications.filter((a) => a.status === "rejected").length,
  };

  //  Application Card
  const ApplicationCard = ({ item }) => {
    const collab = item.collaborationId;
    const config = statusConfig[item.status];

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() =>
          navigation.navigate("ApplicationDetail", {
            applicationId: item._id,
          })
        }
        activeOpacity={0.8}
      >
        {/* Status Bar */}
        <View style={[styles.statusBar, { backgroundColor: config.bg }]}>
          <Text style={[styles.statusBarText, { color: config.color }]}>
            {config.label}
          </Text>
          <Text style={styles.appliedDate}>
            Applied{" "}
            {new Date(item.appliedAt).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </Text>
        </View>

        {/* Card Content */}
        <View style={styles.cardContent}>
          {/* Collaboration Title */}
          <Text style={styles.collabTitle} numberOfLines={1}>
            {collab.title}
          </Text>

          {/* Platform & Category Tags */}
          <View
            style={[
              globalStyles.row,
              { gap: 6, flexWrap: "wrap", marginTop: 8, marginBottom: 12 },
            ]}
          >
            {Array.isArray(collab.platform) ? (
              collab.platform.map((p) => (
                <View key={p} style={styles.tag}>
                  <Text style={styles.tagText}>{p}</Text>
                </View>
              ))
            ) : (
              <View style={styles.tag}>
                <Text style={styles.tagText}>{collab.platform}</Text>
              </View>
            )}
            <View style={styles.categoryTag}>
              <Text style={styles.categoryTagText}>{collab.category}</Text>
            </View>
          </View>

          {/* Budget & Deadline */}
          <View style={[globalStyles.row, { justifyContent: "space-between" }]}>
            <Text style={styles.budget}>${collab.budget}</Text>
            <Text style={styles.deadline}>
              Deadline:{" "}
              {new Date(collab.deadline).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </Text>
          </View>

          {/* View Details */}
          <View style={styles.viewDetails}>
            <Text style={styles.viewDetailsText}>
              Tap to view application details →
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  // Filter Tab
  const FilterTab = ({ filter, label }) => (
    <TouchableOpacity
      style={[
        styles.filterTab,
        activeFilter === filter && styles.filterTabActive,
      ]}
      onPress={() => setActiveFilter(filter)}
      activeOpacity={0.7}
    >
      <Text
        style={[
          styles.filterTabText,
          activeFilter === filter && styles.filterTabTextActive,
        ]}
      >
        {label} ({counts[filter]})
      </Text>
    </TouchableOpacity>
  );

  // Empty State
  const EmptyState = () => (
    <View style={globalStyles.emptyContainer}>
      <Text style={styles.emptyEmoji}>
        {activeFilter === "all"
          ? "📭"
          : activeFilter === "pending"
            ? "⏳"
            : activeFilter === "accepted"
              ? "✅"
              : "❌"}
      </Text>
      <Text style={globalStyles.emptyText}>
        {activeFilter === "all"
          ? "No applications yet"
          : `No ${activeFilter} applications`}
      </Text>
      <Text style={globalStyles.emptySubText}>
        {activeFilter === "all"
          ? "Explore collaborations and start applying"
          : "Check other filters for more applications"}
      </Text>
      {activeFilter === "all" && (
        <TouchableOpacity
          style={styles.exploreButton}
          onPress={() => navigation.navigate("Explore")}
        >
          <Text style={styles.exploreButtonText}>Explore Collaborations</Text>
        </TouchableOpacity>
      )}
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
        <Text style={globalStyles.screenTitle}>My Applications</Text>
        <Text style={globalStyles.screenSubtitle}>
          Track all your collaboration applications
        </Text>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        <FilterTab filter="all" label="All" />
        <FilterTab filter="pending" label="Pending" />
        <FilterTab filter="accepted" label="Accepted" />
        <FilterTab filter="rejected" label="Rejected" />
      </View>

      {/* Applications List */}
      <FlatList
        data={filteredApplications}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => <ApplicationCard item={item} />}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={() => fetchApplications(true)}
            colors={[colors.primary]}
          />
        }
        ListEmptyComponent={<EmptyState />}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  filterContainer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 8,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  filterTab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: "center",
    borderRadius: 20,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterTabActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterTabText: {
    fontSize: 11,
    fontWeight: "600",
    color: colors.textSecondary,
  },
  filterTabTextActive: {
    color: colors.white,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
    flexGrow: 1,
    gap: 14,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  statusBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  statusBarText: {
    fontSize: 12,
    fontWeight: "700",
  },
  appliedDate: {
    fontSize: 11,
    color: colors.textMuted,
  },
  cardContent: {
    padding: 16,
  },
  collabTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.textPrimary,
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
  categoryTag: {
    backgroundColor: "#F3F0FF",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  categoryTagText: {
    fontSize: 11,
    color: colors.primaryDark,
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
  viewDetails: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  viewDetailsText: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: "600",
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  exploreButton: {
    marginTop: 20,
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 28,
    alignItems: "center",
  },
  exploreButtonText: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.white,
  },
});

export default MyApplicationsScreen;
