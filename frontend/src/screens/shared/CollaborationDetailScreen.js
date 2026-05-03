import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Image,
  Linking,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { useAuth } from "../../context/AuthContext";
import api from "../../api/axios";
import { colors, globalStyles } from "../../utils/globalStyles";

const CollaborationDetailScreen = ({ route, navigation }) => {
  const { collaborationId } = route.params;
  const { user } = useAuth();

  const [collaboration, setCollaboration] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);

  // Fetch Collaboration by id
  const fetchCollaboration = async () => {
    setIsLoading(true);
    try {
      const response = await api.get(`/collaborations/${collaborationId}`);
      setCollaboration(response.data.collaboration);

      // Check if influencer already applied
      if (user.role === "influencer") {
        const applicationsResponse = await api.get("/applications/my");
        const applied = applicationsResponse.data.applications.some(
          (app) => app.collaborationId._id === collaborationId,
        );
        setHasApplied(applied);
      }
    } catch (error) {
      Alert.alert(
        "Error",
        error.response?.data?.message || "Failed to fetch collaboration",
      );
    } finally {
      setIsLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchCollaboration();
    }, []),
  );

  // Open Link
  const openLink = async (url) => {
    if (!url) return;
    const supported = await Linking.canOpenURL(url);
    if (supported) {
      await Linking.openURL(url);
    } else {
      Alert.alert("Error", "Cannot open this link");
    }
  };

  if (isLoading) {
    return (
      <View style={globalStyles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!collaboration) return null;

  const brand = collaboration.createdBy;
  const isDeadlinePassed = new Date(collaboration.deadline) < new Date();

  return (
    <View style={globalStyles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Back Button */}
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>

        {/* Collaboration Image */}
        {collaboration.imageUrl ? (
          <Image
            source={{ uri: collaboration.imageUrl }}
            style={styles.image}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Text style={styles.imagePlaceholderEmoji}>
              {collaboration.category === "Fashion"
                ? "👗"
                : collaboration.category === "Food"
                  ? "🍔"
                  : collaboration.category === "Tech"
                    ? "💻"
                    : collaboration.category === "Fitness"
                      ? "💪"
                      : collaboration.category === "Beauty"
                        ? "💄"
                        : collaboration.category === "Travel"
                          ? "✈️"
                          : collaboration.category === "Gaming"
                            ? "🎮"
                            : "📢"}
            </Text>
          </View>
        )}

        {/* Main Content */}
        <View style={styles.content}>
          {/* Status + Date */}
          <View
            style={[
              globalStyles.row,
              { justifyContent: "space-between", marginBottom: 12 },
            ]}
          >
            <View
              style={[
                globalStyles.badge,
                {
                  backgroundColor:
                    collaboration.status === "open" ? "#E8F5E9" : "#FFEBEE",
                },
              ]}
            >
              <Text
                style={[
                  globalStyles.badgeText,
                  {
                    color:
                      collaboration.status === "open"
                        ? colors.success
                        : colors.error,
                  },
                ]}
              >
                {collaboration.status === "open" ? "Open" : "Closed"}
              </Text>
            </View>
            <Text style={styles.postedDate}>
              Posted{" "}
              {new Date(collaboration.createdAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </Text>
          </View>

          {/* Title */}
          <Text style={styles.title}>{collaboration.title}</Text>

          {/* Platform Tags */}
          <View
            style={[
              globalStyles.row,
              { flexWrap: "wrap", gap: 6, marginTop: 10, marginBottom: 16 },
            ]}
          >
            {Array.isArray(collaboration.platform) ? (
              collaboration.platform.map((p) => (
                <View key={p} style={styles.tag}>
                  <Text style={styles.tagText}>{p}</Text>
                </View>
              ))
            ) : (
              <View style={styles.tag}>
                <Text style={styles.tagText}>{collaboration.platform}</Text>
              </View>
            )}
            <View style={styles.categoryTag}>
              <Text style={styles.categoryTagText}>
                {collaboration.category}
              </Text>
            </View>
          </View>

          {/* Budget & Deadline Row */}
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Budget</Text>
              <Text style={styles.statValue}>${collaboration.budget}</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Deadline</Text>
              <Text
                style={[
                  styles.statValue,
                  isDeadlinePassed && { color: colors.error },
                ]}
              >
                {new Date(collaboration.deadline).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </Text>
              {isDeadlinePassed && (
                <Text style={styles.deadlinePassed}>Passed</Text>
              )}
            </View>
          </View>

          <View style={globalStyles.divider} />

          {/* Description */}
          <Text style={styles.sectionLabel}>About this Collaboration</Text>
          <Text style={styles.bodyText}>{collaboration.description}</Text>

          <View style={globalStyles.divider} />

          {/* Requirements */}
          <Text style={styles.sectionLabel}>Requirements</Text>
          <Text style={styles.bodyText}>{collaboration.requirements}</Text>

          <View style={globalStyles.divider} />

          {/* Brand Info */}
          <Text style={styles.sectionLabel}>Posted By</Text>
          <TouchableOpacity
            style={styles.brandCard}
            onPress={() =>
              navigation.navigate("UserProfile", { userId: brand._id })
            }
            activeOpacity={0.8}
          >
            {/* Brand Avatar */}
            {brand.profileImage ? (
              <Image
                source={{ uri: brand.profileImage }}
                style={styles.brandAvatar}
              />
            ) : (
              <View style={styles.brandAvatarPlaceholder}>
                <Text style={styles.brandAvatarText}>
                  {brand.name.charAt(0).toUpperCase()}
                </Text>
              </View>
            )}

            {/* Brand Details */}
            <View style={{ flex: 1 }}>
              <Text style={styles.brandName}>{brand.name}</Text>
              <Text style={styles.brandEmail}>{brand.email}</Text>
            </View>

            <Text style={styles.viewProfileText}>View →</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Apply Button (Influencer Only) */}
      {user.role === "influencer" && (
        <View style={styles.applyContainer}>
          {hasApplied ? (
            <View style={styles.alreadyApplied}>
              <Text style={styles.alreadyAppliedText}>
                ✅ You have already applied for this collaboration
              </Text>
            </View>
          ) : collaboration.status === "closed" ? (
            <View style={styles.closedBanner}>
              <Text style={styles.closedBannerText}>
                ❌ This collaboration is no longer accepting applications
              </Text>
            </View>
          ) : isDeadlinePassed ? (
            <View style={styles.closedBanner}>
              <Text style={styles.closedBannerText}>
                ⏰ The deadline for this collaboration has passed
              </Text>
            </View>
          ) : (
            <TouchableOpacity
              style={globalStyles.button}
              onPress={() =>
                navigation.navigate("Apply", {
                  collaborationId: collaboration._id,
                })
              }
              activeOpacity={0.9}
            >
              <Text style={globalStyles.buttonText}>Apply Now</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: 100,
  },
  backButton: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: "600",
  },
  image: {
    width: "100%",
    height: 220,
  },
  imagePlaceholder: {
    width: "100%",
    height: 220,
    backgroundColor: colors.primaryLight,
    justifyContent: "center",
    alignItems: "center",
  },
  imagePlaceholderEmoji: {
    fontSize: 64,
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  postedDate: {
    fontSize: 12,
    color: colors.textMuted,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: colors.textPrimary,
    lineHeight: 32,
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
  statsRow: {
    flexDirection: "row",
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: "hidden",
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    paddingVertical: 16,
    alignItems: "center",
  },
  statDivider: {
    width: 1,
    backgroundColor: colors.border,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  deadlinePassed: {
    fontSize: 11,
    color: colors.error,
    fontWeight: "600",
    marginTop: 2,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 10,
  },
  bodyText: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 24,
  },
  brandCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  brandAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
  },
  brandAvatarPlaceholder: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.primaryLight,
    justifyContent: "center",
    alignItems: "center",
  },
  brandAvatarText: {
    fontSize: 22,
    fontWeight: "700",
    color: colors.primary,
  },
  brandName: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.textPrimary,
    marginBottom: 2,
  },
  brandEmail: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  viewProfileText: {
    fontSize: 13,
    color: colors.primary,
    fontWeight: "700",
  },
  applyContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  alreadyApplied: {
    backgroundColor: "#E8F5E9",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.success,
  },
  alreadyAppliedText: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.success,
  },
  closedBanner: {
    backgroundColor: "#FFEBEE",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.error,
  },
  closedBannerText: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.error,
  },
});

export default CollaborationDetailScreen;
