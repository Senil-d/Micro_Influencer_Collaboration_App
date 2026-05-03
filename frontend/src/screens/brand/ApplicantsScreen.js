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
  Image,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import api from "../../api/axios";
import { colors, globalStyles } from "../../utils/globalStyles";

const ApplicantsScreen = ({ route, navigation }) => {
  const { collaborationId } = route.params;

  const [applicants, setApplicants] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Fetch Applicants
  const fetchApplicants = async (isRefresh = false) => {
    if (isRefresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }

    try {
      const response = await api.get(`/applications/collab/${collaborationId}`);
      setApplicants(response.data.applications);
    } catch (error) {
      Alert.alert(
        "Error",
        error.response?.data?.message || "Failed to fetch applicants",
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
      fetchApplicants();
    }, []),
  );

  // Status Badge
  const StatusBadge = ({ status }) => {
    const statusConfig = {
      pending: { bg: "#FFF8E1", color: colors.warning, label: "Pending" },
      accepted: { bg: "#E8F5E9", color: colors.success, label: "Accepted" },
      rejected: { bg: "#FFEBEE", color: colors.error, label: "Rejected" },
    };

    const config = statusConfig[status];

    return (
      <View style={[globalStyles.badge, { backgroundColor: config.bg }]}>
        <Text style={[globalStyles.badgeText, { color: config.color }]}>
          {config.label}
        </Text>
      </View>
    );
  };

  // Applicant Card
  const ApplicantCard = ({ item }) => {
    const influencer = item.influencerId;

    return (
      <TouchableOpacity
        style={globalStyles.card}
        onPress={() =>
          navigation.navigate("ApplicationDetail", { applicationId: item._id })
        }
        activeOpacity={0.8}
      >
        <View style={[globalStyles.row, { justifyContent: "space-between" }]}>
          {/* Left — Avatar + Info */}
          <View style={[globalStyles.row, { gap: 12, flex: 1 }]}>
            {/* Avatar */}
            {influencer.profileImage ? (
              <Image
                source={{ uri: influencer.profileImage }}
                style={styles.avatar}
              />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarPlaceholderText}>
                  {influencer.name.charAt(0).toUpperCase()}
                </Text>
              </View>
            )}

            {/* Name + Applied Date */}
            <View style={{ flex: 1 }}>
              <Text style={styles.name} numberOfLines={1}>
                {influencer.name}
              </Text>
              <Text style={styles.appliedAt}>
                Applied {new Date(item.appliedAt).toLocaleDateString()}
              </Text>
            </View>
          </View>

          {/* Right — Status Badge */}
          <StatusBadge status={item.status} />
        </View>

        {/* View Details hint */}
        <View style={styles.viewDetails}>
          <Text style={styles.viewDetailsText}>
            Tap to view full profile and application →
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  // Empty State
  const EmptyState = () => (
    <View style={globalStyles.emptyContainer}>
      <Text style={styles.emptyEmoji}>📭</Text>
      <Text style={globalStyles.emptyText}>No applicants yet</Text>
      <Text style={globalStyles.emptySubText}>
        Influencers who apply will appear here
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
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={globalStyles.screenTitle}>Applicants</Text>
        <Text style={globalStyles.screenSubtitle}>
          {applicants.length}{" "}
          {applicants.length === 1 ? "applicant" : "applicants"} found
        </Text>
      </View>

      {/* Filter Summary */}
      {applicants.length > 0 && (
        <View style={styles.filterSummary}>
          <Text style={styles.filterText}>
            ✅ Accepted:{" "}
            {applicants.filter((a) => a.status === "accepted").length}
          </Text>
          <Text style={styles.filterText}>
            ⏳ Pending:{" "}
            {applicants.filter((a) => a.status === "pending").length}
          </Text>
          <Text style={styles.filterText}>
            ❌ Rejected:{" "}
            {applicants.filter((a) => a.status === "rejected").length}
          </Text>
        </View>
      )}

      {/* Applicants List */}
      <FlatList
        data={applicants}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => <ApplicantCard item={item} />}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={() => fetchApplicants(true)}
            colors={[colors.primary]}
          />
        }
        ListEmptyComponent={<EmptyState />}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 28,
    paddingTop: 20,
    paddingBottom: 16,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    marginBottom: 12,
  },
  backText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: "600",
  },
  listContent: {
    paddingHorizontal: 28,
    paddingTop: 16,
    paddingBottom: 20,
    flexGrow: 1,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  avatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primaryLight,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarPlaceholderText: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.primary,
  },
  name: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.textPrimary,
    marginBottom: 4,
  },
  appliedAt: {
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
  filterSummary: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 12,
    paddingHorizontal: 28,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  filterText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: "600",
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: 16,
  },
});

export default ApplicantsScreen;
