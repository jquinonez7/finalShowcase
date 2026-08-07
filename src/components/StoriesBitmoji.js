import React from "react";
import { View, Text, StyleSheet, Pressable, Image } from "react-native";
import { colors } from "../../assets/themes/colors";

const RING_SIZE = 84;

export default function StoriesBitmoji({ name, uri, hasBadge, onPress }) {
  return (
    <Pressable style={styles.container} onPress={onPress}>
      <View style={styles.ring}>
        <Image source={{ uri }} style={styles.avatar} />
      </View>
      {hasBadge && (
        <View style={styles.badge}>
          <Text style={styles.badgeIcon}>👤+</Text>
        </View>
      )}
      <Text style={styles.name} numberOfLines={1}>
        {name}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    width: RING_SIZE + 12,
    marginRight: 12,
  },
  ring: {
    width: RING_SIZE,
    height: RING_SIZE,
    borderRadius: RING_SIZE / 2,
    borderWidth: 3,
    borderColor: "#B026FF",
    padding: 3,
    alignItems: "center",
    justifyContent: "center",
  },
  avatar: {
    width: "100%",
    height: "100%",
    borderRadius: RING_SIZE / 2,
    backgroundColor: "#eee",
  },
  badge: {
    position: "absolute",
    bottom: 22,
    right: 4,
    backgroundColor: "#B026FF",
    borderRadius: 12,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  badgeIcon: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "700",
  },
  name: {
    marginTop: 6,
    fontSize: 13,
    fontWeight: "600",
    color: colors.primary,
    textAlign: "center",
  },
});