import React from "react";
import { Text, TouchableOpacity, StyleSheet } from "react-native";

/**
 * Discards the capture without saving it anywhere. Nothing is written
 * to storage or the table, the local file just gets left behind.
 *
 * onPress comes from the parent because closing needs the video player
 * and navigation, both of which live up in PreviewScreen.
 */
export default function LetItGoButton({ onPress }) {
  return (
    <TouchableOpacity
      style={styles.button}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel="Discard this without saving"
    >
      <Text style={styles.text}>Let It Go</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255, 0, 0, 0.6)",
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: 24,
    minHeight: 44,
  },

  text: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 15,
  },
});