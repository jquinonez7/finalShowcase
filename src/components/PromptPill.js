import React, { useEffect, useRef } from "react";
import { Text, StyleSheet, Animated } from "react-native";

/**
 * The chosen prompt, parked at the top of the screen.
 *
 * Shown on the camera after Start and again on the preview, so the
 * user always sees what they were answering.
 *
 * onPress is optional, pass it on the camera to let them change their
 * mind and go back to the picker.
 */
export default function PromptPill({ prompt, top = 120, onPress }) {
  // slides down and fades in, so it reads as the card moving up here
  // rather than a new thing appearing
  const enter = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(enter, {
      toValue: 1,
      duration: 260,
      useNativeDriver: true,
    }).start();
  }, [enter]);

  if (!prompt) return null;

  const translateY = enter.interpolate({
    inputRange: [0, 1],
    outputRange: [-16, 0],
  });

  return (
    <Animated.View
      style={[styles.pill, { top, opacity: enter, transform: [{ translateY }] }]}
      onTouchEnd={onPress}
    >
      <Text style={styles.text} numberOfLines={2}>
        {prompt}
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  // translucent so the camera reads through it
  pill: {
    position: "absolute",
    left: 16,
    right: 16,
    backgroundColor: "rgba(255,255,255,0.78)",
    borderRadius: 24,
    paddingVertical: 12,
    paddingHorizontal: 20,
  },

  text: {
    color: "#111",
    fontSize: 12,
    fontWeight: "600",
    textAlign: "center",
  },
});