import React from "react";
import { Text, TouchableOpacity, StyleSheet } from "react-native";

/**
 * Placeholder. Renders the button and nothing else, the actual save
 * logic goes in the handler below later.
 *
 * Takes the uris rather than an onPress so the save can be wired up
 * inside here without the parent needing to change.
 */
export default function SaveSnap({ photoUri, videoUri }) {
  const handlePress = () => {
    console.log("[hub] save tapped", { photoUri, videoUri });
  };

  return (
    <TouchableOpacity
      style={styles.button}
      onPress={handlePress}
      accessibilityRole="button"
      accessibilityLabel="Save this snap to your hub"
    >
      <Text style={styles.text}>↓</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: "#555555",
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: 24,
  },

  text: {
    color: "#fff",
    fontWeight: "800",
  },
});