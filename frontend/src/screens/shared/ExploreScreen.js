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
  ScrollView,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import api from "../../api/axios";
import { colors, globalStyles } from "../../utils/globalStyles";

const PLATFORMS = [
  "All",
  "Instagram",
  "TikTok",
  "YouTube",
  "Twitter",
  "Facebook",
  "Other",
];
const CATEGORIES = [
  "All",
  "Fashion",
  "Food",
  "Tech",
  "Fitness",
  "Beauty",
  "Travel",
  "Gaming",
  "Other",
];

const ExploreScreen = ({ navigation }) => {
  const [collaborations, setCollaborations] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState("All");
  const [selectedCategory, setSelectedCategory] = useState("All");

  // Fetch Collaborations
  const fetchCollaborations = async (isRefresh = false) => {
    if (isRefresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }

    try {
      const params = {};
      if (selectedPlatform !== "All") params.platform = selectedPlatform;
      if (selectedCategory !== "All") params.category = selectedCategory;

      const response = await api.get("/collaborations", { params });
      setCollaborations(response.data.collaborations);
    } catch (error) {
      Alert.alert(
        "Error",
        error.response?.data?.message || "Failed to fetch collaborations",
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
      fetchCollaborations();
    }, [selectedPlatform, selectedCategory]),
  );

  // Collaboration Card
  const CollaborationCard = ({ item }) => {
    const hasImage = item.imageUrl && item.imageUrl !== "";

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() =>
          navigation.navigate("CollaborationDetail", {
            collaborationId: item._id,
          })
        }
        activeOpacity={0.9}
      >
        {/* Image */}
        {hasImage ? (
          <Image
            source={{ uri: item.imageUrl }}
            style={styles.cardImage}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.cardImagePlaceholder}>
            <Text style={styles.cardImagePlaceholderText}>
              {item.category === "Fashion"
                ? "👗"
                : item.category === "Food"
                  ? "🍔"
                  : item.category === "Tech"
                    ? "💻"
                    : item.category === "Fitness"
                      ? "💪"
                      : item.category === "Beauty"
                        ? "💄"
                        : item.category === "Travel"
                          ? "✈️"
                          : item.category === "Gaming"
                            ? "🎮"
                            : "📢"}
            </Text>
            <Text style={styles.cardImagePlaceholderCategory}>
              {item.category}
            </Text>
          </View>
        )}

        {/* Content */}
        <View style={styles.cardContent}>
          {/* Brand Info */}
          <TouchableOpacity
            onPress={() =>
              navigation.navigate("UserProfile", {
                userId: item.createdBy._id,
              })
            }
            style={[globalStyles.row, { gap: 8, marginBottom: 10 }]}
          >
            {/* Brand Avatar */}
            {item.createdBy.profileImage ? (
              <Image
                source={{ uri: item.createdBy.profileImage }}
                style={styles.brandAvatar}
              />
            ) : (
              <View style={styles.brandAvatarPlaceholder}>
                <Text style={styles.brandAvatarText}>
                  {item.createdBy.name.charAt(0).toUpperCase()}
                </Text>
              </View>
            )}
            <View>
              <Text style={styles.brandName}>{item.createdBy.name}</Text>
              <Text style={styles.brandLabel}>Brand</Text>
            </View>
          </TouchableOpacity>

          {/* Title */}
          <Text style={styles.cardTitle} numberOfLines={2}>
            {item.title}
          </Text>

          {/* Description */}
          <Text style={styles.cardDescription} numberOfLines={2}>
            {item.description}
          </Text>

          {/* Platform Tags */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.tagsScroll}
          >
            <View style={[globalStyles.row, { gap: 6 }]}>
              {Array.isArray(item.platform) ? (
                item.platform.map((p) => (
                  <View key={p} style={styles.tag}>
                    <Text style={styles.tagText}>{p}</Text>
                  </View>
                ))
              ) : (
                <View style={styles.tag}>
                  <Text style={styles.tagText}>{item.platform}</Text>
                </View>
              )}
              <View style={styles.categoryTag}>
                <Text style={styles.categoryTagText}>{item.category}</Text>
              </View>
            </View>
          </ScrollView>

          {/* Budget & Deadline */}
          <View
            style={[
              globalStyles.row,
              { justifyContent: "space-between", marginTop: 12 },
            ]}
          >
            <View>
              <Text style={styles.budgetLabel}>Budget</Text>
              <Text style={styles.budget}>${item.budget}</Text>
            </View>
            <View style={{ alignItems: "flex-end" }}>
              <Text style={styles.deadlineLabel}>Deadline</Text>
              <Text style={styles.deadline}>
                {new Date(item.deadline).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  // Filter Chip
  const FilterChip = ({ label, selected, onPress }) => (
    <TouchableOpacity
      style={[styles.filterChip, selected && styles.filterChipActive]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text
        style={[styles.filterChipText, selected && styles.filterChipTextActive]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  // Empty State
  const EmptyState = () => (
    <View style={globalStyles.emptyContainer}>
      <Text style={styles.emptyEmoji}>🔍</Text>
      <Text style={globalStyles.emptyText}>No collaborations found</Text>
      <Text style={globalStyles.emptySubText}>
        Try changing your filters or check back later
      </Text>
    </View>
  );

  return (
    <View style={globalStyles.container}>
      {/* Header */}
      <View style={globalStyles.screenHeader}>
        <Text style={globalStyles.screenTitle}>Explore</Text>
        <Text style={globalStyles.screenSubtitle}>
          {collaborations.length} open collaborations
        </Text>
      </View>

      {/* Filters */}
      <View style={styles.filtersContainer}>
        {/* Platform Filter */}
        <Text style={styles.filterLabel}>Platform</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterRow}
        >
          {PLATFORMS.map((platform) => (
            <FilterChip
              key={platform}
              label={platform}
              selected={selectedPlatform === platform}
              onPress={() => setSelectedPlatform(platform)}
            />
          ))}
        </ScrollView>

        {/* Category Filter */}
        <Text style={[styles.filterLabel, { marginTop: 10 }]}>Category</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterRow}
        >
          {CATEGORIES.map((category) => (
            <FilterChip
              key={category}
              label={category}
              selected={selectedCategory === category}
              onPress={() => setSelectedCategory(category)}
            />
          ))}
        </ScrollView>
      </View>

      {/* Collaborations List */}
      {isLoading ? (
        <View style={globalStyles.centered}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={collaborations}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => <CollaborationCard item={item} />}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={() => fetchCollaborations(true)}
              colors={[colors.primary]}
            />
          }
          ListEmptyComponent={<EmptyState />}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  filtersContainer: {
    backgroundColor: colors.surface,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  filterLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  filterRow: {
    gap: 8,
    paddingRight: 8,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.textSecondary,
  },
  filterChipTextActive: {
    color: colors.white,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
    flexGrow: 1,
    gap: 16,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  cardImage: {
    width: "100%",
    height: 180,
  },
  cardImagePlaceholder: {
    width: "100%",
    height: 180,
    backgroundColor: colors.primaryLight,
    justifyContent: "center",
    alignItems: "center",
  },
  cardImagePlaceholderText: {
    fontSize: 48,
    marginBottom: 8,
  },
  cardImagePlaceholderCategory: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.primary,
  },
  cardContent: {
    padding: 16,
  },
  brandAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  brandAvatarPlaceholder: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primaryLight,
    justifyContent: "center",
    alignItems: "center",
  },
  brandAvatarText: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.primary,
  },
  brandName: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  brandLabel: {
    fontSize: 11,
    color: colors.textMuted,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: colors.textPrimary,
    marginBottom: 6,
    lineHeight: 24,
  },
  cardDescription: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: 12,
  },
  tagsScroll: {
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
  budgetLabel: {
    fontSize: 11,
    color: colors.textMuted,
    fontWeight: "600",
    marginBottom: 2,
  },
  budget: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  deadlineLabel: {
    fontSize: 11,
    color: colors.textMuted,
    fontWeight: "600",
    marginBottom: 2,
  },
  deadline: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: "600",
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: 16,
  },
});

export default ExploreScreen;
