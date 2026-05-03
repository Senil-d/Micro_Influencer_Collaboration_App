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

const ProfileScreen = ({ navigation }) => {
  const { user, logout } = useAuth();
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch Profile
  const fetchProfile = async () => {
    setIsLoading(true);
    try {
      const response = await api.get("/auth/me");
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
    }, []),
  );

  // Logout
  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          await logout();
        },
      },
    ]);
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
      <View style={globalStyles.screenHeader}>
        <Text style={globalStyles.screenTitle}>Profile</Text>
        <Text style={globalStyles.screenSubtitle}>
          Manage your account details
        </Text>
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
        </View>

        {/* Bio */}
        {profile.bio ? (
          <View style={globalStyles.card}>
            <Text style={styles.sectionLabel}>Bio</Text>
            <Text style={styles.bioText}>{profile.bio}</Text>
          </View>
        ) : null}

        {/* Influencer Specific */}
        {profile.role === "influencer" && (
          <>
            {profile.followersCount > 0 && (
              <View style={globalStyles.card}>
                <Text style={styles.sectionLabel}>Followers</Text>
                <Text style={styles.followersCount}>
                  👥 {profile.followersCount.toLocaleString()} followers
                </Text>
              </View>
            )}
          </>
        )}

        {/* Brand Specific */}
        {profile.role === "brand" && profile.website ? (
          <View style={globalStyles.card}>
            <Text style={styles.sectionLabel}>Website</Text>
            <TouchableOpacity onPress={() => openLink(profile.website)}>
              <Text style={styles.link}>🔗 {profile.website}</Text>
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

        {/* Portfolio */}
        {profile.portfolio ? (
          <View style={globalStyles.card}>
            <Text style={styles.sectionLabel}>Portfolio</Text>
            <TouchableOpacity onPress={() => openLink(profile.portfolio)}>
              <Text style={styles.link}>🔗 {profile.portfolio}</Text>
            </TouchableOpacity>
          </View>
        ) : null}

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

        {/* Edit Profile Button */}
        <TouchableOpacity
          style={globalStyles.button}
          onPress={() => navigation.navigate("EditProfile")}
          activeOpacity={0.8}
        >
          <Text style={globalStyles.buttonText}>Edit Profile</Text>
        </TouchableOpacity>

        <View style={styles.divider} />

        {/* Logout Button */}
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
          activeOpacity={0.8}
        >
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
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
  },
  roleBadgeText: {
    fontSize: 13,
    fontWeight: "700",
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
  followersCount: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.textPrimary,
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
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 20,
  },
  logoutButton: {
    backgroundColor: "#FFEBEE",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.error,
  },
  logoutText: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.error,
  },
});

export default ProfileScreen;
