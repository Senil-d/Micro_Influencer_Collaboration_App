import React, { useState, useRef } from "react";
import {
  View,
  Image,
  ScrollView,
  StyleSheet,
  Dimensions,
  Text,
} from "react-native";
import { colors } from "../utils/globalStyles";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const ImageCarousel = ({
  imageUrls,
  height = 220,
  categoryEmoji = "📢",
  category = "",
}) => {
  const [activeIndex, setActiveIndex] = useState(0);

  // Handle Scroll
  const handleScroll = (event) => {
    const scrollPosition = event.nativeEvent.contentOffset.x;
    const index = Math.round(scrollPosition / SCREEN_WIDTH);
    setActiveIndex(index);
  };

  // No Images — show placeholder
  if (!imageUrls || imageUrls.length === 0) {
    return (
      <View style={[styles.placeholder, { height }]}>
        <Text style={styles.placeholderEmoji}>{categoryEmoji}</Text>
        {category ? (
          <Text style={styles.placeholderCategory}>{category}</Text>
        ) : null}
      </View>
    );
  }

  // Single Image — no carousel needed
  if (imageUrls.length === 1) {
    return (
      <Image
        source={{ uri: imageUrls[0] }}
        style={[styles.singleImage, { height }]}
        resizeMode="cover"
      />
    );
  }

  // Multiple Images — carousel
  return (
    <View style={{ height }}>
      {/* Scrollable Images */}
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        {imageUrls.map((url, index) => (
          <Image
            key={index}
            source={{ uri: url }}
            style={[styles.carouselImage, { height, width: SCREEN_WIDTH }]}
            resizeMode="cover"
          />
        ))}
      </ScrollView>

      {/* Dot Indicators */}
      <View style={styles.dotsContainer}>
        {imageUrls.map((_, index) => (
          <View
            key={index}
            style={[styles.dot, activeIndex === index && styles.dotActive]}
          />
        ))}
      </View>

      {/* Image Counter */}
      <View style={styles.counter}>
        <Text style={styles.counterText}>
          {activeIndex + 1}/{imageUrls.length}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  placeholder: {
    width: "100%",
    backgroundColor: colors.primaryLight,
    justifyContent: "center",
    alignItems: "center",
  },
  placeholderEmoji: {
    fontSize: 64,
    marginBottom: 8,
  },
  placeholderCategory: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.primary,
  },
  singleImage: {
    width: "100%",
  },
  carouselImage: {
    flex: 1,
  },
  dotsContainer: {
    position: "absolute",
    bottom: 12,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "rgba(255,255,255,0.5)",
  },
  dotActive: {
    width: 18,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.white,
  },
  counter: {
    position: "absolute",
    top: 12,
    right: 12,
    backgroundColor: "rgba(0,0,0,0.4)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  counterText: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.white,
  },
});

export default ImageCarousel;
