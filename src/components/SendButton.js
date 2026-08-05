import React from "react";
import { Text, TouchableOpacity, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";

/**
 * Placeholder. Renders the button and nothing else, the actual save
 * logic goes in the handler below later.
 *
 * Takes the uris rather than an onPress so the save can be wired up
 * inside here without the parent needing to change.
 */
export default function SendButton({ photoUri, videoUri }) {
  const navigation = useNavigation();

  return (
    <TouchableOpacity
      style={styles.button}
      onPress={() => navigation.navigate("Preview", { photoUri, videoUri })}
    >
      <Text style={styles.text}>Send To ▸</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: "#fbff0b",
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: 24,
  },

  text: {
    color: "#090909",
    fontWeight: "800",
  },
});