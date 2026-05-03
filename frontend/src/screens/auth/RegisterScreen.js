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
import { colors, globalStyles } from "../../utils/globalStyles";

const RegisterScreen = ({ navigation }) => {
  const { register } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [nameFocused, setNameFocused] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  const buttonScale = useRef(new Animated.Value(1)).current;

  // Button Press Animation
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

  // Validate sign up
  const validate = () => {
    if (!name.trim()) {
      Alert.alert("Error", "Name is required");
      return false;
    }
    if (!email.trim()) {
      Alert.alert("Error", "Email is required");
      return false;
    }
    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(email)) {
      Alert.alert("Error", "Please enter a valid email address");
      return false;
    }
    if (!password) {
      Alert.alert("Error", "Password is required");
      return false;
    }
    if (password.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters");
      return false;
    }
    if (!role) {
      Alert.alert("Error", "Please select your role");
      return false;
    }
    return true;
  };

  // Register
  const handleRegister = async () => {
    if (!validate()) return;

    setIsLoading(true);
    const result = await register(name.trim(), email.trim(), password, role);
    setIsLoading(false);

    if (!result.success) {
      Alert.alert("Registration Failed", result.message);
    }
  };

  return (
    <KeyboardAvoidingView
      style={globalStyles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Join us and start collaborating</Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
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

          {/* Email */}
          <View style={globalStyles.inputGroup}>
            <Text style={globalStyles.label}>Email</Text>
            <TextInput
              style={[
                globalStyles.input,
                emailFocused && globalStyles.inputFocused,
              ]}
              placeholder="Enter your email"
              placeholderTextColor={colors.textMuted}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              onFocus={() => setEmailFocused(true)}
              onBlur={() => setEmailFocused(false)}
            />
          </View>

          {/* Password */}
          <View style={globalStyles.inputGroup}>
            <Text style={globalStyles.label}>Password</Text>
            <View>
              <TextInput
                style={[
                  globalStyles.input,
                  passwordFocused && globalStyles.inputFocused,
                  { paddingRight: 60 },
                ]}
                placeholder="Enter your password"
                placeholderTextColor={colors.textMuted}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                onFocus={() => setPasswordFocused(true)}
                onBlur={() => setPasswordFocused(false)}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={{
                  position: "absolute",
                  right: 16,
                  top: 0,
                  bottom: 0,
                  justifyContent: "center",
                }}
              >
                <Text
                  style={{
                    fontSize: 13,
                    color: colors.primary,
                    fontWeight: "600",
                  }}
                >
                  {showPassword ? "Hide" : "Show"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Role Selector */}
          <View style={globalStyles.inputGroup}>
            <Text style={globalStyles.label}>I am a</Text>
            <View style={styles.roleContainer}>
              {/* Brand */}
              <TouchableOpacity
                style={[
                  styles.roleCard,
                  role === "brand" && styles.roleCardActive,
                ]}
                onPress={() => setRole("brand")}
                activeOpacity={0.8}
              >
                <Text style={styles.roleEmoji}>🏢</Text>
                <Text
                  style={[
                    styles.roleTitle,
                    role === "brand" && styles.roleTitleActive,
                  ]}
                >
                  Brand
                </Text>
                <Text style={styles.roleSubtitle}>
                  Post collaborations and find influencers
                </Text>
                {role === "brand" && (
                  <View style={styles.roleCheck}>
                    <Text style={styles.roleCheckText}>✓</Text>
                  </View>
                )}
              </TouchableOpacity>

              {/* Influencer */}
              <TouchableOpacity
                style={[
                  styles.roleCard,
                  role === "influencer" && styles.roleCardActive,
                ]}
                onPress={() => setRole("influencer")}
                activeOpacity={0.8}
              >
                <Text style={styles.roleEmoji}>📸</Text>
                <Text
                  style={[
                    styles.roleTitle,
                    role === "influencer" && styles.roleTitleActive,
                  ]}
                >
                  Influencer
                </Text>
                <Text style={styles.roleSubtitle}>
                  Discover and apply for collaborations
                </Text>
                {role === "influencer" && (
                  <View style={styles.roleCheck}>
                    <Text style={styles.roleCheckText}>✓</Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* Register Button */}
          <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
            <TouchableOpacity
              style={[
                globalStyles.button,
                isLoading && globalStyles.buttonDisabled,
              ]}
              onPress={handleRegister}
              onPressIn={handlePressIn}
              onPressOut={handlePressOut}
              disabled={isLoading}
              activeOpacity={0.9}
            >
              {isLoading ? (
                <ActivityIndicator color={colors.white} />
              ) : (
                <Text style={globalStyles.buttonText}>Create Account</Text>
              )}
            </TouchableOpacity>
          </Animated.View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate("Login")}>
            <Text style={styles.footerLink}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: 28,
    paddingTop: 80,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 40,
  },
  title: {
    fontSize: 30,
    fontWeight: "700",
    color: colors.textPrimary,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 15,
    color: colors.textSecondary,
  },
  form: {
    gap: 4,
  },
  roleContainer: {
    flexDirection: "row",
    gap: 12,
  },
  roleCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    position: "relative",
  },
  roleCardActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  roleEmoji: {
    fontSize: 28,
    marginBottom: 8,
  },
  roleTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.textPrimary,
    marginBottom: 4,
  },
  roleTitleActive: {
    color: colors.primary,
  },
  roleSubtitle: {
    fontSize: 11,
    color: colors.textSecondary,
    textAlign: "center",
    lineHeight: 16,
  },
  roleCheck: {
    position: "absolute",
    top: 10,
    right: 10,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  roleCheckText: {
    color: colors.white,
    fontSize: 11,
    fontWeight: "700",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 40,
  },
  footerText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  footerLink: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: "700",
  },
});

export default RegisterScreen;
