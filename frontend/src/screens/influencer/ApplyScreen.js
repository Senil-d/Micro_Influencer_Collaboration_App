import React, { useState, useRef } from "react";
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

const ApplyScreen = ({ route, navigation }) => {
  const { collaborationId } = route.params;
  const { user } = useAuth();

  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [messageFocused, setMessageFocused] = useState(false);

  const buttonScale = useRef(new Animated.Value(1)).current;

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
    if (!message.trim()) {
      Alert.alert("Error", "Please write a message for your application");
      return;
    }

    if (message.trim().length < 20) {
      Alert.alert("Error", "Message must be at least 20 characters");
      return;
    }

    setIsLoading(true);
    try {
      await api.post("/applications", {
        collaborationId,
        message: message.trim(),
      });

      Alert.alert(
        "Application Submitted!",
        "Your application has been sent successfully. The brand will review it and get back to you.",
        [
          {
            text: "View My Applications",
            onPress: () => navigation.navigate("MyApplications"),
          },
          {
            text: "Continue Exploring",
            onPress: () => navigation.navigate("Explore"),
          },
        ],
      );
    } catch (error) {
      Alert.alert(
        "Error",
        error.response?.data?.message || "Failed to submit application",
      );
    } finally {
      setIsLoading(false);
    }
  };

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
        <Text style={globalStyles.screenTitle}>Apply</Text>
        <Text style={globalStyles.screenSubtitle}>
          Write a compelling message to stand out
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Profile Summary */}
        <View style={styles.profileSummary}>
          <View style={styles.profileAvatar}>
            <Text style={styles.profileAvatarText}>
              {user.name.charAt(0).toUpperCase()}
            </Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.profileName}>{user.name}</Text>
            <Text style={styles.profileRole}>Applying as Influencer</Text>
          </View>
        </View>

        {/* Tips Card */}
        <View style={styles.tipsCard}>
          <Text style={styles.tipsTitle}>💡 Tips for a great application</Text>
          <Text style={styles.tipItem}>
            • Introduce yourself and your niche
          </Text>
          <Text style={styles.tipItem}>
            • Mention your followers and engagement rate
          </Text>
          <Text style={styles.tipItem}>
            • Explain why you're a good fit for this brand
          </Text>
          <Text style={styles.tipItem}>• Keep it professional and concise</Text>
        </View>

        {/* Message Input */}
        <View style={globalStyles.inputGroup}>
          <Text style={globalStyles.label}>
            Your Message
            <Text style={styles.charCount}>
              {"  "}
              {message.length} characters
            </Text>
          </Text>
          <TextInput
            style={[
              styles.messageInput,
              messageFocused && globalStyles.inputFocused,
            ]}
            placeholder="Hi, I'm a fashion influencer with 50k followers on Instagram. I specialize in lifestyle and fashion content and would love to collaborate on your campaign..."
            placeholderTextColor={colors.textMuted}
            value={message}
            onChangeText={setMessage}
            multiline
            numberOfLines={8}
            textAlignVertical="top"
            onFocus={() => setMessageFocused(true)}
            onBlur={() => setMessageFocused(false)}
          />
        </View>

        {/* Character hint */}
        {message.length > 0 && message.length < 20 && (
          <Text style={styles.minCharHint}>
            Minimum 20 characters required ({20 - message.length} more needed)
          </Text>
        )}

        {/* Submit Button */}
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
              <Text style={globalStyles.buttonText}>Submit Application</Text>
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
  profileSummary: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  profileAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primaryLight,
    justifyContent: "center",
    alignItems: "center",
  },
  profileAvatarText: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.primary,
  },
  profileName: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.textPrimary,
    marginBottom: 2,
  },
  profileRole: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  tipsCard: {
    backgroundColor: "#F8F7FF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: colors.primaryLight,
  },
  tipsTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.primary,
    marginBottom: 10,
  },
  tipItem: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 24,
  },
  messageInput: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: colors.textPrimary,
    height: 200,
    textAlignVertical: "top",
  },
  charCount: {
    fontSize: 11,
    color: colors.textMuted,
    fontWeight: "400",
  },
  minCharHint: {
    fontSize: 12,
    color: colors.warning,
    fontWeight: "600",
    marginTop: -8,
    marginBottom: 16,
  },
});

export default ApplyScreen;
