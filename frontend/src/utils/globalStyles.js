import { StyleSheet } from "react-native";

// Colors
export const colors = {
  primary: "#6C63FF",
  primaryLight: "#EEF0FF",
  primaryDark: "#5548E0",

  background: "#FAFAFA",
  surface: "#FFFFFF",

  textPrimary: "#1A1A1A",
  textSecondary: "#888888",
  textMuted: "#BBBBBB",

  border: "#E8E8E8",
  borderFocused: "#6C63FF",

  success: "#10B981",
  error: "#EF4444",
  warning: "#F59E0B",
  pending: "#F59E0B",
  accepted: "#10B981",
  rejected: "#EF4444",

  white: "#FFFFFF",
  black: "#000000",
  shadow: "#6C63FF",
};

// Typography
export const typography = {
  h1: {
    fontSize: 30,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  h2: {
    fontSize: 22,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  h3: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.textPrimary,
  },
  body: {
    fontSize: 15,
    color: colors.textPrimary,
  },
  bodySmall: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: "#444",
  },
  caption: {
    fontSize: 11,
    color: colors.textMuted,
  },
};

// Global Styles

export const globalStyles = StyleSheet.create({
  // Layout
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  screenPadding: {
    paddingHorizontal: 28,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },

  // Card
  card: {
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

  // Input
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: "#444",
    marginBottom: 8,
  },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: colors.textPrimary,
  },
  inputFocused: {
    borderColor: colors.borderFocused,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 2,
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    minHeight: 52,
  },
  passwordInput: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 15,
    color: colors.textPrimary,
    height: 52,
  },
  eyeButton: {
    paddingLeft: 10,
  },
  eyeText: {
    fontSize: 13,
    color: colors.primary,
    fontWeight: "600",
  },
  textArea: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: colors.textPrimary,
    height: 120,
    textAlignVertical: "top",
  },

  // Button
  button: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: "700",
  },
  buttonOutline: {
    backgroundColor: "transparent",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: colors.primary,
  },
  buttonOutlineText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: "700",
  },

  // Badge
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    alignSelf: "flex-start",
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "600",
  },

  // Divider
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 16,
  },

  // Empty State
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.textSecondary,
    marginBottom: 8,
    textAlign: "center",
  },
  emptySubText: {
    fontSize: 13,
    color: colors.textMuted,
    textAlign: "center",
  },

  // Header
  screenHeader: {
    paddingHorizontal: 28,
    paddingTop: 20,
    paddingBottom: 16,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  screenTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  screenSubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 4,
  },
});
