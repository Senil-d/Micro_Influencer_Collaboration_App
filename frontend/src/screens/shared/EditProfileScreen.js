import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Animated,
  ScrollView,
} from "react-native";
import { useAuth } from "../../context/AuthContext";
import api from "../../api/axios";
import { colors, globalStyles } from "../../utils/globalStyles";

const EditProfileScreen = ({ navigation }) => {
  const { user, updateUserState } = useAuth();

  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [profileImage, setProfileImage] = useState("");
  const [portfolio, setPortfolio] = useState("");
  const [followersCount, setFollowersCount] = useState("");
  const [website, setWebsite] = useState("");
  const [socialLinks, setSocialLinks] = useState({
    instagram: "",
    tiktok: "",
    youtube: "",
    twitter: "",
    facebook: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);

  // Focus States
  const [nameFocused, setNameFocused] = useState(false);
  const [bioFocused, setBioFocused] = useState(false);
  const [profileImageFocused, setProfileImageFocused] = useState(false);
  const [portfolioFocused, setPortfolioFocused] = useState(false);
  const [followersFocused, setFollowersFocused] = useState(false);
  const [websiteFocused, setWebsiteFocused] = useState(false);
  const [instagramFocused, setInstagramFocused] = useState(false);
  const [tiktokFocused, setTiktokFocused] = useState(false);
  const [youtubeFocused, setYoutubeFocused] = useState(false);
  const [twitterFocused, setTwitterFocused] = useState(false);
  const [facebookFocused, setFacebookFocused] = useState(false);

  const buttonScale = useRef(new Animated.Value(1)).current;

  // Load Current Profile
  useEffect(() => {
    const fetchProfile = async () => {
      setIsFetching(true);
      try {
        const response = await api.get("/auth/me");
        const profile = response.data.user;

        setName(profile.name || "");
        setBio(profile.bio || "");
        setProfileImage(profile.profileImage || "");
        setPortfolio(profile.portfolio || "");
        setFollowersCount(
          profile.followersCount ? String(profile.followersCount) : "",
        );
        setWebsite(profile.website || "");
        setSocialLinks({
          instagram: profile.socialLinks?.instagram || "",
          tiktok: profile.socialLinks?.tiktok || "",
          youtube: profile.socialLinks?.youtube || "",
          twitter: profile.socialLinks?.twitter || "",
          facebook: profile.socialLinks?.facebook || "",
        });
      } catch (error) {
        Alert.alert(
          "Error",
          error.response?.data?.message || "Failed to load profile",
        );
      } finally {
        setIsFetching(false);
      }
    };

    fetchProfile();
  }, []);

  // Button Animation
  const handlePressIn = () => {
    Animated.spring(buttonScale, {
      toValue: 0.96,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(buttonScale, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  // Submit
  const handleSubmit = async () => {
    if (!name.trim()) {
      Alert.alert("Error", "Name is required");
      return;
    }

    if (
      followersCount &&
      (isNaN(followersCount) || Number(followersCount) < 0)
    ) {
      Alert.alert("Error", "Followers count must be a valid number");
      return;
    }

    setIsLoading(true);
    try {
      const payload = {
        name: name.trim(),
        bio: bio.trim(),
        profileImage: profileImage.trim(),
        portfolio: portfolio.trim(),
        socialLinks,
      };

      // Add role specific fields
      if (user.role === "influencer" && followersCount) {
        payload.followersCount = Number(followersCount);
      }
      if (user.role === "brand" && website) {
        payload.website = website.trim();
      }

      const response = await api.put("/auth/update", payload);

      // Update global auth state
      await updateUserState(response.data.user);

      Alert.alert("Success", "Profile updated successfully", [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      Alert.alert(
        "Error",
        error.response?.data?.message || "Failed to update profile",
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return (
      <View style={globalStyles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={globalStyles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={globalStyles.screenTitle}>Edit Profile</Text>
        <Text style={globalStyles.screenSubtitle}>
          Update your profile details
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Basic Info */}
        <Text style={styles.groupTitle}>Basic Info</Text>

        {/* Name */}
        <View style={globalStyles.inputGroup}>
          <Text style={globalStyles.label}>Full Name</Text>
          <TextInput
            style={[
              globalStyles.input,
              nameFocused && globalStyles.inputFocused,
            ]}
            placeholder="Enter your full name"
            placeholderTextColor={colors.textMuted}
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
            onFocus={() => setNameFocused(true)}
            onBlur={() => setNameFocused(false)}
          />
        </View>

        {/* Bio */}
        <View style={globalStyles.inputGroup}>
          <Text style={globalStyles.label}>Bio</Text>
          <TextInput
            style={[
              globalStyles.textArea,
              bioFocused && globalStyles.inputFocused,
            ]}
            placeholder="Tell others about yourself..."
            placeholderTextColor={colors.textMuted}
            value={bio}
            onChangeText={setBio}
            multiline
            numberOfLines={4}
            onFocus={() => setBioFocused(true)}
            onBlur={() => setBioFocused(false)}
          />
        </View>

        {/* Profile Image URL */}
        <View style={globalStyles.inputGroup}>
          <Text style={globalStyles.label}>Profile Image URL</Text>
          <TextInput
            style={[
              globalStyles.input,
              profileImageFocused && globalStyles.inputFocused,
            ]}
            placeholder="Paste Firebase image URL here"
            placeholderTextColor={colors.textMuted}
            value={profileImage}
            onChangeText={setProfileImage}
            autoCapitalize="none"
            onFocus={() => setProfileImageFocused(true)}
            onBlur={() => setProfileImageFocused(false)}
          />
        </View>

        {/* Portfolio */}
        <View style={globalStyles.inputGroup}>
          <Text style={globalStyles.label}>Portfolio URL</Text>
          <TextInput
            style={[
              globalStyles.input,
              portfolioFocused && globalStyles.inputFocused,
            ]}
            placeholder="https://yourportfolio.com"
            placeholderTextColor={colors.textMuted}
            value={portfolio}
            onChangeText={setPortfolio}
            autoCapitalize="none"
            keyboardType="url"
            onFocus={() => setPortfolioFocused(true)}
            onBlur={() => setPortfolioFocused(false)}
          />
        </View>

        {/* Influencer Specific  */}
        {user.role === "influencer" && (
          <>
            <View style={globalStyles.divider} />
            <Text style={styles.groupTitle}>Influencer Details</Text>

            <View style={globalStyles.inputGroup}>
              <Text style={globalStyles.label}>Followers Count</Text>
              <TextInput
                style={[
                  globalStyles.input,
                  followersFocused && globalStyles.inputFocused,
                ]}
                placeholder="e.g. 50000"
                placeholderTextColor={colors.textMuted}
                value={followersCount}
                onChangeText={setFollowersCount}
                keyboardType="numeric"
                onFocus={() => setFollowersFocused(true)}
                onBlur={() => setFollowersFocused(false)}
              />
            </View>
          </>
        )}

        {/* Brand Specific */}
        {user.role === "brand" && (
          <>
            <View style={globalStyles.divider} />
            <Text style={styles.groupTitle}>Brand Details</Text>

            <View style={globalStyles.inputGroup}>
              <Text style={globalStyles.label}>Website</Text>
              <TextInput
                style={[
                  globalStyles.input,
                  websiteFocused && globalStyles.inputFocused,
                ]}
                placeholder="https://yourwebsite.com"
                placeholderTextColor={colors.textMuted}
                value={website}
                onChangeText={setWebsite}
                autoCapitalize="none"
                keyboardType="url"
                onFocus={() => setWebsiteFocused(true)}
                onBlur={() => setWebsiteFocused(false)}
              />
            </View>
          </>
        )}

        {/* Social Links */}
        <View style={globalStyles.divider} />
        <Text style={styles.groupTitle}>Social Media Links</Text>

        {/* Instagram */}
        <View style={globalStyles.inputGroup}>
          <Text style={globalStyles.label}>📸 Instagram</Text>
          <TextInput
            style={[
              globalStyles.input,
              instagramFocused && globalStyles.inputFocused,
            ]}
            placeholder="https://instagram.com/username"
            placeholderTextColor={colors.textMuted}
            value={socialLinks.instagram}
            onChangeText={(val) =>
              setSocialLinks((prev) => ({ ...prev, instagram: val }))
            }
            autoCapitalize="none"
            keyboardType="url"
            onFocus={() => setInstagramFocused(true)}
            onBlur={() => setInstagramFocused(false)}
          />
        </View>

        {/* TikTok */}
        <View style={globalStyles.inputGroup}>
          <Text style={globalStyles.label}>🎵 TikTok</Text>
          <TextInput
            style={[
              globalStyles.input,
              tiktokFocused && globalStyles.inputFocused,
            ]}
            placeholder="https://tiktok.com/@username"
            placeholderTextColor={colors.textMuted}
            value={socialLinks.tiktok}
            onChangeText={(val) =>
              setSocialLinks((prev) => ({ ...prev, tiktok: val }))
            }
            autoCapitalize="none"
            keyboardType="url"
            onFocus={() => setTiktokFocused(true)}
            onBlur={() => setTiktokFocused(false)}
          />
        </View>

        {/* YouTube */}
        <View style={globalStyles.inputGroup}>
          <Text style={globalStyles.label}>▶️ YouTube</Text>
          <TextInput
            style={[
              globalStyles.input,
              youtubeFocused && globalStyles.inputFocused,
            ]}
            placeholder="https://youtube.com/@username"
            placeholderTextColor={colors.textMuted}
            value={socialLinks.youtube}
            onChangeText={(val) =>
              setSocialLinks((prev) => ({ ...prev, youtube: val }))
            }
            autoCapitalize="none"
            keyboardType="url"
            onFocus={() => setYoutubeFocused(true)}
            onBlur={() => setYoutubeFocused(false)}
          />
        </View>

        {/* Twitter */}
        <View style={globalStyles.inputGroup}>
          <Text style={globalStyles.label}>🐦 Twitter</Text>
          <TextInput
            style={[
              globalStyles.input,
              twitterFocused && globalStyles.inputFocused,
            ]}
            placeholder="https://twitter.com/username"
            placeholderTextColor={colors.textMuted}
            value={socialLinks.twitter}
            onChangeText={(val) =>
              setSocialLinks((prev) => ({ ...prev, twitter: val }))
            }
            autoCapitalize="none"
            keyboardType="url"
            onFocus={() => setTwitterFocused(true)}
            onBlur={() => setTwitterFocused(false)}
          />
        </View>

        {/* Facebook */}
        <View style={globalStyles.inputGroup}>
          <Text style={globalStyles.label}>👤 Facebook</Text>
          <TextInput
            style={[
              globalStyles.input,
              facebookFocused && globalStyles.inputFocused,
            ]}
            placeholder="https://facebook.com/username"
            placeholderTextColor={colors.textMuted}
            value={socialLinks.facebook}
            onChangeText={(val) =>
              setSocialLinks((prev) => ({ ...prev, facebook: val }))
            }
            autoCapitalize="none"
            keyboardType="url"
            onFocus={() => setFacebookFocused(true)}
            onBlur={() => setFacebookFocused(false)}
          />
        </View>

        {/* Save Button */}
        <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
          <TouchableOpacity
            style={[
              globalStyles.button,
              isLoading && globalStyles.buttonDisabled,
            ]}
            onPress={handleSubmit}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            disabled={isLoading}
            activeOpacity={0.9}
          >
            {isLoading ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <Text style={globalStyles.buttonText}>Save Changes</Text>
            )}
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
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
  groupTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.textPrimary,
    marginBottom: 16,
  },
});

export default EditProfileScreen;
