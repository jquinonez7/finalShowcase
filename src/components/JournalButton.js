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

/**
 * Journal mode. Saves the capture as a private entry, which is what
 * the Hub screen will read back later.
 *
 * Same table as Thoughts, the only difference is privacy_status.
 * onDone fires after a successful save so the parent can close.
 */
export default function SaveToHub({ photoUri, videoUri, onDone }) {
  const [saving, setSaving] = useState(false);

  const handlePress = async () => {
    // the upload takes a moment, so block repeat taps rather than
    // writing the same entry twice
    if (saving) return;
    setSaving(true);

    try {
      await saveDiaryEntry({
        photoUri,
        videoUri,
        // private means only the author sees it, unlike Thoughts
        privacyStatus: "private",
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
    minWidth: 130,
    minHeight: 44,
  },

  buttonSaving: {
    opacity: 0.7,
  },

  label: {
    color: "#1A1033",
    fontWeight: "800",
    fontSize: 15,
  },
});