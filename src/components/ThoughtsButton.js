import React from "react";
import { Text, TouchableOpacity, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";

/**
 * Journal mode. Opens the send sheet so the user can pick where the
 * capture goes, including the Diary Hub.
 *
 * No saving happens here, SendToScreen owns that once a destination
 * has been chosen.
 */
export default function ThoughtsButton({ photoUri, videoUri, promptText, mood }) {
  const navigation = useNavigation();

  const handlePress = () => {
    navigation.navigate("SendTo", { photoUri, videoUri, promptText, mood });
  };

  return (
    <TouchableOpacity
      style={styles.button}
      onPress={handlePress}
      accessibilityRole="button"
      accessibilityLabel="Choose where to send this"
    >
      <Text style={styles.label}>Thoughts ▸</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(10, 148, 235, 0.85)",
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 24,
    minHeight: 44,
  },

  label: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 15,
  },
});