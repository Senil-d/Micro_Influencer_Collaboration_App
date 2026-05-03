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
  TextInput,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { useAuth } from "../../context/AuthContext";
import api from "../../api/axios";
import { colors, globalStyles } from "../../utils/globalStyles";

const ApplicationDetailScreen = ({ route, navigation }) => {
  const { applicationId } = route.params;
  const { user } = useAuth();

  const [application, setApplication] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isReviewing, setIsReviewing] = useState(false);
  const [brandFeedback, setBrandFeedback] = useState("");
  const [feedbackFocused, setFeedbackFocused] = useState(false);

  // Fetch Application
  const fetchApplication = async () => {
    setIsLoading(true);
    try {
      const response = await api.get(`/applications/${applicationId}`);
      setApplication(response.data.application);
    } catch (error) {
      Alert.alert(
        "Error",
        error.response?.data?.message || "Failed to fetch application",
      );
    } finally {
      setIsLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchApplication();
    }, []),
  );

  // Accept / Reject
  const handleReview = (status) => {
    Alert.alert(
      status === "accepted" ? "Accept Application" : "Reject Application",
      status === "accepted"
        ? "Are you sure you want to accept this applicant?"
        : "Are you sure you want to reject this applicant?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: status === "accepted" ? "Accept" : "Reject",
          style: status === "accepted" ? "default" : "destructive",
          onPress: async () => {
            setIsReviewing(true);
            try {
              await api.put(`/applications/${applicationId}`, {
                status,
                brandFeedback: brandFeedback.trim(),
              });
              Alert.alert("Success", `Application ${status} successfully`, [
                { text: "OK", onPress: () => navigation.goBack() },
              ]);
            } catch (error) {
              Alert.alert(
                "Error",
                error.response?.data?.message || "Failed to update application",
              );
            } finally {
              setIsReviewing(false);
            }
          },
        },
      ],
    );
  };

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

  // Status Badge
  const StatusBadge = ({ status }) => {
    const statusConfig = {
      pending: { bg: "#FFF8E1", color: colors.warning, label: "⏳ Pending" },
      accepted: { bg: "#E8F5E9", color: colors.success, label: "✅ Accepted" },
      rejected: { bg: "#FFEBEE", color: colors.error, label: "❌ Rejected" },
    };
    const config = statusConfig[status];
    return (
      <View style={[styles.statusBadge, { backgroundColor: config.bg }]}>
        <Text style={[styles.statusBadgeText, { color: config.color }]}>
          {config.label}
        </Text>
      </View>
    );
  };

  // Social Link Button
  const SocialLink = ({ platform, url }) => {
    if (!url) return null;
    const icons = {
      instagram: "📸",
      tiktok: "🎵",
      youtube: "▶️",
      twitter: "🐦",
      facebook: "👤",
    };
    return (
      <TouchableOpacity
        style={styles.socialButton}
        onPress={() => openLink(url)}
        activeOpacity={0.7}
      >
        <Text style={styles.socialIcon}>{icons[platform]}</Text>
        <Text style={styles.socialText}>
          {platform.charAt(0).toUpperCase() + platform.slice(1)}
        </Text>
      </TouchableOpacity>
    );
  };

  if (isLoading) {
    return (
      <View style={globalStyles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!application) return null;

  const isBrand = user.role === "brand";
  const influencer = application.influencerId;
  const collaboration = application.collaborationId;

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
        <Text style={globalStyles.screenTitle}>
          {isBrand ? "Application Review" : "My Application"}
        </Text>
        <Text style={globalStyles.screenSubtitle}>
          {isBrand
            ? "Review the influencer's profile and application"
            : "Track your application status"}
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* BRAND VIEW*/}
        {isBrand && (
          <>
            {/* Influencer Profile Card */}
            <View style={styles.profileCard}>
              {/* Avatar + Name */}
              <View style={[globalStyles.row, { gap: 16, marginBottom: 16 }]}>
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
                <View style={{ flex: 1 }}>
                  <Text style={styles.influencerName}>{influencer.name}</Text>
                  <Text style={styles.influencerEmail}>{influencer.email}</Text>
                  {influencer.followersCount > 0 && (
                    <Text style={styles.followers}>
                      👥 {influencer.followersCount.toLocaleString()} followers
                    </Text>
                  )}
                </View>
              </View>

              {/* Bio */}
              {influencer.bio ? (
                <>
                  <Text style={styles.sectionLabel}>Bio</Text>
                  <Text style={styles.bioText}>{influencer.bio}</Text>
                  <View style={globalStyles.divider} />
                </>
              ) : null}

              {/* Social Links */}
              {Object.values(influencer.socialLinks || {}).some((v) => v) && (
                <>
                  <Text style={styles.sectionLabel}>Social Media</Text>
                  <View style={styles.socialContainer}>
                    {Object.entries(influencer.socialLinks).map(
                      ([platform, url]) => (
                        <SocialLink
                          key={platform}
                          platform={platform}
                          url={url}
                        />
                      ),
                    )}
                  </View>
                  <View style={globalStyles.divider} />
                </>
              )}

              {/* Portfolio */}
              {influencer.portfolio ? (
                <>
                  <Text style={styles.sectionLabel}>Portfolio</Text>
                  <TouchableOpacity
                    onPress={() => openLink(influencer.portfolio)}
                  >
                    <Text style={styles.portfolioLink}>
                      🔗 {influencer.portfolio}
                    </Text>
                  </TouchableOpacity>
                  <View style={globalStyles.divider} />
                </>
              ) : null}
            </View>

            {/* Application Message */}
            <View style={globalStyles.card}>
              <Text style={styles.sectionLabel}>Application Message</Text>
              <Text style={styles.messageText}>{application.message}</Text>
            </View>

            {/* Applied Date */}
            <Text style={styles.appliedDate}>
              Applied on {new Date(application.appliedAt).toLocaleDateString()}
            </Text>

            {/* Review Section — only show if pending */}
            {application.status === "pending" ? (
              <View style={globalStyles.card}>
                <Text style={styles.sectionLabel}>
                  Leave Feedback (optional)
                </Text>
                <TextInput
                  style={[
                    globalStyles.textArea,
                    feedbackFocused && globalStyles.inputFocused,
                    { marginBottom: 16 },
                  ]}
                  placeholder="Write a note for the influencer..."
                  placeholderTextColor={colors.textMuted}
                  value={brandFeedback}
                  onChangeText={setBrandFeedback}
                  multiline
                  numberOfLines={3}
                  onFocus={() => setFeedbackFocused(true)}
                  onBlur={() => setFeedbackFocused(false)}
                />

                {/* Accept / Reject Buttons */}
                <View style={[globalStyles.row, { gap: 12 }]}>
                  <TouchableOpacity
                    style={[
                      styles.rejectButton,
                      isReviewing && globalStyles.buttonDisabled,
                    ]}
                    onPress={() => handleReview("rejected")}
                    disabled={isReviewing}
                    activeOpacity={0.8}
                  >
                    {isReviewing ? (
                      <ActivityIndicator color={colors.error} />
                    ) : (
                      <Text style={styles.rejectButtonText}>❌ Reject</Text>
                    )}
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.acceptButton,
                      isReviewing && globalStyles.buttonDisabled,
                    ]}
                    onPress={() => handleReview("accepted")}
                    disabled={isReviewing}
                    activeOpacity={0.8}
                  >
                    {isReviewing ? (
                      <ActivityIndicator color={colors.white} />
                    ) : (
                      <Text style={styles.acceptButtonText}>✅ Accept</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              // Already reviewed
              <View style={globalStyles.card}>
                <Text style={styles.sectionLabel}>Review Decision</Text>
                <StatusBadge status={application.status} />
                {application.brandFeedback ? (
                  <>
                    <Text style={[styles.sectionLabel, { marginTop: 12 }]}>
                      Your Feedback
                    </Text>
                    <Text style={styles.messageText}>
                      {application.brandFeedback}
                    </Text>
                  </>
                ) : null}
              </View>
            )}
          </>
        )}

        {/* INFLUENCER VIEW */}
        {!isBrand && (
          <>
            {/* Collaboration Info */}
            <View style={globalStyles.card}>
              <Text style={styles.sectionLabel}>Collaboration</Text>
              <Text style={styles.collabTitle}>{collaboration.title}</Text>
              <View style={[globalStyles.row, { gap: 8, marginTop: 8 }]}>
                <View style={styles.tag}>
                  <Text style={styles.tagText}>{collaboration.platform}</Text>
                </View>
                <View style={styles.tag}>
                  <Text style={styles.tagText}>{collaboration.category}</Text>
                </View>
              </View>
              <View
                style={[
                  globalStyles.row,
                  { justifyContent: "space-between", marginTop: 12 },
                ]}
              >
                <Text style={styles.budget}>${collaboration.budget}</Text>
                <Text style={styles.deadline}>
                  Deadline:{" "}
                  {new Date(collaboration.deadline).toLocaleDateString()}
                </Text>
              </View>
            </View>

            {/* Application Status */}
            <View style={globalStyles.card}>
              <Text style={styles.sectionLabel}>Application Status</Text>
              <StatusBadge status={application.status} />
              <Text style={styles.appliedDate}>
                Applied on{" "}
                {new Date(application.appliedAt).toLocaleDateString()}
              </Text>
            </View>

            {/* Your Message */}
            <View style={globalStyles.card}>
              <Text style={styles.sectionLabel}>Your Message</Text>
              <Text style={styles.messageText}>{application.message}</Text>
            </View>

            {/* Brand Feedback — only show if reviewed */}
            {application.status !== "pending" && (
              <View style={globalStyles.card}>
                <Text style={styles.sectionLabel}>Brand Feedback</Text>
                {application.brandFeedback ? (
                  <Text style={styles.messageText}>
                    {application.brandFeedback}
                  </Text>
                ) : (
                  <Text style={styles.noFeedback}>
                    No feedback was left by the brand.
                  </Text>
                )}
              </View>
            )}
          </>
        )}
      </ScrollView>
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
  scrollContent: {
    paddingHorizontal: 28,
    paddingTop: 20,
    paddingBottom: 40,
  },
  profileCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
  },
  avatarPlaceholder: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.primaryLight,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarPlaceholderText: {
    fontSize: 26,
    fontWeight: "700",
    color: colors.primary,
  },
  influencerName: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.textPrimary,
    marginBottom: 2,
  },
  influencerEmail: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  followers: {
    fontSize: 13,
    color: colors.primary,
    fontWeight: "600",
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  bioText: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  socialContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  socialButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: colors.primaryLight,
    borderRadius: 20,
  },
  socialIcon: {
    fontSize: 14,
  },
  socialText: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.primary,
  },
  portfolioLink: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: "600",
    textDecorationLine: "underline",
  },
  messageText: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  appliedDate: {
    fontSize: 12,
    color: colors.textMuted,
    marginBottom: 14,
    marginTop: 4,
  },
  acceptButton: {
    flex: 1,
    backgroundColor: colors.success,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  acceptButtonText: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.white,
  },
  rejectButton: {
    flex: 1,
    backgroundColor: "#FFEBEE",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.error,
  },
  rejectButtonText: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.error,
  },
  statusBadge: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: "flex-start",
    marginBottom: 8,
  },
  statusBadgeText: {
    fontSize: 13,
    fontWeight: "700",
  },
  collabTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.textPrimary,
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
  noFeedback: {
    fontSize: 14,
    color: colors.textMuted,
    fontStyle: "italic",
  },
});

export default ApplicationDetailScreen;
