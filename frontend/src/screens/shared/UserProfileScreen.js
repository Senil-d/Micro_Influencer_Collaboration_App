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
import api from "../../api/axios";
import { colors, globalStyles } from "../../utils/globalStyles";

const UserProfileScreen = ({ route, navigation }) => {
  const { userId } = route.params;

  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch User Profile
  const fetchProfile = async () => {
    setIsLoading(true);
    try {
      const response = await api.get(`/auth/users/${userId}`);
      setProfile(response.data.user);
    } catch (error) {
      Alert.alert(
        "Error",
        error.response?.data?.message || "Failed to fetch profile",
      );
    } finally {
      setIsLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchProfile();
    }, [userId]),
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

  if (!profile) return null;

  const hasSocialLinks = Object.values(profile.socialLinks || {}).some(
    (v) => v,
  );

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
        <Text style={globalStyles.screenTitle}>Profile</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Header Card */}
        <View style={styles.profileCard}>
          {/* Avatar */}
          <View style={styles.avatarContainer}>
            {profile.profileImage ? (
              <Image
                source={{ uri: profile.profileImage }}
                style={styles.avatar}
              />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarPlaceholderText}>
                  {profile.name.charAt(0).toUpperCase()}
                </Text>
              </View>
            )}
          </View>

          {/* Name */}
          <Text style={styles.name}>{profile.name}</Text>

          {/* Email */}
          <Text style={styles.email}>{profile.email}</Text>

          {/* Role Badge */}
          <View
            style={[
              styles.roleBadge,
              {
                backgroundColor:
                  profile.role === "brand" ? colors.primaryLight : "#E8F5E9",
              },
            ]}
          >
            <Text
              style={[
                styles.roleBadgeText,
                {
                  color:
                    profile.role === "brand" ? colors.primary : colors.success,
                },
              ]}
            >
              {profile.role === "brand" ? "🏢 Brand" : "📸 Influencer"}
            </Text>
          </View>

          {/* Followers Count — Influencer Only */}
          {profile.role === "influencer" && profile.followersCount > 0 && (
            <View style={styles.followersContainer}>
              <Text style={styles.followersCount}>
                👥 {profile.followersCount.toLocaleString()}
              </Text>
              <Text style={styles.followersLabel}>followers</Text>
            </View>
          )}
        </View>

        {/* Bio */}
        {profile.bio ? (
          <View style={globalStyles.card}>
            <Text style={styles.sectionLabel}>Bio</Text>
            <Text style={styles.bioText}>{profile.bio}</Text>
          </View>
        ) : null}

        {/* Brand Specific — Website */}
        {profile.role === "brand" && profile.website ? (
          <View style={globalStyles.card}>
            <Text style={styles.sectionLabel}>Website</Text>
            <TouchableOpacity onPress={() => openLink(profile.website)}>
              <Text style={styles.link}>🔗 {profile.website}</Text>
            </TouchableOpacity>
          </View>
        ) : null}

        {/* Influencer Specific — Portfolio */}
        {profile.role === "influencer" && profile.portfolio ? (
          <View style={globalStyles.card}>
            <Text style={styles.sectionLabel}>Portfolio</Text>
            <TouchableOpacity onPress={() => openLink(profile.portfolio)}>
              <Text style={styles.link}>🔗 {profile.portfolio}</Text>
            </TouchableOpacity>
          </View>
        ) : null}

        {/* Portfolio — Both roles */}
        {profile.role === "brand" && profile.portfolio ? (
          <View style={globalStyles.card}>
            <Text style={styles.sectionLabel}>Portfolio</Text>
            <TouchableOpacity onPress={() => openLink(profile.portfolio)}>
              <Text style={styles.link}>🔗 {profile.portfolio}</Text>
            </TouchableOpacity>
          </View>
        ) : null}

        {/* Social Links */}
        {hasSocialLinks && (
          <View style={globalStyles.card}>
            <Text style={styles.sectionLabel}>Social Media</Text>
            <View style={styles.socialContainer}>
              {Object.entries(profile.socialLinks).map(([platform, url]) => (
                <SocialLink key={platform} platform={platform} url={url} />
              ))}
            </View>
          </View>
        )}

        {/* Member Since */}
        <View style={globalStyles.card}>
          <Text style={styles.sectionLabel}>Member Since</Text>
          <Text style={styles.memberSince}>
            📅{" "}
            {new Date(profile.createdAt).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </Text>
        </View>

        {/* Empty Profile Notice */}
        {!profile.bio &&
          !hasSocialLinks &&
          !profile.portfolio &&
          !profile.website && (
            <View style={styles.emptyProfile}>
              <Text style={styles.emptyProfileText}>
                This user hasn't filled out their profile yet.
              </Text>
            </View>
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
    paddingTop: 24,
    paddingBottom: 40,
  },
  profileCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 24,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  avatarContainer: {
    marginBottom: 16,
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
  },
  avatarPlaceholder: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: colors.primaryLight,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarPlaceholderText: {
    fontSize: 36,
    fontWeight: "700",
    color: colors.primary,
  },
  name: {
    fontSize: 22,
    fontWeight: "700",
    color: colors.textPrimary,
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 12,
  },
  roleBadge: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 16,
  },
  roleBadgeText: {
    fontSize: 13,
    fontWeight: "700",
  },
  followersContainer: {
    alignItems: "center",
    marginTop: 4,
  },
  followersCount: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  followersLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
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
  link: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: "600",
    textDecorationLine: "underline",
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
  memberSince: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  emptyProfile: {
    alignItems: "center",
    paddingVertical: 20,
  },
  emptyProfileText: {
    fontSize: 13,
    color: colors.textMuted,
    fontStyle: "italic",
    textAlign: "center",
  },
});

export default UserProfileScreen;
