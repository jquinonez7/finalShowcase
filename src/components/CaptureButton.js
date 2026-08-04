import React from "react";
import { Pressable, StyleSheet, View } from "react-native";

// hold past this and it records instead of taking a photo
export const HOLD_THRESHOLD_MS = 250;

const RING_SIZE = 82;
const RING_STROKE = 6;

/**
 * Tap for a photo, hold for video.
 *
 * Purely presentational, the parent owns the camera and the recording.
 * Two looks only: hollow ring at rest, solid accent while recording.
 *
 * state: "idle" | "pressed" | "recording"
 * accentColor: fill while recording, so the mode can retheme it
 */
export default function CaptureButton({
  state,
  accentColor = "#FFFC00",
  onPressIn,
  onPress,
  onLongPress,
  onPressOut,
}) {
  const isRecording = state === "recording";

  return (
    // onPressIn fires instantly, onLongPress at the threshold, onPress
    // only when the long press never fired, onPressOut on every release
    <Pressable
      style={styles.wrapper}
      onPressIn={onPressIn}
      onPress={onPress}
      onLongPress={onLongPress}
      onPressOut={onPressOut}
      delayLongPress={HOLD_THRESHOLD_MS}
    >
      {/* border makes the ring, so idle and recording are the same view
          with different colors rather than two separate shapes */}
      <View
        style={[
          styles.ring,
          // the accent tints the outline at rest too, so the mode is
          // readable before you ever press it
          { borderColor: accentColor },
          isRecording && { backgroundColor: accentColor },
        ]}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignSelf: "center",
    marginBottom: 140,
  },

  ring: {
    width: RING_SIZE,
    height: RING_SIZE,
    // half the size, makes the square a circle
    borderRadius: RING_SIZE / 2,
    borderWidth: RING_STROKE,
    backgroundColor: "transparent",
  },
});