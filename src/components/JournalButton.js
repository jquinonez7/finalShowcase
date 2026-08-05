import React, { useState } from "react";
import {
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";

import { saveDiaryEntry } from "../../utils/hooks/diary";

const PURPLE = "#B69CFF";

// journal mode. saves the capture as a private entry for the hub
export default function SaveToHub({
  photoUri,
  videoUri,
  promptText,
  mood,
  onDone,
}) {
  const [saving, setSaving] = useState(false);

  const handlePress = async () => {
    // block repeat taps so one capture cant write two rows
    if (saving) return;
    setSaving(true);

    try {
      await saveDiaryEntry({
        photoUri,
        videoUri,
        // private means only the author sees it, unlike Thoughts
        privacyStatus: "private",
        promptText,
        mood,
      });

      onDone?.();
    } catch (error) {
      console.log("[hub] save failed:", error.message);
      Alert.alert("Couldn't save", "Something went wrong. Try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <TouchableOpacity
      style={[styles.button, saving && styles.buttonSaving]}
      onPress={handlePress}
      disabled={saving}
      accessibilityRole="button"
      accessibilityLabel="Save to your hub"
    >
      {saving ? (
        <ActivityIndicator size="small" color="#1A1033" />
      ) : (
        <Text style={styles.label}>Save to Hub</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: PURPLE,
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: 24,
    // keeps the pill from collapsing when the spinner swaps in
    minWidth: 130,
    minHeight: 44,
  },

  buttonSaving: {
    opacity: 0.7,
  },

  label: {
    // dark text since the purple is light
    color: "#1A1033",
    fontWeight: "800",
    fontSize: 15,
  },
});