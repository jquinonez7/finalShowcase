import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Image,
  useWindowDimensions,
} from "react-native";

export default function DiscoverFeed({ title, subtitle, uri }) {
  const { width } = useWindowDimensions();
  const cardWidth = (width - 12 * 2 - 12) / 2; // container padding + gap

  return (
    <Pressable style={[styles.card, { width: cardWidth }]}>
      <Image source={{ uri }} style={styles.image} />
      {subtitle && (
        <View style={styles.captionPill}>
          <Text style={styles.star}>⭐</Text>
          <Text style={styles.captionText} numberOfLines={2}>
            {subtitle}
          </Text>
        </View>
      )}
      <View style={styles.footer}>
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    aspectRatio: 9 / 14,
    borderRadius: 14,
    overflow: "hidden",
    backgroundColor: "#111",
  },
  image: {
    ...StyleSheet.absoluteFillObject,
    width: "100%",
    height: "100%",
  },
  captionPill: {
    position: "absolute",
    top: 8,
    left: 8,
    right: 8,
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "rgba(0,0,0,0.55)",
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 4,
  },
  star: {
    fontSize: 11,
    marginRight: 4,
  },
  captionText: {
    color: "#fff",
    fontSize: 11,
    flex: 1,
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 8,
    backgroundColor: "rgba(0,0,0,0.35)",
  },
  title: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
  },
});