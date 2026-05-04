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
  Image,
} from "react-native";
import { colors, globalStyles } from "../../utils/globalStyles";
import api from "../../api/axios";
import useImageUpload from "../../hooks/useImageUpload";

const PLATFORMS = [
  "Instagram",
  "TikTok",
  "YouTube",
  "Twitter",
  "Facebook",
  "Other",
];
const CATEGORIES = [
  "Fashion",
  "Food",
  "Tech",
  "Fitness",
  "Beauty",
  "Travel",
  "Gaming",
  "Other",
];
const STATUSES = ["open", "closed"];
const MAX_COLLABORATION_IMAGES = 4;

const EditCollaborationScreen = ({ route, navigation }) => {
  const { collaboration } = route.params;

  const [title, setTitle] = useState(collaboration.title || "");
  const [description, setDescription] = useState(
    collaboration.description || "",
  );
  const [platforms, setPlatforms] = useState(
    Array.isArray(collaboration.platform)
      ? collaboration.platform
      : [collaboration.platform],
  );
  const [category, setCategory] = useState(collaboration.category || "");
  const [budget, setBudget] = useState(String(collaboration.budget) || "");
  const [requirements, setRequirements] = useState(
    collaboration.requirements || "",
  );
  const [deadline, setDeadline] = useState(
    collaboration.deadline
      ? new Date(collaboration.deadline).toISOString().split("T")[0]
      : "",
  );
  const [imageUrls, setImageUrls] = useState(
    Array.isArray(collaboration.imageUrls)
      ? collaboration.imageUrls
      : collaboration.imageUrl
        ? [collaboration.imageUrl]
        : [],
  );
  const [status, setStatus] = useState(collaboration.status || "open");
  const [isLoading, setIsLoading] = useState(false);

  // Focus States
  const [titleFocused, setTitleFocused] = useState(false);
  const [descriptionFocused, setDescriptionFocused] = useState(false);
  const [budgetFocused, setBudgetFocused] = useState(false);
  const [requirementsFocused, setRequirementsFocused] = useState(false);
  const [deadlineFocused, setDeadlineFocused] = useState(false);

  const { imageUploading, pickCollaborationImages } = useImageUpload();
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

  // Toggle Platform
  const togglePlatform = (option) => {
    setPlatforms((prev) =>
      prev.includes(option)
        ? prev.filter((p) => p !== option)
        : [...prev, option],
    );
  };

  // Validate input
  const validate = () => {
    if (!title.trim()) {
      Alert.alert("Error", "Title is required");
      return false;
    }
    if (!description.trim()) {
      Alert.alert("Error", "Description is required");
      return false;
    }
    if (platforms.length === 0) {
      Alert.alert("Error", "Please select at least one platform");
      return false;
    }
    if (!category) {
      Alert.alert("Error", "Please select a category");
      return false;
    }
    if (!budget || isNaN(budget) || Number(budget) < 0) {
      Alert.alert("Error", "Please enter a valid budget");
      return false;
    }
    if (!requirements.trim()) {
      Alert.alert("Error", "Requirements are required");
      return false;
    }
    if (!deadline.trim()) {
      Alert.alert("Error", "Deadline is required");
      return false;
    }
    const deadlineDate = new Date(deadline);
    if (isNaN(deadlineDate.getTime())) {
      Alert.alert("Error", "Please enter a valid date (YYYY-MM-DD)");
      return false;
    }
    return true;
  };

  // Submit
  const handleSubmit = async () => {
    if (!validate()) return;

    setIsLoading(true);
    try {
      await api.put(`/collaborations/${collaboration._id}`, {
        title: title.trim(),
        description: description.trim(),
        platform: platforms,
        category,
        budget: Number(budget),
        requirements: requirements.trim(),
        deadline,
        imageUrls: imageUrls,
        status,
      });

      Alert.alert("Success", "Collaboration updated successfully", [
        {
          text: "OK",
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (error) {
      Alert.alert(
        "Error",
        error.response?.data?.message || "Failed to update collaboration",
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Multi Selector
  const MultiSelector = ({ label, options, selected, onToggle }) => (
    <View style={globalStyles.inputGroup}>
      <Text style={globalStyles.label}>
        {label}
        <Text style={styles.multiHint}> (select multiple)</Text>
      </Text>
      <View style={styles.selectorContainer}>
        {options.map((option) => (
          <TouchableOpacity
            key={option}
            style={[
              styles.selectorChip,
              selected.includes(option) && styles.selectorChipActive,
            ]}
            onPress={() => onToggle(option)}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.selectorChipText,
                selected.includes(option) && styles.selectorChipTextActive,
              ]}
            >
              {selected.includes(option) ? "✓ " : ""}
              {option}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  // Single Selector
  const SingleSelector = ({ label, options, selected, onSelect }) => (
    <View style={globalStyles.inputGroup}>
      <Text style={globalStyles.label}>{label}</Text>
      <View style={styles.selectorContainer}>
        {options.map((option) => (
          <TouchableOpacity
            key={option}
            style={[
              styles.selectorChip,
              selected === option && styles.selectorChipActive,
            ]}
            onPress={() => onSelect(option)}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.selectorChipText,
                selected === option && styles.selectorChipTextActive,
              ]}
            >
              {option}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

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
        <Text style={globalStyles.screenTitle}>Edit Collaboration</Text>
        <Text style={globalStyles.screenSubtitle}>
          Update your collaboration details
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Title */}
        <View style={globalStyles.inputGroup}>
          <Text style={globalStyles.label}>Title</Text>
          <TextInput
            style={[
              globalStyles.input,
              titleFocused && globalStyles.inputFocused,
            ]}
            placeholder="e.g. Summer Fashion Campaign"
            placeholderTextColor={colors.textMuted}
            value={title}
            onChangeText={setTitle}
            onFocus={() => setTitleFocused(true)}
            onBlur={() => setTitleFocused(false)}
          />
        </View>

        {/* Description */}
        <View style={globalStyles.inputGroup}>
          <Text style={globalStyles.label}>Description</Text>
          <TextInput
            style={[
              globalStyles.textArea,
              descriptionFocused && globalStyles.inputFocused,
            ]}
            placeholder="Describe your collaboration opportunity..."
            placeholderTextColor={colors.textMuted}
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
            onFocus={() => setDescriptionFocused(true)}
            onBlur={() => setDescriptionFocused(false)}
          />
        </View>

        {/* Platform Multi Selector */}
        <MultiSelector
          label="Platform"
          options={PLATFORMS}
          selected={platforms}
          onToggle={togglePlatform}
        />

        {/* Category Single Selector */}
        <SingleSelector
          label="Category"
          options={CATEGORIES}
          selected={category}
          onSelect={setCategory}
        />

        {/* Budget */}
        <View style={globalStyles.inputGroup}>
          <Text style={globalStyles.label}>Budget (USD)</Text>
          <TextInput
            style={[
              globalStyles.input,
              budgetFocused && globalStyles.inputFocused,
            ]}
            placeholder="e.g. 500"
            placeholderTextColor={colors.textMuted}
            value={budget}
            onChangeText={setBudget}
            keyboardType="numeric"
            onFocus={() => setBudgetFocused(true)}
            onBlur={() => setBudgetFocused(false)}
          />
        </View>

        {/* Requirements */}
        <View style={globalStyles.inputGroup}>
          <Text style={globalStyles.label}>Requirements</Text>
          <TextInput
            style={[
              globalStyles.textArea,
              requirementsFocused && globalStyles.inputFocused,
            ]}
            placeholder="e.g. Minimum 10k followers, fashion niche..."
            placeholderTextColor={colors.textMuted}
            value={requirements}
            onChangeText={setRequirements}
            multiline
            numberOfLines={4}
            onFocus={() => setRequirementsFocused(true)}
            onBlur={() => setRequirementsFocused(false)}
          />
        </View>

        {/* Deadline */}
        <View style={globalStyles.inputGroup}>
          <Text style={globalStyles.label}>Deadline (YYYY-MM-DD)</Text>
          <TextInput
            style={[
              globalStyles.input,
              deadlineFocused && globalStyles.inputFocused,
            ]}
            placeholder="e.g. 2026-12-31"
            placeholderTextColor={colors.textMuted}
            value={deadline}
            onChangeText={setDeadline}
            onFocus={() => setDeadlineFocused(true)}
            onBlur={() => setDeadlineFocused(false)}
          />
        </View>

        {/* Image Upload */}
        <View style={globalStyles.inputGroup}>
          <Text style={globalStyles.label}>
            Collaboration Images (optional)
            <Text style={styles.multiHint}>
              {"  "}
              {imageUrls.length}/{MAX_COLLABORATION_IMAGES}
            </Text>
          </Text>

          {/* Image Grid Preview */}
          {imageUrls.length > 0 && (
            <View style={styles.imageGrid}>
              {imageUrls.map((url, index) => (
                <View key={index} style={styles.imagePreviewContainer}>
                  <Image
                    source={{ uri: url }}
                    style={styles.imagePreview}
                    resizeMode="cover"
                  />
                  <TouchableOpacity
                    style={styles.removeImageButton}
                    onPress={() =>
                      setImageUrls((prev) => prev.filter((_, i) => i !== index))
                    }
                  >
                    <Text style={styles.removeImageText}>✕</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}

          {/* Add Image Button */}
          {imageUrls.length < MAX_COLLABORATION_IMAGES && (
            <TouchableOpacity
              style={styles.imagePickerButton}
              onPress={() =>
                pickCollaborationImages(imageUrls, (updated) =>
                  setImageUrls(updated),
                )
              }
              disabled={imageUploading}
              activeOpacity={0.7}
            >
              {imageUploading ? (
                <ActivityIndicator color={colors.primary} />
              ) : (
                <>
                  <Text style={styles.imagePickerIcon}>🖼️</Text>
                  <Text style={styles.imagePickerText}>
                    {imageUrls.length === 0
                      ? "Tap to add images"
                      : "Tap to add more"}
                  </Text>
                  <Text style={styles.imagePickerSubText}>
                    {MAX_COLLABORATION_IMAGES - imageUrls.length} slot(s)
                    remaining • Max 5MB each
                  </Text>
                </>
              )}
            </TouchableOpacity>
          )}
        </View>

        {/* Status Selector */}
        <SingleSelector
          label="Status"
          options={STATUSES}
          selected={status}
          onSelect={setStatus}
        />

        {/* Status hint */}
        <Text style={styles.statusHint}>
          {status === "closed"
            ? "Closed collaborations will not accept new applications"
            : "Open collaborations are visible to all influencers"}
        </Text>

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
  selectorContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  selectorChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  selectorChipActive: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primary,
  },
  selectorChipText: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.textSecondary,
  },
  selectorChipTextActive: {
    color: colors.primary,
  },
  multiHint: {
    fontSize: 11,
    fontWeight: "400",
    color: colors.textMuted,
  },
  statusHint: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: -8,
    marginBottom: 24,
    paddingHorizontal: 4,
  },
  imageGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 10,
  },
  imagePreviewContainer: {
    width: "48%",
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.border,
  },
  imagePreview: {
    width: "100%",
    height: 100,
  },
  removeImageButton: {
    padding: 6,
    alignItems: "center",
    backgroundColor: "#FFEBEE",
  },
  removeImageText: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.error,
  },
  imagePickerButton: {
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 12,
    borderStyle: "dashed",
    paddingVertical: 32,
    alignItems: "center",
    backgroundColor: colors.surface,
    gap: 6,
  },
  imagePickerIcon: {
    fontSize: 32,
    marginBottom: 4,
  },
  imagePickerText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.textSecondary,
  },
  imagePickerSubText: {
    fontSize: 12,
    color: colors.textMuted,
  },
});

export default EditCollaborationScreen;
