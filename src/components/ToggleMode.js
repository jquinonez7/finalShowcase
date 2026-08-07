import React from "react";
import { View, Image, Pressable, StyleSheet } from "react-native";

const GHOST_LOGO = require("../../assets/snapchat/ghostlogo.png");
const JOURNAL_ICON = require("../../assets/JournalIcon.png");

/**
 * Normal / Journal switch, pinned to the left edge of the camera as a single
 * vertical track with two icon options — ghost for Normal, book for Journal.
 * The active option reads as a thumb sliding inside the track.
 */
export default function ToggleMode({
  activeSwitch = 1,
  accentColor = "#FFFC00",
  onChange,
  top = 110,
}) {
  const isNormal = activeSwitch === 1;

  return (
    // box-none so the wrapper doesnt eat taps meant for the camera
    <View style={[styles.wrapper, { top }]} pointerEvents="box-none">
      <View style={styles.track}>
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ selected: isNormal }}
          style={[styles.option, isNormal && { backgroundColor: accentColor }]}
          onPress={() => onChange?.(1)}
        >
          <Image
            source={GHOST_LOGO}
            style={[styles.icon, { tintColor: isNormal ? "#000" : "#fff" }]}
            resizeMode="contain"
          />
        </Pressable>

        <Pressable
          accessibilityRole="button"
          accessibilityState={{ selected: !isNormal }}
          style={[styles.option, !isNormal && { backgroundColor: accentColor }]}
          onPress={() => onChange?.(2)}
        >
          <Image
            source={JOURNAL_ICON}
            style={[styles.icon, { tintColor: isNormal ? "#fff" : "#000" }]}
            resizeMode="contain"
          />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: "absolute",
    left: 16,
  },

  // one continuous pill — this is what makes it read as a single control
  track: {
    width: 56,
    borderRadius: 28,
    backgroundColor: "rgba(0,0,0,0.35)",
    padding: 4,
  },

  option: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },

  icon: {
    width: 26,
    height: 26,
  },
});